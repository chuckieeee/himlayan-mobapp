import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { PaymentService } from '@services/PaymentService';
import { AuthService } from '@services/AuthService';
import { Payment } from '@data/mockData';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';

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

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const user = await AuthService.getCurrentUser();

    if (user) {
      const userPayments = await PaymentService.getUserPayments(user.id);
      const paymentSummary = await PaymentService.getPaymentSummary(user.id);

      setPayments(userPayments);
      setSummary(paymentSummary);
    }

    setLoading(false);
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: Payment['type']) => {
    switch (type) {
      case 'burial':
        return '⚰️';
      case 'reservation':
        return '📝';
      case 'maintenance':
        return '🔧';
      default:
        return '💳';
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Balances & Payments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.success }]}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryAmount}>
              ₱{summary.totalPaid.toLocaleString()}
            </Text>
          </View>

          <View
            style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryAmount}>
              ₱{summary.totalPending.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.error }]}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={styles.summaryAmount}>
              ₱{summary.totalOverdue.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment List */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Payment History</Text>

          {payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>No payment records</Text>
            </View>
          ) : (
            payments.map(payment => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentTypeContainer}>
                    <Text style={styles.paymentIcon}>
                      {getTypeIcon(payment.type)}
                    </Text>
                    <View>
                      <Text style={styles.paymentDescription}>
                        {payment.description}
                      </Text>
                      <Text style={styles.paymentId}>{payment.id}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}>
                    <Text style={styles.statusText}>
                      {payment.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Amount:</Text>
                    <Text style={styles.paymentAmount}>
                      ₱{payment.amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Due Date:</Text>
                    <Text style={styles.paymentValue}>{payment.dueDate}</Text>
                  </View>

                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Type:</Text>
                    <Text style={styles.paymentValue}>
                      {payment.type.charAt(0).toUpperCase() +
                        payment.type.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Payment Methods */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>

          <View style={styles.methodCard}>
            <Text style={styles.methodIcon}>🏦</Text>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Bank Transfer</Text>
              <Text style={styles.methodDescription}>
                Direct bank deposit or transfer
              </Text>
            </View>
          </View>

          <View style={styles.methodCard}>
            <Text style={styles.methodIcon}>💳</Text>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Credit/Debit Card</Text>
              <Text style={styles.methodDescription}>
                Visa, Mastercard accepted
              </Text>
            </View>
          </View>

          <View style={styles.methodCard}>
            <Text style={styles.methodIcon}>📱</Text>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>E-Wallet</Text>
              <Text style={styles.methodDescription}>
                GCash, PayMaya, and more
              </Text>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Payment processing is handled securely. For assistance, contact the
            administrative office during business hours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    ...typography.body1,
    color: colors.surface,
    fontWeight: '500',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  scrollContent: {
    padding: spacing.md,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    elevation: 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    ...typography.h4,
    color: colors.surface,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  paymentDescription: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  paymentId: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  paymentDetails: {
    marginTop: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  paymentAmount: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  paymentValue: {
    ...typography.body2,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  methodIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  methodDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.info,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.surface,
    flex: 1,
    lineHeight: 20,
  },
});

export default PaymentsScreen;
