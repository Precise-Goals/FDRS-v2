import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/main_screen.dart';
import 'screens/bluetooth_quitchat_screen.dart';

class AppRouter {
  static const String initialRoute = '/';
  static const String loginRoute = '/login';
  static const String mainRoute = '/main';
  static const String bluetoothChatRoute = '/bluetoothChat';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case initialRoute:
      case mainRoute:
        return MaterialPageRoute(builder: (_) => const MainScreen());
      case loginRoute:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case bluetoothChatRoute:
        return MaterialPageRoute(
            builder: (_) => const BluetoothQuitchatScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
