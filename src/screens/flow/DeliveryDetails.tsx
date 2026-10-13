import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import FlowHeader from "../../components/FlowHeader";
import MapArt from "../../components/MapArt";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { RESTAURANTS, GROCERY_HUB, type Service, type Place } from "../../data/demo";
import { PRESET_COORDS, DEFAULT_CENTER, type LatLng } from "../../lib/googleMaps";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface DeliveryDetailsProps {
  service: Service;
}

export default function DeliveryDetails({ service }: DeliveryDetailsProps) {
  const { push } = useNav();
  const { state, setDefaultPlace, addPlace, showToast } = useApp();

  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsPlace, setGpsPlace] = useState<Place | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    // If food service, default selection starts on current-gps if available, otherwise default place
    service === "food" ? "current-gps" : state.defaultPlaceId
  );
  const [saveForFutureOrders, setSaveForFutureOrders] = useState(true);

  // Fetch current GPS location on mount
  useEffect(() => {
    let isMounted = true;
    const fetchGps = async () => {
      setDetectingGps(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) setDetectingGps(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = pos.coords;
        let label = "Current Location (GPS)";
        let area = "Lucknow, Uttar Pradesh";
        let line = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

        try {
          const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (rev && rev.length > 0) {
            const r = rev[0];
            label = r.name || r.street || "Current Location";
            area = [r.district, r.city || "Lucknow"].filter(Boolean).join(", ");
            line = [r.street, r.district, r.city].filter(Boolean).join(", ") || line;
          }
        } catch {}

        if (isMounted) {
          const detected: Place = {
            id: "current-gps",
            label,
            line,
            area,
            icon: "pin",
            coords: { lat: latitude, lng: longitude },
          };
          setGpsPlace(detected);
          setDetectingGps(false);
        }
      } catch (err) {
        if (isMounted) setDetectingGps(false);
      }
    };

    fetchGps();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentCart =
    service === "food" || service === "grocery" ? state.carts[service] : null;
  const store =
    service === "food"
      ? RESTAURANTS.find((r) => r.id === currentCart?.storeId) || RESTAURANTS[0]
      : service === "grocery"
      ? GROCERY_HUB
      : null;

  // Compute active destination coords for the mini map
  const activePlace =
    selectedPlaceId === "current-gps" && gpsPlace
      ? gpsPlace
      : state.places.find((p) => p.id === selectedPlaceId) ??
        state.places[0];

  const originCoords: LatLng = store
    ? { ...store.coords, label: store.name }
    : PRESET_COORDS.restaurant;
  const destCoords: LatLng = activePlace?.coords
    ? { ...activePlace.coords, label: activePlace.label }
    : DEFAULT_CENTER;

  const handleSelectPlace = (id: string) => {
    setSelectedPlaceId(id);
    if (id !== "current-gps") {
      setDefaultPlace(id);
    }
  };

  const handleDeliverHere = () => {
    if (selectedPlaceId === "current-gps" && gpsPlace) {
      if (saveForFutureOrders) {
        // Save to address book for future orders
        const saved = addPlace({
          label:
            gpsPlace.label === "Current Location (GPS)"
              ? "Current Location"
              : gpsPlace.label,
          line: gpsPlace.line,
          area: gpsPlace.area,
          icon: "pin",
          coords: gpsPlace.coords,
        });
        setDefaultPlace(saved.id);
        showToast("📍 Address saved for future orders");
      } else {
        // Use for current delivery session
        const temp = addPlace({
          label: gpsPlace.label,
          line: gpsPlace.line,
          area: gpsPlace.area,
          icon: "pin",
          coords: gpsPlace.coords,
        });
        setDefaultPlace(temp.id);
        showToast("📍 Current location confirmed");
      }
      push({ name: "payment", service });
      return;
    }

    if (!state.defaultPlaceId && state.places.length === 0) {
      showToast("Please add a delivery address.");
      push({ name: "addAddress", mode: "delivery" });
      return;
    }

    push({ name: "payment", service });
  };

  const isCurrentGpsSelected = selectedPlaceId === "current-gps";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={["top"]}>
        <FlowHeader title="Delivery details" />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Mini Banner */}
        <View style={styles.mapMini}>
          <MapArt
            origin={originCoords}
            destination={destCoords}
            etaText={
              service === "food" && store && "etaShort" in store
                ? (store as any).etaShort
                : "20 min"
            }
          />
        </View>

        {/* Section Heading with + Add new */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Choose delivery address</Text>
          <TouchableOpacity
            onPress={() => push({ name: "addAddress", mode: "delivery" })}
          >
            <Text style={styles.addNewText}>+ Add new</Text>
          </TouchableOpacity>
        </View>

        {/* Address Selection List */}
        <View style={styles.addressList}>
          {/* First Option: User's Current Location (GPS) */}
          <View
            style={[
              styles.addressCard,
              styles.gpsAddressCard,
              isCurrentGpsSelected && styles.addressCardSelected,
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectPlace("current-gps")}
              style={styles.cardHeaderRow}
            >
              <View
                style={[
                  styles.iconBox,
                  styles.gpsIconBox,
                  isCurrentGpsSelected && styles.iconBoxSelected,
                ]}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Icon
                    name="pin"
                    size={20}
                    color={isCurrentGpsSelected ? colors.accent : colors.ink}
                  />
                )}
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.titleTagRow}>
                  <Text style={styles.addressLabel}>
                    {gpsPlace ? gpsPlace.label : "Current Location (GPS)"}
                  </Text>
                  <View style={styles.firstOptionBadge}>
                    <Text style={styles.firstOptionBadgeText}>1st Option</Text>
                  </View>
                </View>
                <Text style={styles.addressLine} numberOfLines={2}>
                  {gpsPlace
                    ? gpsPlace.line || gpsPlace.area
                    : detectingGps
                    ? "Detecting live GPS location..."
                    : "Tap to use device coordinates for instant delivery"}
                </Text>
              </View>

              <View style={styles.radioOuter}>
                {isCurrentGpsSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Save for future orders option (visible when current location is selected) */}
            {isCurrentGpsSelected && (
              <View style={styles.saveFutureBox}>
                <View style={styles.saveFutureTextCol}>
                  <Text style={styles.saveFutureTitle}>
                    Save for future orders
                  </Text>
                  <Text style={styles.saveFutureSub}>
                    Save this address to your profile for future checkouts
                  </Text>
                </View>
                <Switch
                  value={saveForFutureOrders}
                  onValueChange={setSaveForFutureOrders}
                  trackColor={{ false: "#d1d5db", true: colors.accent }}
                  thumbColor="#ffffff"
                />
              </View>
            )}
          </View>

          {/* Saved Addresses List */}
          {state.places.map((place) => {
            const isSelected = selectedPlaceId === place.id;
            return (
              <TouchableOpacity
                key={place.id}
                activeOpacity={0.8}
                onPress={() => handleSelectPlace(place.id)}
                style={[
                  styles.addressCard,
                  isSelected && styles.addressCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.iconBoxSelected,
                  ]}
                >
                  <Icon
                    name={place.icon}
                    size={20}
                    color={isSelected ? colors.accent : colors.muted}
                  />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{place.label}</Text>
                  <Text style={styles.addressLine} numberOfLines={1}>
                    {place.line}
                  </Text>
                </View>
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Deliver Here CTA */}
      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <Button onPress={handleDeliverHere}>Deliver here</Button>
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
    paddingBottom: 90,
  },
  mapMini: {
    height: 180,
    width: "100%",
    backgroundColor: "#161c24",
  },
  sectionHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  addNewText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  addressList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  addressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  gpsAddressCard: {
    borderColor: "rgba(224, 90, 15, 0.35)",
    backgroundColor: "#fffdfb",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gpsIconBox: {
    backgroundColor: "rgba(224, 90, 15, 0.12)",
  },
  iconBoxSelected: {
    backgroundColor: "#ffffff",
  },
  addressInfo: {
    flex: 1,
  },
  titleTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  firstOptionBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  firstOptionBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  addressLine: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  saveFutureBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(224, 90, 15, 0.2)",
  },
  saveFutureTextCol: {
    flex: 1,
    marginRight: 12,
  },
  saveFutureTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  saveFutureSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
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
