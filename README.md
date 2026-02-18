# Himlayan Pilipino Memorial Park Mobile App
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/chuckieeee/himlayan-mobapp)

This repository contains the source code for the Himlayang Pilipino Memorial Park mobile application. It is a smart cemetery navigation and digital plot management system built with React Native and Expo, designed to assist visitors in locating graves and accessing information.

## ✨ Key Features

*   **User Authentication**: Secure login and registration for visitors and customers.
*   **Grave Search**: Easily find plots by searching for the deceased's name.
*   **Real-time Navigation**: Integrates with Google Maps to provide turn-by-turn walking directions to a selected grave location.
*   **QR Code Scanner**: Scan QR codes on plots to instantly view detailed information, including the deceased's name, dates, and section.
*   **Interactive Dashboard**: A user-friendly home screen with quick access to key features and the latest announcements from the park administration.
*   **Plot Details**: View comprehensive details for each grave, including an interactive map preview of its location.
*   **Announcements**: Stay informed with the latest news, schedules, and updates.

## 🛠️ Tech Stack

*   **Framework**: React Native with Expo
*   **Language**: TypeScript
*   **Navigation**: React Navigation (Stack & Bottom Tabs)
*   **UI Components**: React Native Paper
*   **Mapping**: React Native Maps (Google Maps), Expo Location
*   **Camera & QR Scanning**: Expo Camera, Expo Barcode Scanner
*   **API Client**: Axios & Fetch
*   **State & Storage**: React Context, AsyncStorage
*   **Backend (Mock)**: A simple Express.js server is included for basic user authentication during development.

## 📁 Project Structure

The repository is organized as follows:

```
.
├── android/            # Android native project files
├── backend/            # Minimal Express.js mock server
├── src/
│   ├── config/         # API configuration and endpoints
│   ├── data/           # Mock data for development
│   ├── navigation/     # React Navigation setup (Stack, Tabs)
│   ├── screens/        # All application screens, organized by role
│   │   └── customer/   # Customer-facing screens
│   ├── services/       # Logic for interacting with the backend API
│   ├── styles/         # Global styles, theme, and colors
│   └── types/          # TypeScript definitions for data models
├── App.tsx             # Main application entry point
└── package.json        # Project dependencies and scripts
```

## 🚀 Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

*   Node.js (v18 or later)
*   NPM or Yarn
*   Expo CLI (`npm install -g expo-cli`)
*   A configured environment for either Android (Android Studio) or iOS (Xcode).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chuckieeee/himlayan-mobapp.git
    cd himlayan-mobapp
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the mock backend server:**
    The backend is a simple Express server for handling login requests during development.
    ```bash
    cd backend
    npm install
    node index.js
    ```
    The server will run on `http://localhost:8000`.

4.  **Configure the API Endpoint:**
    *   The backend server will run locally. To connect your mobile device to it, you'll need to expose the local server to the internet using a tool like [ngrok](https://ngrok.com/).
    *   Once you have an ngrok URL (e.g., `https://your-ngrok-url.ngrok-free.dev`), update the `API_BASE_URL` in `src/config/api.ts` and `src/services/api.ts`.

5.  **Run the mobile application:**
    *   **On Android:**
        ```bash
        expo run:android
        ```
    *   **On iOS:**
        ```bash
        expo run:ios
        ```

### Test Credentials

You can use the following credentials to log in with the mock backend server:

*   **Email**: `admin@cemetery.com`
*   **Password**: `password123`
