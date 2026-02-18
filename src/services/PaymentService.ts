/**
 * PaymentService - Placeholder for future payment integration
 *
 * Note: The current database schema does not include payment tables.
 * This service is kept for compatibility with existing screens
 * and can be extended when payment features are implemented.
 */

export interface Payment {
  id: string;
  userId: string;
  type: 'burial' | 'reservation' | 'maintenance';
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  description: string;
}

export class PaymentService {
  /**
   * Get payments for a user
   * @deprecated Payment functionality not yet implemented in backend
   */
  static async getUserPayments(userId: string): Promise<Payment[]> {
    console.warn('PaymentService: Payment functionality not yet implemented');
    return [];
  }

  /**
   * Get payment balance summary
   * @deprecated Payment functionality not yet implemented in backend
   */
  static async getPaymentSummary(userId: string): Promise<{
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  }> {
    console.warn('PaymentService: Payment functionality not yet implemented');
    return {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
    };
  }

  /**
   * Process a payment
   * @deprecated Payment functionality not yet implemented in backend
   */
  static async processPayment(paymentId: string): Promise<boolean> {
    console.warn('PaymentService: Payment functionality not yet implemented');
    return false;
  }
}
