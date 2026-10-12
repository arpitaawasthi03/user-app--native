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
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface OrderCompleteProps {
  orderId: string;
}

export default function OrderComplete({ orderId }: OrderCompleteProps) {
  const { reset } = useNav();
  const { state, rateOrder, showToast } = useApp();

  const order = state.orders.find((o) => o.id === orderId) ?? state.orders[0];
  const [selectedRating, setSelectedRating] = useState<number>(
    order?.rating ?? 5
  );

  const isRide = order?.service === "rides";
  const totalPaid = order ? rupees(order.bill.toPay) : "₹289";

  const handleRate = (stars: number) => {
    setSelectedRating(stars);
    if (order) {
      rateOrder(order.id, stars);
    }
    showToast(`Thanks for rating ${stars} stars!`);
  };

  const handleBackToHome = () => {
    reset([{ name: "home" }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Mark */}
        <View style={styles.successMark}>
          <Icon name="check" size={38} color="#ffffff" />
        </View>

        <Text style={styles.eyebrow}>ALL DONE</Text>
        <Text style={styles.title}>
          {isRide ? "Hope you enjoyed\nthe ride!" : "Delivered with care."}
        </Text>
        <Text style={styles.subTitle}>
          {isRide
            ? "You arrived at Gomti Nagar at 4:42 PM."
            : "Thanks for choosing RoadRider. Your order has been completed."}
        </Text>

        {/* Receipt Breakdown Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total paid</Text>
            <Text style={styles.receiptAmount}>{totalPaid}</Text>
          </View>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Payment</Text>
            <Text style={styles.receiptMethod}>
              {order?.payment ?? "RoadRider Wallet"}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPress={() => handleRate(star)}
                style={styles.starBtn}
              >
                <Icon
                  name="star"
                  size={32}
                  filled={star <= selectedRating}
                  color={star <= selectedRating ? "#f59e0b" : "#d1d5db"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Back to Home CTA */}
        <View style={styles.actionPad}>
          <Button onPress={handleBackToHome}>Back to home</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
  },
  successMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#22c55e",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 32,
  },
  subTitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 280,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginTop: 28,
    borderWidth: 1,
    borderColor: colors.line,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  receiptLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  receiptAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.accent,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
  receiptMethod: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  ratingSection: {
    alignItems: "center",
    marginTop: 32,
    width: "100%",
  },
  ratingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  starBtn: {
    padding: 6,
  },
  actionPad: {
    width: "100%",
    marginTop: 36,
  },
});
