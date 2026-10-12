import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapArt from "../../components/MapArt";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import type { EtaResult } from "../../components/GoogleMap";
import { RESTAURANTS, GROCERY_HUB, PARTNER } from "../../data/demo";
import { PRESET_COORDS, type LatLng } from "../../lib/googleMaps";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface OrderStatusProps {
  orderId: string;
  initialView?: "confirmed" | "tracking";
}

export default function OrderStatus({
  orderId,
  initialView = "confirmed",
}: OrderStatusProps) {
  const { push } = useNav();
  const { state, setOrderStatus, showToast } = useApp();
  const [view, setView] = useState<"confirmed" | "tracking">(initialView);
  const [liveEta, setLiveEta] = useState<EtaResult | null>(null);

  const order = state.orders.find((o) => o.id === orderId) ?? state.orders[0];
  const isRide = order?.service === "rides";

  // Fetch restaurant from mock data
  const restaurant = useMemo(() => {
    if (order?.service === "food") {
      return (
        RESTAURANTS.find(
          (r) =>
            r.name.toLowerCase() === order.title?.toLowerCase() ||
            r.id === (order as any).storeId
        ) || RESTAURANTS[0]
      );
    }
    return null;
  }, [order]);

  // Destination from user's current place
  const userPlace =
    state.places.find((p) => p.id === state.defaultPlaceId) ?? state.places[0];
  const destinationCoords: LatLng = useMemo(() => {
    if (userPlace?.coords) {
      return { ...userPlace.coords, label: userPlace.label };
    }
    return PRESET_COORDS.home;
  }, [userPlace]);

  // Origin coords based on restaurant from mock data, grocery hub, or preset
  const originCoords: LatLng = useMemo(() => {
    if (restaurant) {
      return { ...restaurant.coords, label: restaurant.name };
    }
    if (order?.service === "grocery") {
      return { ...GROCERY_HUB.coords, label: GROCERY_HUB.name };
    }
    if (isRide) {
      return PRESET_COORDS.home;
    }
    return PRESET_COORDS.aminabad;
  }, [restaurant, order?.service, isRide]);

  // Driver position along the route
  const driverCoords: LatLng = useMemo(() => {
    const lat = originCoords.lat * 0.45 + destinationCoords.lat * 0.55;
    const lng = originCoords.lng * 0.45 + destinationCoords.lng * 0.55;
    return { lat, lng, label: `${PARTNER.name} (Driver)` };
  }, [originCoords, destinationCoords]);

  const handleNext = () => {
    if (view === "confirmed") {
      setView("tracking");
    } else {
      if (order) {
        setOrderStatus(order.id, 3);
      }
      push({ name: "complete", orderId });
    }
  };

  const handleCallPartner = () => {
    showToast(
      `Calling RoadRider Partner ${PARTNER.name} (+91 98765 00123)...`
    );
  };

  const currentStep = order?.status ?? (view === "tracking" ? 2 : 0);
  const displayDuration = liveEta
    ? liveEta.durationText
    : isRide
    ? "4 min"
    : "18 min";
  const displayDistance = liveEta?.distanceText;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Map Header with Float Buttons */}
      <View style={styles.mapContainer}>
        <MapArt
          origin={originCoords}
          destination={destinationCoords}
          driver={driverCoords}
          etaText={displayDuration}
          etaUnit="away"
          onEtaCalculated={setLiveEta}
        />

        <SafeAreaView style={styles.statusTopBar} edges={["top"]}>
          <Logo />
          <TouchableOpacity
            onPress={() => push({ name: "help", orderId })}
            style={styles.helpBtn}
          >
            <Text style={styles.helpBtnText}>Help</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Tracking Bottom Sheet */}
      <View style={styles.trackingSheet}>
        <View style={styles.dragBar} />

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>
            {view === "confirmed"
              ? "BOOKING CONFIRMED"
              : "LIVE REAL-TIME TRACKING"}
          </Text>

          <Text style={styles.sheetHeading}>
            {view === "confirmed"
              ? isRide
                ? `Meet ${PARTNER.name.split(" ")[0]}, your driver`
                : "We're on it!"
              : isRide
              ? "You're on your way"
              : `Arriving in ${displayDuration}`}
          </Text>

          <Text style={styles.sheetDesc}>
            {view === "confirmed"
              ? "Everything is set. We'll keep you updated with real-time status."
              : restaurant
              ? `Dispatched from ${restaurant.name} (${restaurant.address}) · ${
                  displayDistance
                    ? `${displayDistance} away via Google Maps`
                    : "Live Google Maps route"
                }.`
              : `Your RoadRider partner is moving smoothly toward the destination${
                  displayDistance ? ` (${displayDistance})` : ""
                }.`}
          </Text>

          {/* Partner Card */}
          <View style={styles.partnerCard}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.avatarText}>{PARTNER.initials}</Text>
            </View>
            <View style={styles.partnerDetails}>
              <Text style={styles.partnerName}>{PARTNER.name}</Text>
              <View style={styles.partnerStats}>
                <Icon name="star" size={12} filled color="#f59e0b" />
                <Text style={styles.partnerStatsText}>
                  {" "}
                  {PARTNER.rating} · {PARTNER.trips} deliveries
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCallPartner}
              style={styles.phoneBtn}
            >
              <Icon name="phone" size={18} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* 4-Step Progress Indicator */}
          <View style={styles.statusSteps}>
            {["Confirmed", "Picked up", "On the way", "Delivered"].map(
              (label, i) => {
                const isDone = i <= currentStep;
                return (
                  <View key={label} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                      ]}
                    >
                      {isDone && <Icon name="check" size={10} color="#ffffff" />}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isDone && styles.stepLabelDone,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                );
              }
            )}
          </View>

          <View style={{ marginTop: 18 }}>
            <Button onPress={handleNext}>
              {view === "confirmed"
                ? "View live tracking"
                : isRide
                ? "Complete trip"
                : "Mark as delivered"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  mapContainer: {
    height: "44%",
    width: "100%",
    backgroundColor: "#161c24",
    position: "relative",
  },
  statusTopBar: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  helpBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  trackingSheet: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sheetHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 4,
  },
  sheetDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginTop: 4,
  },
  partnerCard: {
    marginTop: 14,
    backgroundColor: colors.canvas,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  partnerStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  partnerStatsText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  statusSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepDotDone: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.muted,
    textAlign: "center",
  },
  stepLabelDone: {
    color: colors.ink,
    fontWeight: "700",
  },
});
