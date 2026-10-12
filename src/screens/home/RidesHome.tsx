import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import Header from "../../components/Header";
import ServiceTabs from "../../components/ServiceTabs";
import MapArt from "../../components/MapArt";
import LocationRows from "../../components/LocationRows";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { RIDE_OPTIONS, RENTAL_PACKAGES, type Service } from "../../data/demo";
import { rupees } from "../../lib/pricing";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function RidesHome() {
  const { push } = useNav();
  const { setService, state, setRide, placeById, showToast } = useApp();
  const [segment, setSegment] = useState<"book" | "rental">("book");
  const [selectedPackageId, setSelectedPackageId] = useState("pkg-2h");

  const selectedOption =
    RIDE_OPTIONS.find((r) => r.id === state.ride.optionId) ?? RIDE_OPTIONS[1];
  const selectedRental =
    RENTAL_PACKAGES.find((p) => p.id === selectedPackageId) ??
    RENTAL_PACKAGES[0];

  const handleSelectService = (s: Service) => {
    setService(s);
  };

  const handleSelectRide = (id: string) => {
    setRide({ optionId: id });
  };

  const handleBook = () => {
    if (segment === "rental") {
      if (!state.ride.dropId) {
        setRide({ dropId: state.ride.pickupId ?? "home" });
      }
      showToast(`${selectedRental.name} selected. Confirm your rental booking.`);
      push({ name: "rideConfirm" });
      return;
    }
    if (!state.ride.dropId) {
      showToast("Please choose your destination first.");
      push({ name: "places", mode: "rideDrop" });
      return;
    }
    push({ name: "rideConfirm" });
  };

  const pickupPlace = placeById(state.ride.pickupId) ?? state.places[0];
  const dropPlace = placeById(state.ride.dropId);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Dark Header & Tabs */}
      <View style={styles.topSection}>
        <Header dark />
        <ServiceTabs service="rides" onSelect={handleSelectService} />

        {/* Segment Switcher */}
        <View style={styles.segment}>
          <Pressable
            onPress={() => setSegment("book")}
            style={[
              styles.segmentBtn,
              segment === "book" && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                segment === "book" && styles.segmentTextActive,
              ]}
            >
              Book a ride
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSegment("rental")}
            style={[
              styles.segmentBtn,
              segment === "rental" && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                segment === "rental" && styles.segmentTextActive,
              ]}
            >
              Hourly rental
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Map Preview */}
      <View style={styles.mapBox}>
        <MapArt
          origin={pickupPlace?.coords}
          destination={dropPlace?.coords}
          etaText={selectedOption.eta}
          etaUnit={dropPlace ? "to arrival" : "away"}
        />
      </View>

      {/* Pickup & Destination Rows */}
      <LocationRows />

      {/* Hourly Rental Package Selector */}
      {segment === "rental" && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Select package duration</Text>
            <Text style={styles.sectionSub}>Multiple stops included</Text>
          </View>

          <View style={styles.rentalGrid}>
            {RENTAL_PACKAGES.map((pkg) => {
              const isSel = pkg.id === selectedPackageId;
              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => setSelectedPackageId(pkg.id)}
                  style={[
                    styles.rentalCard,
                    isSel && styles.rentalCardActive,
                  ]}
                >
                  <Text style={[styles.rentalHours, isSel && styles.rentalAccent]}>
                    {pkg.hours} Hours
                  </Text>
                  <Text style={styles.rentalKm}>{pkg.km} km</Text>
                  <Text style={[styles.rentalFare, isSel && styles.rentalAccent]}>
                    {rupees(pkg.fare)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Vehicle Options */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            {segment === "rental" ? "Choose vehicle" : "Choose a ride"}
          </Text>
          <Text style={styles.sectionSub}>Fare estimate</Text>
        </View>

        <View style={styles.vehicleGrid}>
          {RIDE_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedOption.id;
            const displayFare =
              segment === "rental"
                ? opt.id === "bike"
                  ? rupees(Math.round(selectedRental.fare * 0.6))
                  : opt.id === "auto"
                  ? rupees(selectedRental.fare)
                  : opt.id === "cab"
                  ? rupees(Math.round(selectedRental.fare * 1.5))
                  : rupees(Math.round(selectedRental.fare * 2.1))
                : opt.range;

            return (
              <Pressable
                key={opt.name}
                onPress={() => handleSelectRide(opt.id)}
                style={[
                  styles.vehicleCard,
                  isSelected && styles.vehicleCardActive,
                ]}
              >
                <View
                  style={[
                    styles.vehicleAbbrCircle,
                    isSelected && styles.vehicleAbbrCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.vehicleAbbrText,
                      isSelected && styles.vehicleAbbrTextActive,
                    ]}
                  >
                    {opt.abbr}
                  </Text>
                </View>
                <Text style={styles.vehicleName}>{opt.name}</Text>
                <Text style={styles.vehicleFare}>{displayFare}</Text>
                <Text style={styles.vehicleEta}>{opt.eta}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Book CTA */}
      <View style={styles.ctaWrap}>
        <Button
          onPress={handleBook}
          accentColor={colors.services.rides.accent}
        >
          <Text style={styles.ctaText}>
            {segment === "rental"
              ? `Book ${selectedOption.name} · ${selectedRental.name}`
              : `Book ${selectedOption.name} · ${selectedOption.range}`}
          </Text>
          <Icon name="arrow" size={18} color="#ffffff" />
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topSection: {
    backgroundColor: "#171514",
    paddingBottom: 16,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    borderRadius: radii.md,
    padding: 4,
    marginTop: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: colors.services.rides.accent,
  },
  segmentText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  mapBox: {
    height: 190,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.muted,
  },
  rentalGrid: {
    flexDirection: "row",
    gap: 8,
  },
  rentalCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    gap: 3,
  },
  rentalCardActive: {
    backgroundColor: colors.services.rides.accentSoft,
    borderColor: colors.services.rides.accent,
    borderWidth: 2,
  },
  rentalHours: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  rentalKm: {
    fontSize: 10,
    color: colors.muted,
  },
  rentalFare: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 2,
  },
  rentalAccent: {
    color: colors.services.rides.accent,
  },
  vehicleGrid: {
    flexDirection: "row",
    gap: 8,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  vehicleCardActive: {
    borderColor: colors.services.rides.accent,
    backgroundColor: colors.services.rides.badge,
  },
  vehicleAbbrCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  vehicleAbbrCircleActive: {
    backgroundColor: colors.services.rides.accent,
  },
  vehicleAbbrText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  vehicleAbbrTextActive: {
    color: "#ffffff",
  },
  vehicleName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  vehicleFare: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.services.rides.accent,
    marginTop: 2,
  },
  vehicleEta: {
    fontSize: 9.5,
    color: colors.muted,
    marginTop: 1,
  },
  ctaWrap: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
});
