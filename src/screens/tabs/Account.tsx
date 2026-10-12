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
import { SERVICES, serviceMeta, type Service } from "../../data/demo";
import { initials, prettyPhone } from "../../lib/format";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function Account() {
  const { push, switchTab } = useNav();
  const { state, setService } = useApp();
  const [activityTab, setActivityTab] = useState<"active" | "past">("active");

  const userName = state.profile.name || "Arjun Khanna";
  const userPhone = state.profile.phone
    ? `+91 ${prettyPhone(state.profile.phone)}`
    : "+91 98765 43210";
  const userInitials = initials(userName);

  const activeOrders = state.orders.filter((o) => o.status < 3);
  const pastOrders = state.orders.filter((o) => o.status >= 3);
  const currentPreview =
    activityTab === "active" ? activeOrders[0] : pastOrders[0];

  const handleSelectService = (s: Service) => {
    setService(s);
    switchTab("home");
  };

  const menuItems = [
    {
      icon: "heart" as const,
      label: `Your favorites (${state.favorites.length})`,
      route: { name: "favorites" as const },
    },
    {
      icon: "pin" as const,
      label: "Saved addresses",
      route: { name: "places" as const, mode: "manage" as const },
    },
    {
      icon: "card" as const,
      label: "Payment methods",
      route: { name: "paymentMethods" as const },
    },
    {
      icon: "box" as const,
      label: "Your orders",
      route: { name: "orders" as const },
    },
    {
      icon: "shield" as const,
      label: "Help & support",
      route: { name: "help" as const },
    },
    {
      icon: "user" as const,
      label: "Profile & settings",
      route: { name: "profile" as const },
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <UtilityHeader title="Account" subtitle="PROFILE & SETTINGS" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userPhone}>{userPhone}</Text>
          </View>
          <TouchableOpacity
            onPress={() => push({ name: "profile" })}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Balance Strip */}
        <View style={styles.walletCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletSmall}>ROADRIDER WALLET</Text>
            <Text style={styles.walletBalance}>
              {rupees(state.wallet.balance)}.00
            </Text>
            <Text style={styles.walletSub}>Available balance</Text>
          </View>
          <TouchableOpacity
            onPress={() => push({ name: "addMoney" })}
            style={styles.addMoneyBtn}
          >
            <Text style={styles.addMoneyBtnText}>+ Add money</Text>
          </TouchableOpacity>
        </View>

        {/* Section Heading: Your Activity */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your activity</Text>
          <TouchableOpacity onPress={() => push({ name: "orders" })}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Tabs */}
        <View style={styles.activityTabsRow}>
          <TouchableOpacity
            onPress={() => setActivityTab("active")}
            style={[
              styles.activityTabBtn,
              activityTab === "active" && styles.activityTabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.activityTabText,
                activityTab === "active" && styles.activityTabTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActivityTab("past")}
            style={[
              styles.activityTabBtn,
              activityTab === "past" && styles.activityTabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.activityTabText,
                activityTab === "past" && styles.activityTabTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity Preview Card */}
        {currentPreview ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              push({ name: "orderDetail", orderId: currentPreview.id })
            }
            style={styles.activityCard}
          >
            <View style={styles.activityIconBox}>
              <Icon
                name={
                  currentPreview.service === "rides"
                    ? "car"
                    : currentPreview.service === "grocery"
                    ? "bag"
                    : currentPreview.service === "courier"
                    ? "box"
                    : "food"
                }
                size={20}
                color={colors.accent}
              />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityCategory}>
                {serviceMeta[currentPreview.service].label.toUpperCase()} ·{" "}
                {currentPreview.status === 2
                  ? "ON THE WAY"
                  : currentPreview.status < 2
                  ? "CONFIRMED"
                  : "COMPLETED"}
              </Text>
              <Text style={styles.activityTitle}>{currentPreview.title}</Text>
              <Text style={styles.activityStatus}>
                {currentPreview.status < 3
                  ? "Arriving in 18 minutes"
                  : "Delivered safely"}
              </Text>
            </View>
            <Icon name="arrow" size={16} color={colors.muted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyActivityText}>
              No {activityTab} activity recorded.
            </Text>
          </View>
        )}

        {/* Menu Items List */}
        <View style={styles.menuList}>
          {menuItems.map(({ icon, label, route }) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.8}
              onPress={() => push(route as any)}
              style={styles.menuRow}
            >
              <View style={styles.menuIconBox}>
                <Icon name={icon} size={18} color={colors.accent} />
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <Icon name="arrow" size={16} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Explore Services */}
        <View style={styles.exploreSection}>
          <Text style={styles.exploreTitle}>Explore services</Text>
          <View style={styles.exploreButtonsRow}>
            {SERVICES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleSelectService(s)}
                style={styles.exploreBtn}
              >
                <Text style={styles.exploreBtnText}>
                  {serviceMeta[s].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
  },
  userPhone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
  },
  walletCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 12,
  },
  walletSmall: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1.1,
  },
  walletBalance: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 2,
  },
  walletSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  addMoneyBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  addMoneyBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
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
  activityTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  activityTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
  },
  activityTabBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  activityTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
  },
  activityTabTextActive: {
    color: "#ffffff",
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  activityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityCategory: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 2,
  },
  activityStatus: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  emptyActivity: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyActivityText: {
    fontSize: 11,
    color: colors.muted,
  },
  menuList: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginTop: 18,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  exploreSection: {
    marginTop: 22,
  },
  exploreTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  exploreButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  exploreBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  exploreBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
  },
});
