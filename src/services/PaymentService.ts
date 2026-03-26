import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/config/api";

const API_URL = "https://himlayangpilipino.com/api";

export interface Payment {
  id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: "pending" | "verified" | "rejected" | "under_investigation";
  reference_number?: string;
  created_at?: string;
}

export class PaymentService {

  /**
   * GET USER PAYMENTS
   */
  static async getUserPayments(): Promise<Payment[]> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const response = await fetch(`${API_URL}/payments/my-dues`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return [];
    }

    if (data.success) {
      return data.data;
    }

    return [];
  }

  /**
   * CHECKOUT EXISTING PAYMENT (NEW FLOW)
   */
  static async checkoutPayment(
    paymentId: number,
    paymentMethod: string = "all"
  ) {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const response = await fetch(
      `${API_URL}/payments/${paymentId}/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
        }),
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Server returned invalid response");
    }

    // ⚠️ Handle token expiration (401 Unauthorized)
    if (response.status === 401) {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.CURRENT_USER,
      ]);
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Checkout failed");
    }

    return data;
  }

  //*Get Payment History//

    static async getPaymentHistory() {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    const response = await fetch(`${API_URL}/payments`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
      return data.data || [];
  }

  /**
   * PAYMENT SUMMARY
   */
  static async getPaymentSummary() {
    const payments = await this.getPaymentHistory();

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach((payment: any) => {
      const amount = Number(payment.amount || 0);
      const status = (payment.status || "").toLowerCase();

      //  PAID
      if (status === "verified") {
        totalPaid += amount;
      }

      //  PENDING (includes awaiting verification)
      else if (status === "pending" || status === "awaiting_verification" || status === "under_investigation") {
        totalPending += amount;
      }

      //  OVERDUE
      else if (status === "overdue") {
        totalOverdue += amount;
      }
    });

    return {
      totalPaid,
      totalPending,
      totalOverdue,
    };
  }
}