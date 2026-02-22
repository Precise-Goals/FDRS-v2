import 'dart:io';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import '../services/qwen_model_service.dart';

class QwenScreen extends StatefulWidget {
  const QwenScreen({super.key});

  @override
  State<QwenScreen> createState() => _QwenScreenState();
}

enum _DownloadState { initial, downloading, paused, completed }

class _QwenScreenState extends State<QwenScreen> {
  final String _modelFileName = 'qwen_offline_model.bin';
  final String _modelDownloadUrl =
      'https://huggingface.co/Qwen/Qwen1.5-1.8B-Chat-GGUF/resolve/main/qwen1_5-1_8b-chat-q4_k_m.gguf';

  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [];

  _DownloadState _downloadState = _DownloadState.initial;
  int _downloadedBytes = 0;
  int _totalBytes = 0;
  CancelToken? _cancelToken;

  // ML inference state
  final QwenModelService _modelService = QwenModelService();
  bool _isModelLoading = false;
  bool _isGenerating = false;

  bool get _isModelDownloaded => _downloadState == _DownloadState.completed;

  @override
  void initState() {
    super.initState();
    _checkModelStatus();
  }

  @override
  void dispose() {
    _modelService.unloadModel();
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _checkModelStatus() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final modelFile = File('${dir.path}/$_modelFileName');

      int localSize = 0;
      if (await modelFile.exists()) {
        localSize = await modelFile.length();
      }

      final dio = Dio();
      int serverSize = 0;
      try {
        final headRes = await dio.head(_modelDownloadUrl);
        final lenStr = headRes.headers.value('content-length');
        if (lenStr != null) {
          serverSize = int.tryParse(lenStr) ?? 0;
        }
      } catch (e) {
        debugPrint("Could not fetch remote file size: $e");
      }

      if (!mounted) return;

      setState(() {
        _downloadedBytes = localSize;
        if (serverSize > 0) _totalBytes = serverSize;

        if (_downloadedBytes > 0) {
          if (_totalBytes > 0 && _downloadedBytes >= _totalBytes) {
            _downloadState = _DownloadState.completed;
          } else {
            _downloadState = _DownloadState.paused;
          }
        } else {
          _downloadState = _DownloadState.initial;
        }
      });

      // If model is already downloaded, load it
      if (_downloadState == _DownloadState.completed) {
        _loadModelIntoMemory();
      }
    } catch (e) {
      debugPrint("Error checking model file: $e");
    }
  }

  /// Load the GGUF model into memory for inference.
  Future<void> _loadModelIntoMemory() async {
    if (_modelService.isLoaded || _isModelLoading) return;

    setState(() => _isModelLoading = true);

    try {
      final dir = await getApplicationDocumentsDirectory();
      final modelPath = '${dir.path}/$_modelFileName';
      final success = await _modelService.loadModel(modelPath);

      if (mounted) {
        setState(() => _isModelLoading = false);

        if (success) {
          debugPrint('Model loaded and ready for inference');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Failed to load AI model. Try removing and re-downloading.'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Error loading model: $e');
      if (mounted) {
        setState(() => _isModelLoading = false);
      }
    }
  }

  Future<void> _startOrResumeDownload() async {
    setState(() {
      _downloadState = _DownloadState.downloading;
    });

    _cancelToken = CancelToken();
    final dio = Dio();

    try {
      if (_totalBytes == 0) {
        final headRes = await dio.head(_modelDownloadUrl);
        final lenStr = headRes.headers.value('content-length');
        if (lenStr != null) {
          _totalBytes = int.tryParse(lenStr) ?? 0;
        }
      }

      final dir = await getApplicationDocumentsDirectory();
      final savePath = '${dir.path}/$_modelFileName';

      final headers = <String, dynamic>{};
      if (_downloadedBytes > 0) {
        headers['range'] = 'bytes=$_downloadedBytes-';
      }

      final response = await dio.get<ResponseBody>(
        _modelDownloadUrl,
        options: Options(
          responseType: ResponseType.stream,
          headers: headers,
        ),
        cancelToken: _cancelToken,
      );

      final file = File(savePath);
      final raf = file.openSync(mode: FileMode.append);

      var dataStream = response.data?.stream;
      if (dataStream != null) {
        int received = _downloadedBytes;
        await for (var chunk in dataStream) {
          if (_cancelToken?.isCancelled == true) break;
          raf.writeFromSync(chunk);
          received += chunk.length;

          setState(() {
            _downloadedBytes = received;
          });
        }
      }

      raf.closeSync();

      if (_cancelToken?.isCancelled == true) {
        if (mounted && _downloadState != _DownloadState.initial) {
          setState(() {
            _downloadState = _DownloadState.paused;
          });
        }
        return;
      }

      setState(() {
        _downloadState = _DownloadState.completed;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Model downloaded successfully!')),
        );
      }

      // Auto-load the model after download completes
      _loadModelIntoMemory();
    } on DioException catch (e) {
      if (CancelToken.isCancel(e)) {
        if (mounted && _downloadState != _DownloadState.initial) {
          setState(() => _downloadState = _DownloadState.paused);
        }
      } else {
        debugPrint('Download error: $e');
        if (mounted && _downloadState != _DownloadState.initial) {
          setState(() => _downloadState = _DownloadState.paused);
        }
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to download model: $e')),
          );
        }
      }
    } catch (e) {
      debugPrint('Unexpected logic error: $e');
      if (mounted && _downloadState != _DownloadState.initial) {
        setState(() => _downloadState = _DownloadState.paused);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Unexpected error during download: $e')),
        );
      }
    }
  }

  void _pauseDownload() {
    _cancelToken?.cancel('User paused the download');
  }

  Future<void> _cancelAndClearDownload() async {
    _cancelToken?.cancel('User canceled');

    if (mounted) {
      setState(() {
        _downloadState = _DownloadState.initial;
        _downloadedBytes = 0;
      });
    }

    try {
      final dir = await getApplicationDocumentsDirectory();
      final modelFile = File('${dir.path}/$_modelFileName');
      if (await modelFile.exists()) {
        await modelFile.delete();
      }
    } catch (e) {
      debugPrint("Could not delete partial file: $e");
    }
  }

  Future<void> _removeModel() async {
    await _modelService.unloadModel();
    await _cancelAndClearDownload();
    if (mounted) {
      setState(() {
        _messages.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offline AI model removed successfully.')),
      );
    }
  }

  /// Send a message and stream the AI response token-by-token.
  Future<void> _sendMessage() async {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    if (!_modelService.isLoaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Model is still loading. Please wait...'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_isGenerating) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      // Add a placeholder for the AI response
      _messages.add({'sender': 'qwen', 'text': ''});
      _isGenerating = true;
      _msgController.clear();
    });

    _scrollToBottom();

    final responseIndex = _messages.length - 1;
    final responseBuffer = StringBuffer();

    try {
      // Build history excluding the placeholder
      final history = _messages.sublist(0, responseIndex);

      await for (final token in _modelService.generateResponse(text, history)) {
        if (!mounted) break;
        responseBuffer.write(token);
        setState(() {
          _messages[responseIndex] = {
            'sender': 'qwen',
            'text': responseBuffer.toString(),
          };
        });
        _scrollToBottom();
      }

      // If response is empty, show a fallback
      if (responseBuffer.isEmpty && mounted) {
        setState(() {
          _messages[responseIndex] = {
            'sender': 'qwen',
            'text': 'I couldn\'t generate a response. Please try again.',
          };
        });
      }
    } catch (e) {
      debugPrint('Error during generation: $e');
      if (mounted) {
        setState(() {
          _messages[responseIndex] = {
            'sender': 'qwen',
            'text': 'Error: $e',
          };
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isGenerating = false);
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Qwen Offline AI'),
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          if (_isModelDownloaded)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
              tooltip: 'Remove Model',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: Colors.grey[900],
                    title: const Text('Remove Model',
                        style: TextStyle(color: Colors.white)),
                    content: const Text(
                      'Are you sure you want to remove the offline AI model? You will need to download it again to use the offline chat.',
                      style: TextStyle(color: Colors.white70),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel',
                            style: TextStyle(color: Colors.grey)),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _removeModel();
                        },
                        child: const Text('Remove',
                            style: TextStyle(color: Colors.redAccent)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: _isModelDownloaded ? _buildChatInterface() : _buildDownloadPrompt(),
    );
  }

  Widget _buildDownloadPrompt() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Icon(
              Icons.smart_toy_rounded,
              size: 80,
              color: Color(0xFFFF9500),
            ),
            const SizedBox(height: 24),
            const Text(
              'Get Free AI Service Without Internet',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'First, download the highly optimized ~1.8GB model file. This allows Qwen to run entirely on your device for fast, private, and offline assistance during emergencies.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 16,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 40),
            if (_downloadState == _DownloadState.downloading ||
                _downloadState == _DownloadState.paused) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Column(
                  children: [
                    LinearProgressIndicator(
                      value: _totalBytes > 0
                          ? _downloadedBytes / _totalBytes
                          : 0.0,
                      backgroundColor: Colors.white24,
                      color: const Color(0xFFFF9500),
                      minHeight: 10,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _totalBytes > 0
                          ? '${((_downloadedBytes / _totalBytes) * 100).toStringAsFixed(1)}%'
                          : '${(_downloadedBytes / 1024 / 1024).toStringAsFixed(2)} MB Downloaded',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (_downloadState == _DownloadState.downloading)
                          ElevatedButton.icon(
                            onPressed: _pauseDownload,
                            icon: const Icon(Icons.pause_rounded),
                            label: const Text('Pause'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey[800],
                              foregroundColor: Colors.white,
                            ),
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: _startOrResumeDownload,
                            icon: const Icon(Icons.play_arrow_rounded),
                            label: const Text('Resume'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFF9500),
                              foregroundColor: Colors.white,
                            ),
                          ),
                        const SizedBox(width: 16),
                        TextButton(
                          onPressed: () {
                            showDialog(
                                context: context,
                                builder: (context) => AlertDialog(
                                        backgroundColor: Colors.grey[900],
                                        title: const Text('Cancel Download',
                                            style:
                                                TextStyle(color: Colors.white)),
                                        content: const Text(
                                          'This will delete your partial download progress. Are you sure?',
                                          style:
                                              TextStyle(color: Colors.white70),
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () =>
                                                Navigator.pop(context),
                                            child: const Text('No',
                                                style: TextStyle(
                                                    color: Colors.grey)),
                                          ),
                                          TextButton(
                                            onPressed: () {
                                              Navigator.pop(context);
                                              _cancelAndClearDownload();
                                            },
                                            child: const Text('Yes, Cancel',
                                                style: TextStyle(
                                                    color: Colors.redAccent)),
                                          ),
                                        ]));
                          },
                          child: const Text(
                            'Cancel',
                            style: TextStyle(
                                color: Colors.redAccent, fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ] else ...[
              ElevatedButton.icon(
                onPressed: _startOrResumeDownload,
                icon: const Icon(Icons.download_rounded),
                label: const Text('Download Model (1.8GB)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF9500),
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  textStyle: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildChatInterface() {
    // Show loading state while the model is being loaded into memory
    if (_isModelLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 60,
              height: 60,
              child: CircularProgressIndicator(
                color: Color(0xFFFF9500),
                strokeWidth: 3,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Loading AI Model...',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'This may take a few seconds on first launch',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.6),
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: _messages.isEmpty
              ? _buildEmptyChat()
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final msg = _messages[index];
                    final isUser = msg['sender'] == 'user';
                    final text = msg['text'] ?? '';

                    // Show typing indicator for empty AI message (being generated)
                    if (!isUser && text.isEmpty && _isGenerating) {
                      return _buildTypingIndicator();
                    }

                    return Align(
                      alignment:
                          isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.78,
                        ),
                        decoration: BoxDecoration(
                          color: isUser
                              ? const Color(0xFFFF9500)
                              : Colors.grey[800],
                          borderRadius: BorderRadius.circular(16).copyWith(
                            bottomRight: isUser
                                ? const Radius.circular(0)
                                : const Radius.circular(16),
                            bottomLeft: !isUser
                                ? const Radius.circular(0)
                                : const Radius.circular(16),
                          ),
                        ),
                        child: Text(
                          text,
                          style: TextStyle(
                            color: isUser ? Colors.black : Colors.white,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
        _buildMessageInput(),
      ],
    );
  }

  Widget _buildEmptyChat() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.smart_toy_rounded,
            size: 64,
            color: Colors.white.withValues(alpha: 0.2),
          ),
          const SizedBox(height: 16),
          Text(
            'Ask Qwen anything',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.4),
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Running offline on your device',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.25),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.grey[800],
          borderRadius: BorderRadius.circular(16).copyWith(
            bottomLeft: const Radius.circular(0),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildDot(0),
            const SizedBox(width: 4),
            _buildDot(1),
            const SizedBox(width: 4),
            _buildDot(2),
          ],
        ),
      ),
    );
  }

  Widget _buildDot(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.3, end: 1.0),
      duration: Duration(milliseconds: 600 + (index * 200)),
      builder: (context, value, _) {
        return Opacity(
          opacity: value,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.6),
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.only(top: 16, bottom: 100, left: 16, right: 16),
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A1A),
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _msgController,
                style: const TextStyle(color: Colors.white),
                enabled: !_isGenerating,
                decoration: InputDecoration(
                  hintText: _isGenerating ? 'Generating...' : 'Message Qwen...',
                  hintStyle: const TextStyle(color: Colors.white54),
                  filled: true,
                  fillColor: Colors.black,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 12),
            Container(
              decoration: BoxDecoration(
                color:
                    _isGenerating ? Colors.grey[700] : const Color(0xFFFF9500),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.send_rounded, color: Colors.black),
                onPressed: _isGenerating ? null : _sendMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
