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
import FlowHeader from "../../components/FlowHeader";
import MapArt from "../../components/MapArt";
import LocationRows from "../../components/LocationRows";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { RIDE_OPTIONS } from "../../data/demo";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function RideConfirm() {
  const { push } = useNav();
  const { state } = useApp();

  const opt =
    RIDE_OPTIONS.find((r) => r.id === state.ride.optionId) ?? RIDE_OPTIONS[1];

  const pickupPlace =
    state.places.find((p) => p.id === state.ride.pickupId) ?? state.places[0];
  const dropPlace =
    state.places.find((p) => p.id === state.ride.dropId) ??
    state.places[1] ??
    state.places[0];

  const pickupCoords = pickupPlace?.coords
    ? { ...pickupPlace.coords, label: pickupPlace.label }
    : undefined;
  const dropCoords = dropPlace?.coords
    ? { ...dropPlace.coords, label: dropPlace.label }
    : undefined;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={["top"]}>
        <FlowHeader title="Confirm booking" />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Route Preview */}
        <View style={styles.mapContainer}>
          <MapArt
            origin={pickupCoords}
            destination={dropCoords}
            etaText={opt.eta}
            etaUnit="arrival"
          />
        </View>

        {/* Driver / Ride Preview Card */}
        <View style={styles.driverPreview}>
          <View style={styles.vehicleIconBadge}>
            <Icon name="car" size={24} color={colors.accent} />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverSmall}>YOUR RIDE</Text>
            <Text style={styles.driverName}>{opt.name}</Text>
            <Text style={styles.driverTagline}>{opt.tagline}</Text>
          </View>
          <Text style={styles.driverFare}>{rupees(opt.fare)}</Text>
        </View>

        {/* Location Pickup & Drop Rows */}
        <View style={styles.locationsWrapper}>
          <LocationRows />
        </View>

        {/* ETA Info Strip */}
        <View style={styles.infoStrip}>
          <Icon name="clock" size={15} color={colors.accent} />
          <Text style={styles.infoStripText}>
            Driver arrives in <Text style={styles.boldText}>{opt.eta}</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => push({ name: "paymentMethods" })}
          style={styles.payRow}
        >
          <View style={styles.payRowLeft}>
            <Icon name="card" size={18} color={colors.ink} />
            <Text style={styles.payRowLabel}>RoadRider Wallet</Text>
          </View>
          <View style={styles.payRowRight}>
            <Text style={styles.payRowBalance}>
              {rupees(state.wallet.balance)}
            </Text>
            <Icon name="arrow" size={16} color={colors.muted} />
          </View>
        </TouchableOpacity>

        <Button onPress={() => push({ name: "cart", service: "rides" })}>
          Confirm {opt.name} · {rupees(opt.fare)}
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
    paddingBottom: 130,
  },
  mapContainer: {
    height: 220,
    width: "100%",
    backgroundColor: "#161c24",
  },
  driverPreview: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  vehicleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  driverInfo: {
    flex: 1,
  },
  driverSmall: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 1.1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 2,
  },
  driverTagline: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  driverFare: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.accent,
  },
  locationsWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  infoStrip: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(224, 90, 15, 0.2)",
  },
  infoStripText: {
    fontSize: 12,
    color: colors.ink,
  },
  boldText: {
    fontWeight: "700",
    color: colors.accent,
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
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.canvas,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  payRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  payRowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  payRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  payRowBalance: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
});
