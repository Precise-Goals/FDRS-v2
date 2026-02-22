import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:llama_flutter_android/llama_flutter_android.dart';

/// Service that manages the lifecycle of the Qwen GGUF model
/// and provides chat-style inference using llama.cpp via llama_flutter_android.
class QwenModelService {
  static final QwenModelService _instance = QwenModelService._internal();
  factory QwenModelService() => _instance;
  QwenModelService._internal();

  LlamaController? _controller;
  bool _isLoaded = false;
  bool _isLoading = false;
  bool _isGenerating = false;

  bool get isLoaded => _isLoaded;
  bool get isLoading => _isLoading;
  bool get isGenerating => _isGenerating;

  /// Load the GGUF model from [modelPath].
  /// Returns true on success.
  Future<bool> loadModel(String modelPath) async {
    if (_isLoaded || _isLoading) return _isLoaded;

    _isLoading = true;

    try {
      _controller = LlamaController();
      await _controller!.loadModel(
        modelPath: modelPath,
        threads: 4,
        contextSize: 2048,
      );

      _isLoaded = true;
      debugPrint('QwenModelService: Model loaded successfully from $modelPath');
      return true;
    } catch (e) {
      debugPrint('QwenModelService: Error loading model: $e');
      _isLoaded = false;
      _controller = null;
      return false;
    } finally {
      _isLoading = false;
    }
  }

  /// Generate a streaming response for [userMessage] given the [history].
  /// Uses the built-in ChatML template support.
  /// Returns a Stream of token strings.
  Stream<String> generateResponse(
    String userMessage,
    List<Map<String, String>> history,
  ) {
    if (!_isLoaded || _controller == null) {
      return Stream.value('Error: Model is not loaded.');
    }

    if (_isGenerating) {
      return Stream.value('Please wait for the current response to finish.');
    }

    _isGenerating = true;

    // Build ChatMessage list from history
    final messages = <ChatMessage>[
      ChatMessage(
        role: 'system',
        content:
            'You are Qwen, a helpful AI assistant running offline on the user\'s device. '
            'You are part of FDRS (Flood Disaster Response System). '
            'Provide clear, concise, and helpful responses. '
            'Focus on practical advice especially related to disaster preparedness and safety.',
      ),
    ];

    // Add recent history (last 6 exchanges = 12 messages)
    final recentHistory =
        history.length > 12 ? history.sublist(history.length - 12) : history;

    for (final msg in recentHistory) {
      messages.add(ChatMessage(
        role: msg['sender'] == 'user' ? 'user' : 'assistant',
        content: msg['text'] ?? '',
      ));
    }

    // Add current user message
    messages.add(ChatMessage(role: 'user', content: userMessage));

    // Use the built-in generateChat with ChatML template
    // The stream is broadcast, so we pipe it through a regular controller
    // to properly track completion.
    final outputController = StreamController<String>();

    try {
      final rawStream = _controller!.generateChat(
        messages: messages,
        template: 'chatml',
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxTokens: 512,
        repeatPenalty: 1.1,
      );

      late StreamSubscription<String> sub;
      sub = rawStream.listen(
        (token) {
          outputController.add(token);
        },
        onDone: () {
          _isGenerating = false;
          outputController.close();
        },
        onError: (error) {
          debugPrint('QwenModelService: Generation error: $error');
          _isGenerating = false;
          outputController.addError(error);
          outputController.close();
        },
      );

      outputController.onCancel = () {
        sub.cancel();
        _isGenerating = false;
      };
    } catch (e) {
      debugPrint('QwenModelService: Failed to start generation: $e');
      _isGenerating = false;
      outputController.addError(e);
      outputController.close();
    }

    return outputController.stream;
  }

  /// Stop the current generation.
  Future<void> stopGeneration() async {
    if (_isGenerating && _controller != null) {
      try {
        await _controller!.stop();
      } catch (e) {
        debugPrint('QwenModelService: Error stopping generation: $e');
      }
      _isGenerating = false;
    }
  }

  /// Unload the model and free resources.
  Future<void> unloadModel() async {
    if (!_isLoaded || _controller == null) return;
    try {
      await stopGeneration();
      await _controller!.dispose();
      _controller = null;
      _isLoaded = false;
      debugPrint('QwenModelService: Model unloaded');
    } catch (e) {
      debugPrint('QwenModelService: Error unloading model: $e');
    }
  }
}
