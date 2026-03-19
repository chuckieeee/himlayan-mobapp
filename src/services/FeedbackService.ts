import { apiRequest, getErrorMessage } from '@/config/api';

interface FeedbackSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  rating?: number;
}

interface FeedbackResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Submit feedback to the backend
 */
export async function submitFeedback(
  feedback: FeedbackSubmission
): Promise<FeedbackResponse> {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(
      '/feedback',
      {
        method: 'POST',
        body: feedback,
      }
    );

    console.log('✅ Feedback submitted successfully');
    return {
      success: true,
      message: response.message || 'Feedback submitted successfully',
      data: response,
    };
  } catch (error) {
    console.error('Error submitting feedback:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error) || 'Failed to submit feedback',
    };
  }
}
