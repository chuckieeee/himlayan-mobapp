import AsyncStorage from "@react-native-async-storage/async-storage";

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

  static async getUserPayments(): Promise<Payment[]> {
    const token = await AsyncStorage.getItem("auth_token");

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

    const data = JSON.parse(text);

    if (data.success) {
      return data.data;
    }

    return [];
  }

  static async createXenditPayment(
    amount: number,
    paymentType: string,
    paymentMethod: string = "gcash"
  ) {
    const token = await AsyncStorage.getItem("auth_token");

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
    console.log("XENDIT RAW RESPONSE:", text);

    return JSON.parse(text);
  }

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