import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/config/api";

const API_URL = "https://himlayangpilipino.com/api";

export interface Payment {
  id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: "pending" | "verified" | "rejected";
  reference_number?: string;
  created_at?: string;
}

export class PaymentService {

  /**
   * GET USER PAYMENTS
   */
  static async getUserPayments(): Promise<Payment[]> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    console.log("TOKEN (PAYMENTS):", token);

    const response = await fetch(`${API_URL}/payments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("PAYMENTS RAW:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ PAYMENTS NOT JSON:", text);
      return [];
    }

    if (data.success) {
      return data.data;
    }

    return [];
  }

  /**
   * CREATE XENDIT PAYMENT
   */
  static async createXenditPayment(
    amount: number,
    paymentType: string,
    paymentMethod: string = "gcash"
  ) {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    console.log("TOKEN (XENDIT):", token);

    const response = await fetch(`${API_URL}/payments/xendit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        payment_type: paymentType,
        payment_method: paymentMethod,
      }),
    });

    const text = await response.text();
    console.log("🔥 XENDIT RAW RESPONSE:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ NOT JSON RESPONSE:", text);
      throw new Error("Server returned invalid response");
    }

    // 🔥 SHOW ACTUAL BACKEND ERROR
    if (!response.ok) {
      console.log("❌ BACKEND ERROR:", data);
      throw new Error(data.message || "Payment failed");
    }

    return data;
  }

  /**
   * PAYMENT SUMMARY
   */
  static async getPaymentSummary() {
    const payments = await this.getUserPayments();

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach(payment => {
      const amount = Number(payment.amount);

      if (payment.status === "verified") {
        totalPaid += amount;
      }

      if (payment.status === "pending") {
        totalPending += amount;
      }
    });

    return {
      totalPaid,
      totalPending,
      totalOverdue,
    };
  }
}