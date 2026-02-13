import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '@services/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  // 🚀 Start scanning
  const handleScanPress = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission required', 'Camera permission is needed.');
        return;
      }
    }

    setScanned(false);
    setScanning(true);
  };

  // 📷 QR handler
  const handleScan = async ({ data }: any) => {
    if (scanned) return;

    setScanned(true);

    try {
      console.log("QR scanned:", data);

      // ✅ extract UUID from URL
      const code = data.split('/').pop();

      if (!code) throw new Error("Invalid QR");

      console.log("Extracted code:", code);

      const response = await api.get(`/grave/${code}`);

      if (!response.success) {
        throw new Error(response.message);
      }

      const grave = response.data;

      navigation.navigate("GraveDetails", {
        graveId: grave.id,
      });

    } catch (err) {
      console.log("QR scan error:", err);
      Alert.alert("Error", "Invalid QR code");
      setScanned(false);
    }
  };


  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code Scanner</Text>
      </View>

      <View style={styles.content}>
        {/* Scanner Box */}
        <View style={styles.scannerContainer}>
          <View style={styles.scannerFrame}>
            {scanning ? (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleScan}
              />
            ) : (
              <>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.instructionText}>
                  Tap start to scan QR code
                </Text>
              </>
            )}
          </View>

          {/* Corners */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={handleScanPress}
          >
            <Text style={commonStyles.buttonText}>📷 Start Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={commonStyles.buttonSecondary}
            onPress={() => setScanning(false)}
          >
            <Text style={[commonStyles.buttonText, { color: colors.text }]}>
              Stop Camera
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default QRScannerScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },

  backButtonText: {
    ...typography.body1,
    color: colors.surface,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },

  content: {
    flex: 1,
    padding: spacing.md,
  },

  scannerContainer: {
    height: 300,
    marginVertical: spacing.lg,
    position: 'relative',
  },

  scannerFrame: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  cameraIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },

  instructionText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
  },

  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },

  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },

  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },

  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  buttonContainer: {
    marginBottom: spacing.md,
  },
});
