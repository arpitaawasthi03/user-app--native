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
import LocationRows from "../../components/LocationRows";
import BillSummary from "../../components/BillSummary";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import {
  PACKAGE_TYPES,
  RESTAURANTS,
  RIDE_OPTIONS,
  serviceMeta,
} from "../../data/demo";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function NavCart() {
  const { push, switchTab } = useNav();
  const { state, changeQty, itemTotal } = useApp();
  const service = state.service;

  const total = itemTotal(service);

  const getServiceContent = () => {
    switch (service) {
      case "food": {
        const lines = state.carts.food.lines;
        const main = lines[0] ?? {
          name: "Lucknowi Chicken Biryani",
          subtitle: "Royal Biryani House",
          price: 289,
          qty: 1,
        };
        const store =
          RESTAURANTS.find((r) => r.id === state.carts.food.storeId) ??
          RESTAURANTS[0];
        return {
          title: "Your food cart",
          subtitle: store.name,
          item: main.name,
          detail: `${lines.length || 1} item · Delivery in ${store.eta}`,
          price: rupees(total > 0 ? total : 289),
          icon: "food" as const,
          qty: main.qty,
          id: main.id,
        };
      }
      case "rides": {
        const opt =
          RIDE_OPTIONS.find((r) => r.id === state.ride.optionId) ??
          RIDE_OPTIONS[1];
        return {
          title: "Current ride",
          subtitle: "Booking summary",
          item: `${opt.name} to Gomti Nagar`,
          detail: `Pickup: Hazratganj · ${opt.eta} away`,
          price: rupees(opt.fare),
          icon: "car" as const,
          qty: 1,
          id: opt.id,
        };
      }
      case "grocery": {
        const lines = state.carts.grocery.lines;
        const count = lines.reduce((n, l) => n + l.qty, 0) || 2;
        return {
          title: "Your grocery cart",
          subtitle: `${count} daily essentials`,
          item: "Fresh produce basket",
          detail: "Tomatoes, organic broccoli · 15 min",
          price: rupees(total > 0 ? total : 328),
          icon: "bag" as const,
          qty: count,
          id: lines[0]?.id ?? "gr-tomatoes",
        };
      }
      case "courier": {
        const pkg =
          PACKAGE_TYPES.find((p) => p.id === state.courier.packageId) ??
          PACKAGE_TYPES[1];
        return {
          title: "Package in progress",
          subtitle: "Your delivery quote",
          item: `${pkg.name} · ${pkg.weight}`,
          detail: "Hazratganj to Gomti Nagar · 6.2 km",
          price: rupees(pkg.price),
          icon: "box" as const,
          qty: 1,
          id: pkg.id,
        };
      }
    }
  };

  const content = getServiceContent();

  const handleCheckout = () => {
    push({ name: "cart", service });
  };

  const handleBrowse = () => {
    switchTab("home");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <UtilityHeader
        title={content.title}
        subtitle={serviceMeta[service].label.toUpperCase()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Context Chip */}
        <View style={styles.contextChip}>
          <Icon name={content.icon} size={15} color={colors.accent} />
          <Text style={styles.contextChipText}>
            {serviceMeta[service].label}
          </Text>
        </View>

        {/* Highlight Card */}
        <View style={styles.cartCard}>
          <View style={styles.cardIconBox}>
            <Icon name={content.icon} size={24} color={colors.accent} />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardSubtitle}>{content.subtitle}</Text>
            <Text style={styles.cardItemTitle}>{content.item}</Text>
            <Text style={styles.cardDetailText}>{content.detail}</Text>
            <Text style={styles.cardPrice}>{content.price}</Text>
          </View>
        </View>

        {/* Quantity Stepper (Food / Grocery) or Route Summary (Rides / Courier) */}
        {service === "food" || service === "grocery" ? (
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => changeQty(service, content.id, -1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperQty}>{content.qty}</Text>
              <TouchableOpacity
                onPress={() => changeQty(service, content.id, 1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.routeSummary}>
            <LocationRows courier={service === "courier"} />
          </View>
        )}

        <BillSummary service={service} />

        <TouchableOpacity onPress={handleBrowse} style={styles.browseLink}>
          <Text style={styles.browseLinkText}>
            Continue browsing {serviceMeta[service].label}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionPad}>
          <Button onPress={handleCheckout}>
            {service === "rides"
              ? "Continue booking"
              : service === "courier"
              ? "Review quote"
              : "Proceed to checkout"}
          </Button>
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
  contextChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    marginBottom: 12,
  },
  contextChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
  },
  cartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardDetails: {
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
  },
  cardItemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 2,
  },
  cardDetailText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.accent,
    marginTop: 4,
  },
  quantityRow: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  stepperQty: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    minWidth: 18,
    textAlign: "center",
  },
  routeSummary: {
    marginBottom: 12,
  },
  browseLink: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  browseLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
  actionPad: {
    marginTop: 14,
  },
});
