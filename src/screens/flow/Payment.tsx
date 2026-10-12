import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlowHeader from "../../components/FlowHeader";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import type { Service } from "../../data/demo";
import { computeBill, rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface PaymentProps {
  service: Service;
}

export default function Payment({ service }: PaymentProps) {
  const { push } = useNav();
  const { state, itemTotal, placeOrder, placeById, showToast } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<
    "wallet" | "upi" | "card"
  >("wallet");

  const total = itemTotal(service);
  const bill = computeBill(service, total, state.promos[service] ?? null);

  const currentPlace =
    placeById(state.defaultPlaceId) ??
    state.places[0] ?? {
      label: "Home",
      line: "15, Shahnajaf Road, Hazratganj",
    };
  const destination =
    service === "rides"
      ? `${placeById(state.ride.dropId)?.area ?? "Gomti Nagar, Lucknow"}`
      : `${currentPlace.label} · ${currentPlace.line}`;

  const handlePay = () => {
    const res = placeOrder(service, selectedMethod, destination);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    push({ name: "status", orderId: res.order.id, view: "confirmed" });
  };

  const methods: {
    id: "wallet" | "upi" | "card";
    label: string;
    sub: string;
  }[] = [
    {
      id: "wallet",
      label: "RoadRider Wallet",
      sub: `Available balance ${rupees(state.wallet.balance)}`,
    },
    {
      id: "upi",
      label: "UPI",
      sub: "Google Pay, PhonePe and more",
    },
    {
      id: "card",
      label: "Credit or debit card",
      sub: "Visa ending in 4821",
    },
  ];

  const hasInsufficientWallet =
    selectedMethod === "wallet" && state.wallet.balance < bill.toPay;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={["top"]}>
        <FlowHeader title="Payment" />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalSmall}>TOTAL TO PAY</Text>
          <Text style={styles.totalValue}>{rupees(bill.toPay)}</Text>
          <Text style={styles.totalSecureText}>
            Secure 256-bit encrypted checkout
          </Text>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Payment method</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsList}>
          {methods.map(({ id, label, sub }) => {
            const isSelected = selectedMethod === id;
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod(id)}
                style={[
                  styles.paymentCard,
                  isSelected && styles.paymentCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.iconBoxSelected,
                  ]}
                >
                  <Icon
                    name="card"
                    size={20}
                    color={isSelected ? colors.accent : colors.muted}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodLabel}>{label}</Text>
                  <Text style={styles.methodSub}>{sub}</Text>
                </View>
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Insufficient Wallet Warning */}
        {hasInsufficientWallet && (
          <View style={styles.insufficientWarning}>
            <View style={{ flex: 1 }}>
              <Text style={styles.insufficientTitle}>
                Insufficient wallet balance
              </Text>
              <Text style={styles.insufficientSub}>
                Short by {rupees(bill.toPay - state.wallet.balance)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => push({ name: "addMoney" })}
              style={styles.addMoneyBtn}
            >
              <Text style={styles.addMoneyBtnText}>+ Add money</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gateway notice */}
        {selectedMethod !== "wallet" && (
          <Text style={styles.gatewayNotice}>
            Note: External gateways require backend API keys. To complete this
            booking, please select{" "}
            <Text style={{ fontWeight: "700" }}>RoadRider Wallet</Text>.
          </Text>
        )}
      </ScrollView>

      {/* Pay CTA */}
      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <Button onPress={handlePay}>Pay {rupees(bill.toPay)}</Button>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safeHeader: {
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },
  totalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  totalSmall: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1.2,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.ink,
    marginVertical: 4,
  },
  totalSecureText: {
    fontSize: 11,
    color: colors.muted,
  },
  sectionHeadingRow: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  methodsList: {
    gap: 10,
  },
  paymentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  paymentCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: "#ffffff",
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  methodSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  insufficientWarning: {
    marginTop: 14,
    padding: 14,
    backgroundColor: "#fff2ef",
    borderWidth: 1,
    borderColor: "#ffd0c7",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  insufficientTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#c84b31",
  },
  insufficientSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  addMoneyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  addMoneyBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  gatewayNotice: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 14,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
