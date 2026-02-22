import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:nearby_connections/nearby_connections.dart';
import 'package:permission_handler/permission_handler.dart';
import '../theme/app_theme.dart';

class ChatMessage {
  final String text;
  final bool isMe;
  final DateTime time;

  ChatMessage({required this.text, required this.isMe, required this.time});
}

class DiscoveredDevice {
  final String id;
  final String name;

  DiscoveredDevice(this.id, this.name);
}

class BluetoothQuitchatScreen extends StatefulWidget {
  const BluetoothQuitchatScreen({super.key});

  @override
  State<BluetoothQuitchatScreen> createState() =>
      _BluetoothQuitchatScreenState();
}

class _BluetoothQuitchatScreenState extends State<BluetoothQuitchatScreen> {
  final String _userName = "FDRS_User_${DateTime.now().millisecond}";
  final Strategy _strategy = Strategy.P2P_STAR; // Best for 1-to-N or 1-to-1

  bool _isAdvertising = false;
  bool _isDiscovering = false;

  String? _connectedEndpointId;
  String _targetDeviceName = "";

  final List<DiscoveredDevice> _discoveredDevices = [];
  final List<ChatMessage> _messages = [];

  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    Map<Permission, PermissionStatus> statuses = await [
      Permission.bluetooth,
      Permission.bluetoothAdvertise,
      Permission.bluetoothConnect,
      Permission.bluetoothScan,
      Permission.location,
      Permission.nearbyWifiDevices,
    ].request();

    bool allGranted = statuses.values.every((status) => status.isGranted);

    if (!allGranted && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Permissions are required for P2P connection to work.'),
          duration: Duration(seconds: 4),
        ),
      );
    }
  }

  void _startAdvertising() async {
    try {
      bool a = await Nearby().startAdvertising(
        _userName,
        _strategy,
        onConnectionInitiated: _onConnectionInit,
        onConnectionResult: _onConnectionResult,
        onDisconnected: _onDisconnected,
      );
      setState(() {
        _isAdvertising = a;
      });
    } catch (e) {
      debugPrint("Advertising error: $e");
    }
  }

  void _stopAdvertising() async {
    await Nearby().stopAdvertising();
    setState(() {
      _isAdvertising = false;
    });
  }

  void _startDiscovery() async {
    try {
      bool a = await Nearby().startDiscovery(
        _userName,
        _strategy,
        onEndpointFound: (id, name, serviceId) {
          setState(() {
            _discoveredDevices.add(DiscoveredDevice(id, name));
          });
        },
        onEndpointLost: (id) {
          setState(() {
            _discoveredDevices.removeWhere((device) => device.id == id);
          });
        },
      );
      setState(() {
        _isDiscovering = a;
      });
    } catch (e) {
      debugPrint("Discovery error: $e");
    }
  }

  void _stopDiscovery() async {
    await Nearby().stopDiscovery();
    setState(() {
      _isDiscovering = false;
      _discoveredDevices.clear();
    });
  }

  void _connectToDevice(String endpointId) async {
    try {
      await Nearby().requestConnection(
        _userName,
        endpointId,
        onConnectionInitiated: _onConnectionInit,
        onConnectionResult: _onConnectionResult,
        onDisconnected: _onDisconnected,
      );
    } catch (e) {
      debugPrint("Connection request error: $e");
    }
  }

  void _onConnectionInit(String id, ConnectionInfo info) {
    showModalBottomSheet(
      context: context,
      builder: (builder) {
        return Container(
          color: AppTheme.panelGray,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Connection Request",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                "${info.endpointName} wants to chat.",
                style: const TextStyle(color: Colors.white70, fontSize: 16),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent),
                    onPressed: () {
                      Nearby().rejectConnection(id);
                      Navigator.pop(context);
                    },
                    child: const Text("Reject"),
                  ),
                  ElevatedButton(
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                    onPressed: () {
                      Nearby().acceptConnection(
                        id,
                        onPayLoadRecieved: (endpointId, payload) {
                          if (payload.type == PayloadType.BYTES) {
                            String msgString =
                                utf8.decode(payload.bytes!.toList()).trim();
                            if (msgString.isNotEmpty) {
                              setState(() {
                                _messages.add(ChatMessage(
                                  text: msgString,
                                  isMe: false,
                                  time: DateTime.now(),
                                ));
                              });
                              _scrollToBottom();
                            }
                          }
                        },
                        onPayloadTransferUpdate: (endpointId, update) {},
                      );
                      setState(() {
                        _targetDeviceName = info.endpointName;
                      });
                      Navigator.pop(context);
                    },
                    child: const Text("Accept"),
                  ),
                ],
              )
            ],
          ),
        );
      },
    );
  }

  void _onConnectionResult(String id, Status status) {
    if (status == Status.CONNECTED) {
      setState(() {
        _connectedEndpointId = id;
        _messages.clear();
        _stopAdvertising();
        _stopDiscovery();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connected via P2P')),
      );
    } else {
      debugPrint("Connection failed or rejected: $status");
    }
  }

  void _onDisconnected(String id) {
    setState(() {
      _connectedEndpointId = null;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Disconnected from peer')),
      );
    }
  }

  void _sendMessage() async {
    String text = _messageController.text.trim();
    if (text.isEmpty || _connectedEndpointId == null) {
      return;
    }

    try {
      await Nearby().sendBytesPayload(
          _connectedEndpointId!, Uint8List.fromList(utf8.encode(text)));
      setState(() {
        _messages.add(ChatMessage(
          text: text,
          isMe: true,
          time: DateTime.now(),
        ));
        _messageController.clear();
      });
      _scrollToBottom();
    } catch (e) {
      debugPrint("Error sending payload: $e");
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _disconnect() async {
    if (_connectedEndpointId != null) {
      await Nearby().disconnectFromEndpoint(_connectedEndpointId!);
      setState(() {
        _connectedEndpointId = null;
      });
    }
  }

  @override
  void dispose() {
    _stopAdvertising();
    _stopDiscovery();
    if (_connectedEndpointId != null) {
      Nearby().disconnectFromEndpoint(_connectedEndpointId!);
    }
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.trueBlack,
      appBar: AppBar(
        title: Text(_connectedEndpointId != null
            ? 'Chat: $_targetDeviceName'
            : 'P2P Quitchat'),
        backgroundColor: AppTheme.panelGray,
        actions: [
          if (_connectedEndpointId != null)
            IconButton(
              icon: const Icon(Icons.close, color: Colors.redAccent),
              onPressed: _disconnect,
            )
        ],
      ),
      body: _connectedEndpointId != null
          ? _buildChatView()
          : _buildDiscoveryView(),
    );
  }

  Widget _buildDiscoveryView() {
    return Column(
      children: [
        SwitchListTile(
          title: const Text('Host Chat (Advertising)'),
          subtitle: const Text('Allow others to find and connect to you'),
          value: _isAdvertising,
          onChanged: (bool value) {
            if (value) {
              _startAdvertising();
            } else {
              _stopAdvertising();
            }
          },
          activeThumbColor: AppTheme.accentRed,
        ),
        const Divider(),
        SwitchListTile(
          title: const Text('Search for Chat (Discovery)'),
          subtitle: const Text('Look for nearby hosts to join'),
          value: _isDiscovering,
          onChanged: (bool value) {
            if (value) {
              _startDiscovery();
            } else {
              _stopDiscovery();
            }
          },
          activeThumbColor: Colors.blue,
        ),
        const Divider(),
        const Padding(
          padding: EdgeInsets.all(8.0),
          child: Text("Nearby Devices",
              style: TextStyle(
                  color: Colors.white54, fontWeight: FontWeight.bold)),
        ),
        Expanded(
          child: _discoveredDevices.isEmpty
              ? Center(
                  child: Text(
                      _isDiscovering
                          ? 'Scanning for nearby devices...'
                          : 'Discovery inactive',
                      style: const TextStyle(color: Colors.white38)))
              : ListView.builder(
                  itemCount: _discoveredDevices.length,
                  itemBuilder: (context, index) {
                    DiscoveredDevice device = _discoveredDevices[index];
                    return ListTile(
                      leading: const Icon(Icons.phone_android,
                          color: Colors.white70),
                      title: Text(device.name,
                          style: const TextStyle(color: Colors.white)),
                      subtitle: Text(device.id,
                          style: const TextStyle(color: Colors.white54)),
                      trailing: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue.withAlpha(50),
                          foregroundColor: Colors.blue,
                        ),
                        onPressed: () => _connectToDevice(device.id),
                        child: const Text('Connect'),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildChatView() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              return Container(
                margin: const EdgeInsets.symmetric(vertical: 4),
                alignment:
                    msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: msg.isMe
                        ? Colors.blue.withAlpha(51)
                        : AppTheme.panelGray,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    msg.text,
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.only(left: 8, right: 8, top: 8, bottom: 125),
          color: AppTheme.panelGray,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: const TextStyle(color: Colors.white54),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.black26,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 10),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                backgroundColor: AppTheme.accentRed,
                child: IconButton(
                  icon: const Icon(Icons.send, color: Colors.white),
                  onPressed: _sendMessage,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
