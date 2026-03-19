import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { submitFeedback } from '../../services/FeedbackService';
import { colors, spacing, typography } from '@styles/theme';

interface FeedbackForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  rating: number;
}

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<FeedbackForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    rating: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FeedbackForm, value: string | number) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleRating = (rating: number) => {
    setForm({
      ...form,
      rating: rating === form.rating ? 0 : rating,
    });
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!form.subject.trim()) {
      Alert.alert('Validation Error', 'Subject is required');
      return false;
    }
    if (!form.message.trim()) {
      Alert.alert('Validation Error', 'Message is required');
      return false;
    }
    if (form.message.length > 1000) {
      Alert.alert('Validation Error', 'Message must not exceed 1000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const feedbackData = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message,
        rating: form.rating || undefined,
      };

      const response = await submitFeedback(feedbackData);

      if (response.success) {
        Alert.alert('Success', 'Thank you for your feedback!', [
          {
            text: 'OK',
            onPress: () => {
              setForm({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
                rating: 0,
              });
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'An error occurred while submitting your feedback.');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleRating(star)}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= form.rating ? 'star' : 'star-outline'}
            size={32}
            color={star <= form.rating ? '#FFD700' : '#D0D0D0'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* NAVIGATION HEADER */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navHeaderTitle}>Feedback</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Feedback & Suggestions</Text>
            <Text style={styles.subtitle}>We value your feedback. Help us improve our services.</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={form.name}
                onChangeText={(value) => handleInputChange('name', value)}
                editable={!loading}
              />
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={!loading}
              />
            </View>

            {/* Phone Number Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Ionicons name="flag" size={16} color="#666" />
                  <Text style={styles.countryCodeText}>PH +63</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="e.g., 9123456789"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={form.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  editable={!loading}
                />
              </View>
              <Text style={styles.phoneHint}>Optional - Enter exactly 10 digits for Philippines</Text>
            </View>

            {/* Subject Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Subject <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="What is your feedback about?"
                placeholderTextColor="#999"
                value={form.subject}
                onChangeText={(value) => handleInputChange('subject', value)}
                editable={!loading}
              />
            </View>

            {/* Rating Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Rating (Optional)</Text>
              <StarRating />
            </View>

            {/* Message Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Message <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your feedback or suggestions here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                maxLength={1000}
                textAlignVertical="top"
                value={form.message}
                onChangeText={(value) => handleInputChange('message', value)}
                editable={!loading}
              />
              <Text style={styles.charCount}>
                {form.message.length} / 1000
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  navHeader: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: 50,
  },
  backButton: {
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  navHeaderTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#d32f2f',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    gap: 6,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  phoneHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    color: '#333',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
