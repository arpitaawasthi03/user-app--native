import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlowHeader from "../../components/FlowHeader";
import BillSummary from "../../components/BillSummary";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { PACKAGE_TYPES, RIDE_OPTIONS, type Service } from "../../data/demo";
import { rupees, validatePromo } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface CartProps {
  service: Service;
}

export default function Cart({ service }: CartProps) {
  const { push } = useNav();
  const { state, changeQty, itemTotal, applyPromo, showToast } = useApp();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const total = itemTotal(service);
  const appliedPromo = state.promos[service] ?? null;

  const handleApplyPromoCode = () => {
    const res = validatePromo(promoInput, service, state.usedPromos, total);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    applyPromo(service, res.code);
    showToast(`Code ${res.code} applied successfully!`);
    setShowPromoModal(false);
    setPromoInput("");
  };

  const handleRemovePromo = () => {
    applyPromo(service, null);
    showToast("Promo removed");
  };

  const handleContinue = () => {
    if (total <= 0) {
      showToast("Your cart is empty. Please add items.");
      return;
    }
    if (service === "rides") {
      push({ name: "payment", service: "rides" });
    } else {
      push({ name: "address", service });
    }
  };

  const title = service === "rides" ? "Ride summary" : "Your cart";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={["top"]}>
        <FlowHeader title={title} />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Line Items */}
        {service === "food" || service === "grocery" ? (
          <>
            {state.carts[service].lines.length === 0 ? (
              <View style={styles.emptyCartCard}>
                <Text style={styles.emptyCartText}>
                  Your {service} cart is currently empty.
                </Text>
                <TouchableOpacity
                  onPress={() => push({ name: "detail", service })}
                  style={styles.browseBtn}
                >
                  <Text style={styles.browseBtnText}>Browse items</Text>
                </TouchableOpacity>
              </View>
            ) : (
              state.carts[service].lines.map((line) => (
                <View key={line.id} style={styles.cartItem}>
                  <View style={styles.itemThumb}>
                    <Icon
                      name={service === "food" ? "food" : "bag"}
                      size={20}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{line.name}</Text>
                    <Text style={styles.itemSubtitle}>{line.subtitle}</Text>
                    <Text style={styles.itemPrice}>
                      {rupees(line.price * line.qty)}
                    </Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => changeQty(service, line.id, -1)}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{line.qty}</Text>
                    <TouchableOpacity
                      onPress={() => changeQty(service, line.id, 1)}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : service === "rides" ? (
          (() => {
            const opt =
              RIDE_OPTIONS.find((r) => r.id === state.ride.optionId) ??
              RIDE_OPTIONS[1];
            return (
              <View style={styles.cartItem}>
                <View style={styles.itemThumb}>
                  <Icon name="car" size={20} color={colors.accent} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{opt.name} Ride</Text>
                  <Text style={styles.itemSubtitle}>
                    Arrival in {opt.eta} · Everyday commute
                  </Text>
                  <Text style={styles.itemPrice}>{rupees(opt.fare)}</Text>
                </View>
              </View>
            );
          })()
        ) : (
          (() => {
            const pkg =
              PACKAGE_TYPES.find((p) => p.id === state.courier.packageId) ??
              PACKAGE_TYPES[1];
            return (
              <View style={styles.cartItem}>
                <View style={styles.itemThumb}>
                  <Icon name="box" size={20} color={colors.accent} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>
                    {pkg.name} ({pkg.weight})
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    Standard delivery · {pkg.time}
                  </Text>
                  <Text style={styles.itemPrice}>{rupees(pkg.price)}</Text>
                </View>
              </View>
            );
          })()
        )}

        {/* Promo code button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowPromoModal(true)}
          style={styles.promoRow}
        >
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>%</Text>
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>
              {appliedPromo
                ? `Promo ${appliedPromo} applied`
                : "Apply a promo code"}
            </Text>
            <Text style={styles.promoSubtitle}>
              {appliedPromo
                ? "Tap to change or remove"
                : "Save more on this order"}
            </Text>
          </View>
          <Icon name="arrow" size={18} color={colors.muted} />
        </TouchableOpacity>

        {/* Bill Summary */}
        <BillSummary service={service} />
      </ScrollView>

      {/* Promo Modal Sheet */}
      <Modal
        visible={showPromoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPromoModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPromoModal(false)}
        >
          <Pressable
            style={styles.promoDialog}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Enter Coupon Code</Text>
              <TouchableOpacity onPress={() => setShowPromoModal(false)}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.promoInputRow}>
              <TextInput
                placeholder="e.g. WELCOME50"
                placeholderTextColor={colors.muted}
                value={promoInput}
                onChangeText={(text) => setPromoInput(text.toUpperCase())}
                autoCapitalize="characters"
                style={styles.promoTextInput}
              />
              <TouchableOpacity
                onPress={handleApplyPromoCode}
                style={styles.promoApplyBtn}
              >
                <Text style={styles.promoApplyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {Boolean(appliedPromo) && (
              <TouchableOpacity
                onPress={handleRemovePromo}
                style={styles.removePromoBtn}
              >
                <Text style={styles.removePromoText}>
                  Remove current code ({appliedPromo})
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.promoHint}>
              Available for you: <Text style={styles.boldText}>WELCOME50</Text>{" "}
              (50% off first order)
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Continue Action */}
      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <Button onPress={handleContinue} disabled={total <= 0}>
          Continue
        </Button>
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
    paddingTop: 12,
    paddingBottom: 90,
  },
  emptyCartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 10,
  },
  emptyCartText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  browseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  browseBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  cartItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  itemSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
    marginTop: 4,
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
  promoRow: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  promoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  promoBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.accent,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  promoSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  promoDialog: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  dialogCancelText: {
    fontSize: 12,
    color: colors.muted,
  },
  promoInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  promoTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.ink,
  },
  promoApplyBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  promoApplyBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  removePromoBtn: {
    marginTop: 8,
  },
  removePromoText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#dc2626",
  },
  promoHint: {
    marginTop: 12,
    fontSize: 11,
    color: colors.muted,
  },
  boldText: {
    fontWeight: "700",
    color: colors.ink,
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
