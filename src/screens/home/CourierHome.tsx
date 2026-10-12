import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  TextInput,
  Pressable,
} from "react-native";
import Header from "../../components/Header";
import ServiceTabs from "../../components/ServiceTabs";
import LocationRows from "../../components/LocationRows";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { PACKAGE_TYPES, PHOTOS, type Service } from "../../data/demo";
import { fetchPackageTypes } from "../../lib/supabaseData";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function CourierHome() {
  const { push } = useNav();
  const { setService, state, setCourier, showToast } = useApp();
  const [segment, setSegment] = useState<"send" | "track">("send");
  const [trackInput, setTrackInput] = useState("");
  const [packageTypes, setPackageTypes] = useState<typeof PACKAGE_TYPES>(PACKAGE_TYPES);

  useEffect(() => {
    let isMounted = true;
    fetchPackageTypes().then((types) => {
      if (isMounted && types.length > 0) {
        setPackageTypes(types);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPackage =
    packageTypes.find((p) => p.id === state.courier.packageId) ??
    packageTypes[0];

  const handleSelectService = (s: Service) => {
    setService(s);
  };

  const handleSelectPackage = (id: string) => {
    setCourier({ packageId: id });
  };

  const handleGetQuote = () => {
    if (!state.courier.dropId) {
      showToast("Please enter the delivery address.");
      push({ name: "places", mode: "courierDrop" });
      return;
    }
    push({ name: "detail", service: "courier" });
  };

  const handleTrack = () => {
    const courierOrder = state.orders.find(
      (o) =>
        o.service === "courier" &&
        (o.id.toLowerCase() === trackInput.trim().toLowerCase() ||
          !trackInput.trim())
    );
    if (courierOrder) {
      push({ name: "status", orderId: courierOrder.id, view: "tracking" });
    } else {
      showToast("Tracking active courier order RR10418.");
      push({ name: "status", orderId: "RR10418", view: "tracking" });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <ImageBackground
        source={{ uri: PHOTOS.rider }}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
        <Header dark />
        <ServiceTabs service="courier" onSelect={handleSelectService} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>FAST · SAFE · RELIABLE</Text>
          <Text style={styles.heroTitle}>
            Send anything,{"\n"}anywhere.
          </Text>
          <Text style={styles.heroSub}>Doorstep pickup in minutes</Text>
        </View>
      </ImageBackground>

      {/* Main Sheet */}
      <View style={styles.sheet}>
        {/* Segment */}
        <View style={styles.segment}>
          <Pressable
            onPress={() => setSegment("send")}
            style={[
              styles.segmentBtn,
              segment === "send" && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                segment === "send" && styles.segmentTextActive,
              ]}
            >
              Send package
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSegment("track")}
            style={[
              styles.segmentBtn,
              segment === "track" && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                segment === "track" && styles.segmentTextActive,
              ]}
            >
              Track package
            </Text>
          </Pressable>
        </View>

        {segment === "send" ? (
          <>
            <LocationRows courier />

            {/* Package Type */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Package type</Text>
              </View>

              <View style={styles.packageGrid}>
                {packageTypes.map((pkg) => {
                  const isSelected = pkg.id === selectedPackage.id;
                  return (
                    <Pressable
                      key={pkg.id || pkg.name}
                      onPress={() => handleSelectPackage(pkg.id)}
                      style={[
                        styles.packageCard,
                        isSelected && styles.packageCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.packageAbbrCircle,
                          isSelected && styles.packageAbbrCircleActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.packageAbbrText,
                            isSelected && styles.packageAbbrTextActive,
                          ]}
                        >
                          {pkg.abbr}
                        </Text>
                      </View>
                      <Text style={styles.packageName}>{pkg.name}</Text>
                      <Text style={styles.packageWeight}>{pkg.weight}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Price Estimate Card */}
            <View style={styles.estimateCard}>
              <View>
                <Text style={styles.estimateSub}>ESTIMATED PRICE</Text>
                <Text style={styles.estimateTitle}>{selectedPackage.range}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.estimateSub}>DELIVERY</Text>
                <Text style={styles.estimateTime}>{selectedPackage.time}</Text>
              </View>
            </View>

            {/* CTA */}
            <View style={styles.ctaWrap}>
              <Button
                onPress={handleGetQuote}
                accentColor={colors.services.courier.accent}
              >
                <Text style={styles.ctaText}>Get quote</Text>
                <Icon name="arrow" size={18} color="#ffffff" />
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.trackSection}>
            <Text style={styles.trackSub}>
              Enter your RoadRider tracking number or parcel code:
            </Text>
            <View style={styles.trackInputRow}>
              <TextInput
                value={trackInput}
                onChangeText={setTrackInput}
                placeholder="e.g. RR10418"
                placeholderTextColor={colors.muted}
                style={styles.trackInput}
                autoCapitalize="characters"
              />
              <Pressable onPress={handleTrack} style={styles.trackBtn}>
                <Text style={styles.trackBtnText}>Track</Text>
              </Pressable>
            </View>

            <View style={styles.trackHelper}>
              <Text style={styles.trackHelperText}>
                Active test tracking code: <Text style={styles.boldCode}>RR10418</Text>
              </Text>
            </View>
          </View>
        )}
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
  hero: {
    paddingBottom: 24,
    backgroundColor: "#171514",
    position: "relative",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(16, 10, 8, 0.65)",
  },
  heroCopy: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fb923c",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  sheet: {
    paddingTop: 8,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: radii.md,
    padding: 4,
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: colors.services.courier.accent,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionHeading: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  packageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  packageCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
  },
  packageCardActive: {
    borderColor: colors.services.courier.accent,
    backgroundColor: colors.services.courier.badge,
  },
  packageAbbrCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  packageAbbrCircleActive: {
    backgroundColor: colors.services.courier.accent,
  },
  packageAbbrText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.ink,
  },
  packageAbbrTextActive: {
    color: "#ffffff",
  },
  packageName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  packageWeight: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  estimateCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: radii.md,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  estimateSub: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  estimateTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  estimateTime: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.services.courier.accent,
  },
  ctaWrap: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  trackSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  trackSub: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  trackInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  trackInput: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  trackBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.services.courier.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  trackBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  trackHelper: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: radii.md,
  },
  trackHelperText: {
    fontSize: 12,
    color: colors.muted,
  },
  boldCode: {
    fontWeight: "800",
    color: colors.ink,
  },
});
