import React from "react";
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
import { formatWhen } from "../../lib/format";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function Wallet() {
  const { push } = useNav();
  const { state, setAutoTopUp, showToast } = useApp();

  const handleToggleAutoTopUp = () => {
    const next = !state.wallet.autoTopUp;
    setAutoTopUp(next);
    showToast(
      next
        ? "Auto top-up enabled when balance falls below ₹100"
        : "Auto top-up disabled"
    );
  };

  const recentTxns = state.wallet.txns.slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <UtilityHeader title="Wallet" subtitle="PAYMENTS & BALANCE" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Hero Card */}
        <View style={styles.walletHero}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceValue}>
            {rupees(state.wallet.balance)}.00
          </Text>
          <Text style={styles.walletBrandText}>RoadRider Wallet</Text>
          <TouchableOpacity
            onPress={() => push({ name: "addMoney" })}
            style={styles.addMoneyBtn}
          >
            <Text style={styles.addMoneyBtnText}>+ Add money</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => push({ name: "paymentMethods" })}
            style={styles.actionCard}
          >
            <View style={styles.actionIconBox}>
              <Icon name="card" size={20} color={colors.accent} />
            </View>
            <Text style={styles.actionText}>Payment methods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleAutoTopUp}
            style={styles.actionCard}
          >
            <View
              style={[
                styles.actionIconBox,
                state.wallet.autoTopUp && styles.actionIconBoxActive,
              ]}
            >
              <Icon
                name="shield"
                size={20}
                color={state.wallet.autoTopUp ? "#22c55e" : colors.accent}
              />
            </View>
            <Text style={styles.actionText}>
              {state.wallet.autoTopUp ? "Auto top-up: ON" : "Auto top-up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => push({ name: "transactions" })}
            style={styles.actionCard}
          >
            <View style={styles.actionIconBox}>
              <Icon name="list" size={20} color={colors.accent} />
            </View>
            <Text style={styles.actionText}>Statements</Text>
          </TouchableOpacity>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <TouchableOpacity onPress={() => push({ name: "transactions" })}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <View style={styles.txnList}>
          {recentTxns.map((txn) => {
            const isCredit = txn.amount > 0;
            return (
              <View key={txn.id} style={styles.txnRow}>
                <View
                  style={[
                    styles.txnIconBox,
                    isCredit && styles.txnIconBoxCredit,
                  ]}
                >
                  <Icon
                    name={txn.icon}
                    size={18}
                    color={isCredit ? "#22c55e" : colors.accent}
                  />
                </View>
                <View style={styles.txnDetails}>
                  <Text style={styles.txnLabel}>{txn.label}</Text>
                  <Text style={styles.txnDate}>{formatWhen(txn.when)}</Text>
                </View>
                <Text
                  style={[
                    styles.txnAmount,
                    isCredit && styles.txnAmountCredit,
                  ]}
                >
                  {isCredit
                    ? `+ ${rupees(txn.amount)}`
                    : `− ${rupees(Math.abs(txn.amount))}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Linked Card */}
        <View style={styles.linkedCard}>
          <View style={styles.linkedIconBox}>
            <Icon name="card" size={20} color={colors.accent} />
          </View>
          <View style={styles.linkedDetails}>
            <Text style={styles.linkedSmall}>LINKED PAYMENT METHOD</Text>
            <Text style={styles.linkedTitle}>Visa ending in 4821</Text>
          </View>
          <TouchableOpacity
            onPress={() => push({ name: "paymentMethods" })}
            style={styles.manageBtn}
          >
            <Text style={styles.manageBtnText}>Manage</Text>
          </TouchableOpacity>
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
  walletHero: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1.2,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 4,
  },
  walletBrandText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  addMoneyBtn: {
    marginTop: 14,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  addMoneyBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionIconBoxActive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  actionText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
  txnList: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  txnIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txnIconBoxCredit: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  txnDetails: {
    flex: 1,
  },
  txnLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  txnDate: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  txnAmountCredit: {
    color: "#22c55e",
  },
  linkedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 14,
  },
  linkedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  linkedDetails: {
    flex: 1,
  },
  linkedSmall: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.8,
  },
  linkedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 2,
  },
  manageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  manageBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
  },
});
