import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Service } from "../data/demo";
import { computeBill, rupees, type Bill } from "../lib/pricing";
import { useApp } from "../state/AppState";
import { colors, radii } from "../theme/tokens";

export interface BillSummaryProps {
  service: Service;
  billOverride?: Bill;
}

export default function BillSummary({ service, billOverride }: BillSummaryProps) {
  const { itemTotal, state } = useApp();
  const bill =
    billOverride ??
    computeBill(service, itemTotal(service), state.promos[service] ?? null);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Bill details</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Item total</Text>
        <Text style={styles.value}>{rupees(bill.itemTotal)}</Text>
      </View>

      {bill.discount > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Discount ({bill.promo})</Text>
          <Text style={[styles.value, styles.discountText]}>
            − {rupees(bill.discount)}
          </Text>
        </View>
      )}

      {bill.deliveryFee !== undefined &&
        service !== "rides" &&
        service !== "courier" && (
          <View style={styles.row}>
            <Text style={styles.label}>Delivery fee</Text>
            <Text style={[styles.value, styles.freeText]}>FREE</Text>
          </View>
        )}

      {bill.taxes !== null && (
        <View style={styles.row}>
          <Text style={styles.label}>Taxes & fees</Text>
          <Text style={styles.value}>{rupees(bill.taxes)}</Text>
        </View>
      )}

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>To pay</Text>
        <Text style={styles.totalValue}>{rupees(bill.toPay)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: radii.md,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  discountText: {
    color: colors.success,
  },
  freeText: {
    color: colors.success,
    fontWeight: "700",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accent,
  },
});
