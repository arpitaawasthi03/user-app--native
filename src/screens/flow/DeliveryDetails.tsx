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
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { RESTAURANTS, GROCERY_HUB, type Service } from "../../data/demo";
import { PRESET_COORDS } from "../../lib/googleMaps";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface DeliveryDetailsProps {
  service: Service;
}

export default function DeliveryDetails({ service }: DeliveryDetailsProps) {
  const { push } = useNav();
  const { state, setDefaultPlace, showToast } = useApp();

  const currentCart =
    service === "food" || service === "grocery" ? state.carts[service] : null;
  const store =
    service === "food"
      ? RESTAURANTS.find((r) => r.id === currentCart?.storeId) || RESTAURANTS[0]
      : service === "grocery"
      ? GROCERY_HUB
      : null;

  const currentPlace =
    state.places.find((p) => p.id === state.defaultPlaceId) ?? state.places[0];
  const originCoords = store
    ? { ...store.coords, label: store.name }
    : PRESET_COORDS.restaurant;
  const destCoords = currentPlace?.coords
    ? { ...currentPlace.coords, label: currentPlace.label }
    : PRESET_COORDS.home;

  const handleSelectPlace = (id: string) => {
    setDefaultPlace(id);
  };

  const handleDeliverHere = () => {
    if (!state.defaultPlaceId && state.places.length === 0) {
      showToast("Please add a delivery address.");
      push({ name: "addAddress", mode: "delivery" });
      return;
    }
    push({ name: "payment", service });
  };

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
          <Text style={styles.sectionTitle}>Choose an address</Text>
          <TouchableOpacity
            onPress={() => push({ name: "addAddress", mode: "delivery" })}
          >
            <Text style={styles.addNewText}>+ Add new</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Addresses List */}
        <View style={styles.addressList}>
          {state.places.map((place) => {
            const isSelected = place.id === state.defaultPlaceId;
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
                  <Text style={styles.addressLine}>{place.line}</Text>
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
    gap: 10,
  },
  addressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
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
  iconBoxSelected: {
    backgroundColor: "#ffffff",
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
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
