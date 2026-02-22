# Qwen Offline AI Architecture Guide

This guide details the process of downloading, structuring, and integrating offline AI models (like Qwen) into this Flutter application. The feature allows users to access a free AI chat service without an internet connection by downloading a highly optimized model file directly to their devices.

## 1. Where to Get Models

Optimized models suitable for mobile devices are typically quantized versions of larger models (e.g., Qwen, Llama). Consider downloading `.gguf` or `.bin` formats from the following sources:

- **HuggingFace (GGUF Models):** Models quantized using llama.cpp are readily available. Search for versions tagged with `q4_k_m` or similar for a good balance of size and quality.
  - Example Link: [Qwen Quantized Models on HuggingFace](https://huggingface.co/models?search=qwen+gguf)
- **Direct External Links (e.g., Google Drive):** Administrators can host a specific, tested model file on Google Drive or AWS S3 and provide the direct download link within the application.

## 2. Directory Structure on Device

Models should be downloaded into the application's secure storage directory to ensure they aren't accidentally deleted by the user or other apps, while still remaining accessible to the app's internal logic.

### Recommended Path (Using `path_provider`)

In Flutter, use the `path_provider` package's `getApplicationDocumentsDirectory()` method.

```dart
import 'package:path_provider/path_provider.dart';
import 'dart:io';

Future<String> getModelDirectoryPath() async {
  final directory = await getApplicationDocumentsDirectory();
  final modelDir = Directory('${directory.path}/ai_models');

  if (!await modelDir.exists()) {
    await modelDir.create(recursive: true);
  }

  return modelDir.path;
}
```

### Expected File Placement

`/data/user/0/com.yourcompany.fdrs/app_flutter/ai_models/qwen_model_v1.gguf`

- **Offline Mode:** If this file exists, the application should bypass the download prompt and directly initialize the chat engine.
- **Deletion:** When a user requests to delete the model to save space, simply delete the file at this specific path.

## 3. Implementation Steps for Online Fetching

When implementing the actual downloading mechanism within the Flutter application:

1.  **Dependencies:** Ensure you use a reliable downloading package like `dio` for managing large file downloads, along with progress listening.
2.  **Download Logic:** Add a function to trigger the download from the provided Drive/S3 link and save it to the path generated in Step 2.
3.  **UI Updates:** The UI must display the download progress to the user (e.g., a progress bar or percentage) to ensure they are aware of the status.

### Example Download Script Structure:

```dart
// Example using dio and path_provider
import 'package:dio/dio.dart';

Future<void> fetchModel(String url, String fileName) async {
  final dio = Dio();
  final modelDirPath = await getModelDirectoryPath();
  final savePath = '$modelDirPath/$fileName';

  try {
    await dio.download(
      url,
      savePath,
      onReceiveProgress: (received, total) {
        if (total != -1) {
          // Update your UI state with the progress percentage
          print((received / total * 100).toStringAsFixed(0) + "%");
        }
      },
    );
    print("Download completed!");
  } catch (e) {
    print("Download failed: \$e");
  }
}
```

## 4. Setting up the Offline Inference (Future Steps)

Once the model is successfully placed in the local directory, you will likely integrate a native offline ML engine (such as flutter-llama.cpp) to load the model file from the disk and interact with it.

1.  Pass the absolute path of the `.gguf` file to the ML engine initializer.
2.  Handle the inference state (loading, error, ready) in your UI.
3.  Pass the user's prompt to the engine's inference method and append the returned text stream/chunks to the chat window.
