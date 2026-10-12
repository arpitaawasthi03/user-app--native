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
import UtilityHeader from "../../components/UtilityHeader";
import Icon from "../../components/Icon";
import { serviceMeta } from "../../data/demo";
import { formatDay } from "../../lib/format";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function Orders() {
  const { push } = useNav();
  const { state } = useApp();
  const [tab, setTab] = useState<"active" | "past">("active");

  const activeOrders = state.orders.filter((o) => o.status < 3);
  const pastOrders = state.orders.filter((o) => o.status >= 3);

  const displayedOrders = tab === "active" ? activeOrders : pastOrders;

  const getStatusText = (o: (typeof state.orders)[0]) => {
    if (o.status < 3) {
      if (o.service === "food")
        return o.status === 2 ? "Arriving in 18 minutes" : "Food being prepared";
      if (o.service === "courier")
        return o.status === 0 ? "Courier is at pickup" : "On the way";
      if (o.service === "rides") return "Driver arriving soon";
      return "Packing essentials";
    }
    return `Delivered · ${formatDay(o.completedAt ?? o.createdAt)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <UtilityHeader title="Your orders" subtitle="ALL ROADRIDER SERVICES" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active vs Past Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setTab("active")}
            style={[styles.tabBtn, tab === "active" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "active" && styles.tabBtnTextActive,
              ]}
            >
              Active {activeOrders.length > 0 ? `(${activeOrders.length})` : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("past")}
            style={[styles.tabBtn, tab === "past" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "past" && styles.tabBtnTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Cards */}
        <View style={styles.orderList}>
          {displayedOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No {tab} orders found.</Text>
            </View>
          ) : (
            displayedOrders.map((o) => {
              const type = o.service;
              const iconName =
                type === "rides"
                  ? ("car" as const)
                  : type === "grocery"
                  ? ("bag" as const)
                  : type === "courier"
                  ? ("box" as const)
                  : ("food" as const);

              return (
                <TouchableOpacity
                  key={o.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    push({ name: "orderDetail", orderId: o.id })
                  }
                  style={styles.orderCard}
                >
                  <View style={styles.orderIconBox}>
                    <Icon name={iconName} size={20} color={colors.accent} />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCategory}>
                      {serviceMeta[type].label} ·{" "}
                      {tab === "active" ? "ACTIVE" : "PAST"}
                    </Text>
                    <Text style={styles.orderTitle}>{o.title}</Text>
                    <Text style={styles.orderStatus}>{getStatusText(o)}</Text>
                  </View>
                  <View style={styles.orderPriceCol}>
                    <Text style={styles.orderPrice}>
                      {rupees(o.bill.toPay)}
                    </Text>
                    <Icon name="arrow" size={14} color={colors.muted} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: colors.accent,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  tabBtnTextActive: {
    color: "#ffffff",
  },
  orderList: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderCategory: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 2,
  },
  orderStatus: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  orderPriceCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
});
