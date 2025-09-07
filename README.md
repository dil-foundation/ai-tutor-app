# DIL-LMS Mobile App

This is a mobile application for the DIL-LMS (Digital Interactive Language Learning Management System), designed to help users learn English from Urdu through real-time translation and practice.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js and npm/yarn:** [Download Node.js](https://nodejs.org/) (npm is included) or [Install Yarn](https://classic.yarnpkg.com/en/docs/install).
*   **Expo CLI:** Install it globally using npm or yarn:
    ```bash
    npm install -g expo-cli
    # OR
    yarn global add expo-cli
    ```
*   **Android Studio and Emulator:**
    *   [Download Android Studio](https://developer.android.com/studio)
    *   Set up an Android Virtual Device (AVD) through Android Studio. Ensure the emulator is running before proceeding.
    *   Make sure your `ANDROID_HOME` environment variable is set up correctly.

## Getting Started

Follow these steps to get the application running on your Android emulator:

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd lms-mobile-app 
    ```
    *(Replace `<repository-url>` with the actual URL of your Git repository)*

2.  **Install Dependencies:**
    Navigate to the project directory and install the necessary dependencies.
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Start the Metro Bundler:**
    Once the dependencies are installed, start the Expo development server.
    ```bash
    npx expo start
    # OR
    yarn expo start
    ```
    This will open a new tab in your web browser with the Expo Developer Tools. You will also see a QR code in your terminal.

    To run the app with production optimizations, use the `start:prod` script:
    ```bash
    npm run start:prod
    # OR
    yarn start:prod
    ```

4.  **Run on Android Emulator:**
    *   **Ensure your Android emulator is running.**
    *   In the terminal where the Metro bundler is running, press `a`. This should automatically install the Expo Go app (if not already installed) on your emulator and then launch your application.
    *   Alternatively, if you have the Expo Go app installed on your emulator, you can open it and scan the QR code displayed in the terminal or the Expo Developer Tools.

## Project Structure (Brief Overview)

*   `app/`: Contains the main application code, typically organized by routes or features.
    *   `(tabs)/`: Likely represents tab-based navigation.
        *   `learn/`: Contains screens and components related to the learning module.
    *   `config/`: Contains configuration files, such as `api.ts` for API base URLs.
*   `assets/`: For static assets like images and fonts.
*   `components/`: For reusable UI components.
*   `constants/`: For constant values used throughout the app.
*   `hooks/`: For custom React hooks.
*   `navigation/`: For navigation-related setup (if not using Expo's file-based routing entirely).
*   `screens/`: (If not using `app/` for all screens) For top-level screen components.
*   `services/` or `api/`: For API call definitions and service integrations.
*   `types/` or `interfaces/`: For TypeScript type definitions.

## Backend API

This application interacts with a backend API. The base URL for the API is defined in `app/config/api.ts`. For local development, the Android emulator typically accesses the host machine's localhost via `http://10.0.2.2`.

*   **Android Emulator:** `http://10.0.2.2:PORT`
*   **iOS Simulator/Physical Device on same Wi-Fi:** `http://localhost:PORT` or `http://YOUR_MACHINE_LOCAL_IP:PORT`

Ensure your backend server is running and accessible at the configured URL and port (default seems to be `8000`).

## Key Features (from `app/(tabs)/learn/index.tsx`)

*   **Urdu Speech Input:** Users can speak in Urdu.
*   **Audio Translation:** The Urdu audio is sent to a backend for translation into English audio.
*   **English Transcription:** The translated English audio is transcribed into text.
*   **Audio Playback:** Users can play back their original Urdu recording and the translated English audio.
*   **Practice Mode:** Users can record themselves speaking the translated English sentence and navigate to a feedback screen (presumably to compare their pronunciation).

## Deployment

This project includes comprehensive deployment pipelines for both iOS and Android platforms with automated CI/CD through GitHub Actions.

### 📱 Production Deployment
- **iOS**: TestFlight beta testing and App Store production releases
- **Android**: Direct APK distribution and Google Play Store releases
- **Automation**: Complete GitHub Actions workflows for both platforms

### 📚 Deployment Documentation
All deployment-related documentation is organized in the [`deployment/`](deployment/) folder:

- **[Complete Deployment Guide](deployment/README.md)** - Start here for full overview
- **[iOS Deployment Guide](deployment/IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md)** - iOS TestFlight and App Store
- **[Android Deployment Guide](deployment/ANDROID_DEPLOYMENT_GUIDE.md)** - Android APK and Play Store
- **[Quick Reference](deployment/COMPLETE_DEPLOYMENT_SUMMARY.md)** - Cross-platform summary

### 🚀 Quick Deploy Commands
```bash
# iOS TestFlight release
git tag v1.0.0 && git push origin v1.0.0

# Android APK release
git tag android-v1.0.0 && git push origin android-v1.0.0

# Production releases (use GitHub Actions workflows)
# iOS: "iOS App Store Production Release"
# Android: "Android Play Store Production Release"
```

## Important Notes

*   **File System Usage:** The app uses `expo-file-system` to manage audio files, including saving temporary recordings and moving practice audio to a more permanent location within the app's document directory.
*   **Permissions:** The app requests audio recording permissions.
*   **Analytics:** Integrated with UXCam for user behavior analytics and session recording.
*   **Backend Integration:** Connects to Supabase backend for data management and real-time features.