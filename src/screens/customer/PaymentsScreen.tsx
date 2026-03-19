import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootStackParamList } from "../../navigation/types";

import { PaymentService } from "@services/PaymentService";
import { Payment } from "@data/mockData";

import { colors, spacing, typography } from "@styles/theme";
import { commonStyles } from "@styles/commonStyles";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const PaymentsScreen: React.FC = () => {

  const navigation = useNavigation<NavigationProp>();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = async () => {
    setLoading(true);

    try {
      const userPayments = await PaymentService.getPaymentHistory();
      const paymentSummary = await PaymentService.getPaymentSummary();

      setPayments(userPayments as any);
      setSummary(paymentSummary);
    } catch (error) {
      console.log("Load payments error:", error);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
    }, [])
  );

  /**
   *  PAY EXISTING PAYMENT (NEW FLOW)
   */
  const handlePayExisting = async (payment: any) => {
    try {
      const result = await PaymentService.checkoutPayment(payment.id);

      if (result.success && result.checkout_url) {
        await Linking.openURL(result.checkout_url);
      } else {
        Alert.alert(
          "Payment Error",
          result?.message || "Failed to create invoice"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to create payment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return colors.success;
      case "pending":
        return colors.warning;
      case "rejected":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Balances & Payments
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* SUMMARY */}
        <View style={styles.summaryContainer}>

          <View style={[styles.summaryCard, { backgroundColor: colors.success }]}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryAmount}>
              ₱{summary.totalPaid.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryAmount}>
              ₱{summary.totalPending.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.error }]}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={styles.summaryAmount}>
              ₱{summary.totalOverdue.toLocaleString()}
            </Text>
          </View>

        </View>

        {/* PAYMENT LIST */}
        <View style={commonStyles.card}>

          <Text style={styles.sectionTitle}>
            Payment History
          </Text>

          {payments.length === 0 ? (

            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>
                No payment records yet
              </Text>
            </View>

          ) : (

            payments.map((payment: any) => (

              <View key={payment.id} style={styles.paymentCard}>

                <View style={styles.paymentHeader}>

                  <View>
                    <Text style={styles.paymentDescription}>
                    {(payment.description || payment.notes || payment.payment_type)
                      .replace(/\(Request\s*#\d+\)/i, "")
                      .trim()}
                    </Text>
                    <Text style={styles.paymentId}>
                      Ref: {payment.reference_number || payment.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {payment.status.toUpperCase()}
                    </Text>
                  </View>

                </View>

                <View style={styles.paymentDetails}>

                <Text style={styles.paymentAmount}>
                  ₱{Number(payment.amount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>

                  {payment.status === "pending" && (

                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => handlePayExisting(payment)}
                    >
                      <Text style={styles.payButtonText}>
                        Pay Now
                      </Text>
                    </TouchableOpacity>

                  )}

                </View>

              </View>

            ))

          )}

        </View>

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({

  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: 50,
  },

  backButton: {
    marginBottom: spacing.sm,
  },

  backButtonText: {
    ...typography.body1,
    color: colors.surface,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },

  scrollContent: {
    padding: spacing.md,
  },

  summaryContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
  },

  summaryLabel: {
    color: colors.surface,
  },

  summaryAmount: {
    color: colors.surface,
    fontWeight: "bold",
  },

  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },

  paymentCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  paymentDescription: {
    fontWeight: "bold",
  },

  paymentId: {
    fontSize: 12,
  },

  statusBadge: {
    padding: 5,
    borderRadius: 12,
  },

  statusText: {
    color: "white",
  },

  paymentDetails: {
    marginTop: spacing.sm,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  paymentAmount: {
    fontWeight: "bold",
  },

  payButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    marginTop: spacing.sm,
    alignItems: "center",
    borderRadius: 12,
  },

  payButtonText: {
    color: "white",
  },

  emptyContainer: {
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyText: {},

});

export default PaymentsScreen;