import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { AuthService } from '@services/AuthService';
import { getFCMToken } from '@services/PushNotificationService';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      
      // Register FCM token after successful login
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        console.log('✅ FCM Token obtained:', fcmToken);
        // Token will be sent to backend via DataService in the dashboard
      }
      
      // Navigation will be handled automatically by AppNavigator
      console.log('Logged in successfully:', user.name);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check for specific error types
      const errorMessage = error?.message || 'Something went wrong';
      
      // Special handling for role restriction errors
      if (
        error.code === 'ROLE_NOT_ALLOWED' ||
        errorMessage.includes('not supported on the mobile app')
      ) {
        Alert.alert(
          'Access Denied',
          errorMessage ||
            'Staff and Admin accounts are not supported on the mobile app. Please use the web system.',
          [{ text: 'OK', style: 'default' }]
        );
      } 
      // Check for wrong password/invalid credentials
      else if (
        errorMessage.includes('Invalid credentials') ||
        errorMessage.includes('wrong password') ||
        errorMessage.includes('Incorrect') ||
        errorMessage.includes('Invalid login')
      ) {
        Alert.alert('Invalid Password', 'The password you entered is incorrect. Please try again.');
      }
      else {
        Alert.alert('Login Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Himlayang Pilipino</Text>
        <Text style={styles.subtitle}>Memorial Park Navigation</Text>
      </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            autoCapitalize='none'
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[commonStyles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={commonStyles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Quezon City, Philippines</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
  width: 120,
  height: 120,
  resizeMode: 'contain',
  marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 3,
  },
  label: {
    ...typography.body1,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  infoTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoNote: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default LoginScreen;
