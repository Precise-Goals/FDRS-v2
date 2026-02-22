import 'dart:async';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:location/location.dart';
import 'package:permission_handler/permission_handler.dart'
    as permission_handler;

import 'database_service.dart';
import 'distress_service.dart';
import 'service_locator.dart';

/// Result of an SOS attempt.
enum SosResult {
  success,
  sentViaRadio,
  queued,
  permissionDenied,
  locationDisabled,
  error,
}

class LocationService {
  final Location _location = Location();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  Timer? _sosTimer;
  int _sosTicks = 0;
  static const int _maxSosTicks = 720; // 1 hour at 5-second intervals

  /// Requests location permission at runtime.
  /// Returns true if permission is granted.
  Future<bool> requestPermissions() async {
    final status = await permission_handler.Permission.location.request();
    return status.isGranted;
  }

  /// Sends an SOS distress signal via the three-tier fallback chain:
  ///   1. Firebase RTDB (5 s timeout)
  ///   2. Radio link   (simulated placeholder)
  ///   3. Offline cache (auto-retry on reconnect)
  Future<SosResult> sendSOS(String? userId) async {
    try {
      // Step 1: Request permission
      final hasPermission = await requestPermissions();
      if (!hasPermission) {
        debugPrint('[SOS] Location permission denied');
        return SosResult.permissionDenied;
      }

      // Step 2: Ensure location service is enabled
      bool serviceEnabled = await _location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _location.requestService();
        if (!serviceEnabled) {
          debugPrint('[SOS] Location service disabled');
          return SosResult.locationDisabled;
        }
      }

      // Step 3: Get exact location
      final locationData = await _location.getLocation();
      final double latitude = locationData.latitude ?? 0.0;
      final double longitude = locationData.longitude ?? 0.0;

      // Step 4: Get device build number
      String buildNumber = 'unknown';
      try {
        final androidInfo = await _deviceInfo.androidInfo;
        buildNumber = androidInfo.display;
      } catch (e) {
        debugPrint('[SOS] Could not get device info: $e');
      }

      // Step 5: Exact UTC timestamp
      final String timestamp = DateTime.now().toUtc().toIso8601String();

      // Step 6: Deliver via fallback chain
      final distressService = locator<DistressService>();
      final result = await distressService.deliver(
        userId: userId ?? 'anonymous',
        latitude: latitude,
        longitude: longitude,
        buildNumber: buildNumber,
        timestamp: timestamp,
      );

      // Map delivery result to SosResult
      switch (result) {
        case DistressDeliveryResult.sentViaRtdb:
          _startRealtimeSOS(userId, buildNumber);
          return SosResult.success;
        case DistressDeliveryResult.sentViaRadio:
          return SosResult.sentViaRadio;
        case DistressDeliveryResult.queued:
          return SosResult.queued;
        case DistressDeliveryResult.failed:
          return SosResult.error;
      }
    } catch (e) {
      debugPrint('[SOS] Unexpected error: $e');
      return SosResult.error;
    }
  }

  /// Starts a periodic background timer that updates the RTDB with fresh coordinates
  /// every 5 seconds for exactly 1 hour. It then deletes the signal automatically.
  void _startRealtimeSOS(String? userId, String buildNumber) {
    // Cancel any existing background SOS broadcast first to prevent overlaps
    _sosTimer?.cancel();
    _sosTicks = 0;

    _sosTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
      _sosTicks++;

      if (_sosTicks >= _maxSosTicks) {
        debugPrint('[SOS] 1 hour elapsed. Stopping emergency broadcast.');
        _sosTimer?.cancel();
        locator<DatabaseService>().deleteDistressSignal(
          userId: userId ?? 'anonymous',
          buildNumber: buildNumber,
        );
        return;
      }

      try {
        final locationData = await _location.getLocation();
        final double latitude = locationData.latitude ?? 0.0;
        final double longitude = locationData.longitude ?? 0.0;
        final String timestamp = DateTime.now().toUtc().toIso8601String();

        // Update the RTDB silently in the background
        await locator<DatabaseService>().sendDistressSignal(
          userId: userId ?? 'anonymous',
          latitude: latitude,
          longitude: longitude,
          buildNumber: buildNumber,
          timestamp: timestamp,
        );
        debugPrint(
            '[SOS Tracking] Updated position - Tick: $_sosTicks/$_maxSosTicks');
      } catch (e) {
        debugPrint('[SOS Tracking] Update failed on tick $_sosTicks: $e');
      }
    });

    debugPrint('[SOS Tracking] Realtime 1-hour session started for $userId');
  }
}
