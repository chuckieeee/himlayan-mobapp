# Himlayan Pilipino Memorial Park Mobile App
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/chuckieeee/himlayan-mobapp)

This repository contains the source code for the Himlayang Pilipino Memorial Park mobile application. It is a smart cemetery navigation and digital plot management system built with React Native and Expo, designed to assist visitors in locating graves and accessing information.

## ✨ Key Features

*   **User Authentication**: Secure login for customers to access personalized features.
*   **Grave Search**: Easily find plots by searching for the deceased's name.
*   **Real-time Navigation**: Integrates with Google Maps to provide turn-by-turn walking directions to a selected grave location.
*   **QR Code Scanner**: Scan QR codes on plots to instantly view detailed information, including the deceased's name, biography, and location.
*   **Interactive Dashboard**: A user-friendly home screen with quick access to key features, owned plots, and the latest announcements from the park administration.
*   **Plot Management**: Customers can view a list of their owned plots and their status.
*   **Announcements & Payments**: Stay informed with news and updates, and view payment history and outstanding balances.

## 🛠️ Tech Stack

*   **Framework**: React Native with Expo
*   **Language**: TypeScript
*   **Navigation**: React Navigation (Stack & Bottom Tabs)
*   **UI Components**: React Native Paper
*   **Mapping**: React Native Maps (Google Maps), Expo Location
*   **Camera & QR Scanning**: Expo Camera
*   **API Client**: Fetch API
*   **State & Storage**: React Context, AsyncStorage
*   **Backend (Mock)**: A simple Express.js server is included for handling user authentication during development.

## 📁 Project Structure

The repository is organized as follows:

```
.
├── android/            # Android native project files
├── backend/            # Minimal Express.js mock server for development
├── src/
│   ├── config/         # API configuration and endpoints
│   ├── data/           # Mock data (legacy)
│   ├── navigation/     # React Navigation setup (Stack, Tabs)
│   ├── screens/        # All application screens, organized by role
│   │   └── customer/   # Customer-facing screens
│   ├── services/       # Logic for interacting with the backend API
│   ├── styles/         # Global styles, theme, and colors
│   └── types/          # TypeScript definitions for data models
├── App.tsx             # Main application entry point
└── package.json        # Project dependencies and scripts
```


