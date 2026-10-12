import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import FlowHeader from "../../components/FlowHeader";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import type { PlacesMode } from "../../navigation/types";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";
import { DARK_MAP_STYLE, DEFAULT_CENTER, type LatLng } from "../../lib/googleMaps";
import type { Place } from "../../data/demo";

interface PlacesProps {
  mode: PlacesMode;
}

export const LUCKNOW_HUBS: Omit<Place, "id">[] = [
  {
    label: "Charbagh Railway Station",
    line: "Station Road, Charbagh",
    area: "Charbagh, Lucknow",
    icon: "pin",
    coords: { lat: 26.8315, lng: 80.9238 },
  },
  {
    label: "Chaudhary Charan Singh Airport",
    line: "Terminal 2, Amausi",
    area: "Amausi, Lucknow",
    icon: "pin",
    coords: { lat: 26.7606, lng: 80.8893 },
  },
  {
    label: "Phoenix Palassio Mall",
    line: "Sector 7, Amar Shaheed Path",
    area: "Gomti Nagar Extension, Lucknow",
    icon: "pin",
    coords: { lat: 26.8123, lng: 81.0242 },
  },
  {
    label: "Hazratganj Metro Station",
    line: "Mahatma Gandhi Marg",
    area: "Hazratganj, Lucknow",
    icon: "pin",
    coords: { lat: 26.8467, lng: 80.9462 },
  },
  {
    label: "Lulu Mall",
    line: "Amar Shaheed Path, Golf City",
    area: "Sushant Golf City, Lucknow",
    icon: "pin",
    coords: { lat: 26.7725, lng: 81.0022 },
  },
  {
    label: "Aminabad Bazaar",
    line: "Old Lucknow Market",
    area: "Aminabad, Lucknow",
    icon: "pin",
    coords: { lat: 26.8437, lng: 80.9262 },
  },
  {
    label: "Bara Imambara",
    line: "Machchhi Bhavan Heritage Area",
    area: "Husainabad, Lucknow",
    icon: "pin",
    coords: { lat: 26.8693, lng: 80.913 },
  },
  {
    label: "Wave Mall & Multiplex",
    line: "Vibhuti Khand",
    area: "Gomti Nagar, Lucknow",
    icon: "pin",
    coords: { lat: 26.8665, lng: 81.0063 },
  },
];

export default function Places({ mode }: PlacesProps) {
  const insets = useSafeAreaInsets();
  const { back, push } = useNav();
  const {
    state,
    setDefaultPlace,
    setRide,
    setCourier,
    addPlace,
    removePlace,
    showToast,
  } = useApp();

  const [search, setSearch] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [viewOnMap, setViewOnMap] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedPlaces, setGeocodedPlaces] = useState<Place[]>([]);

  // Get active place ID from AppState
  const getInitialPlace = (): Place => {
    let id: string | null | undefined;
    switch (mode) {
      case "delivery":
      case "manage":
        id = state.defaultPlaceId;
        break;
      case "ridePickup":
        id = state.ride.pickupId;
        break;
      case "rideDrop":
        id = state.ride.dropId;
        break;
      case "courierPickup":
        id = state.courier.pickupId;
        break;
      case "courierDrop":
        id = state.courier.dropId;
        break;
    }
    const found = state.places.find((p) => p.id === id);
    return (
      found ??
      state.places[0] ?? {
        id: "default",
        label: "Lucknow",
        line: "Hazratganj",
        area: "Lucknow",
        icon: "pin",
        coords: DEFAULT_CENTER,
      }
    );
  };

  const initialPlace = useMemo(() => getInitialPlace(), []);
  const [selectedPlace, setSelectedPlace] = useState<Place>(initialPlace);
  const [mapCoords, setMapCoords] = useState<LatLng>(
    initialPlace.coords ?? DEFAULT_CENTER
  );
  const [mapLocationLabel, setMapLocationLabel] = useState(initialPlace.label);
  const [mapLocationAddress, setMapLocationAddress] = useState(
    initialPlace.line || initialPlace.area
  );
  const mapRef = useRef<MapView>(null);

  // Perform geocoding when user types an address
  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) {
      setGeocodedPlaces([]);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        const results = await Location.geocodeAsync(`${q}, Lucknow`);
        if (!isMounted) return;
        if (results && results.length > 0) {
          const first = results[0];
          const geoPlace: Place = {
            id: `geo-${Date.now()}`,
            label: q.charAt(0).toUpperCase() + q.slice(1),
            line: `${first.latitude.toFixed(4)}° N, ${first.longitude.toFixed(4)}° E`,
            area: "Lucknow, Uttar Pradesh",
            icon: "pin",
            coords: { lat: first.latitude, lng: first.longitude },
          };
          setGeocodedPlaces([geoPlace]);
        } else {
          setGeocodedPlaces([]);
        }
      } catch {
        if (isMounted) setGeocodedPlaces([]);
      } finally {
        if (isMounted) setIsGeocoding(false);
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  // Reverse geocode when map pin changes
  const handleMapPinChange = async (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (res && res.length > 0) {
        const item = res[0];
        const name = item.name || item.street || "Selected Location";
        const district = [item.district, item.city || "Lucknow"].filter(Boolean).join(", ");
        setMapLocationLabel(name);
        setMapLocationAddress(district);
      }
    } catch {
      // Keep existing or show coordinates if reverse geocode fails
      setMapLocationLabel("Selected Map Point");
      setMapLocationAddress(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
    }
  };

  const handleUseCurrentLocation = async () => {
    setDetecting(true);
    showToast("Detecting GPS location...");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDetecting(false);
        showToast(
          "Location permission denied. Please select from saved places or search."
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;
      let label = "Current Location";
      let area = "GPS Coordinates";
      let line = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

      try {
        const rev = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (rev && rev.length > 0) {
          const r = rev[0];
          label = r.name || r.street || "Current Location";
          area = [r.district, r.city || "Lucknow"].filter(Boolean).join(", ");
          line = [r.street, r.district, r.city].filter(Boolean).join(", ") || line;
        }
      } catch {}

      const newPlace = addPlace({
        label,
        line,
        area,
        icon: "pin",
        coords: { lat: latitude, lng: longitude },
      });

      setSelectedPlace(newPlace);
      setMapCoords({ lat: latitude, lng: longitude });
      setMapLocationLabel(label);
      setMapLocationAddress(line);
      setDetecting(false);

      // Confirm immediately for GPS tap
      applyPlaceSelection(newPlace.id);
      showToast("📍 Current GPS location confirmed");
    } catch (err) {
      setDetecting(false);
      console.warn("Location error:", err);
      showToast(
        "Could not detect live GPS location. Please choose a place or search."
      );
    }
  };

  const applyPlaceSelection = (placeId: string) => {
    switch (mode) {
      case "delivery":
        setDefaultPlace(placeId);
        showToast("Delivery address updated");
        back();
        break;
      case "ridePickup":
        setRide({ pickupId: placeId });
        showToast("Pickup location confirmed");
        back();
        break;
      case "rideDrop":
        setRide({ dropId: placeId });
        showToast("Destination confirmed");
        back();
        break;
      case "courierPickup":
        setCourier({ pickupId: placeId });
        showToast("Courier pickup set");
        back();
        break;
      case "courierDrop":
        setCourier({ dropId: placeId });
        showToast("Courier drop-off set");
        back();
        break;
      case "manage":
        setDefaultPlace(placeId);
        showToast("Default address updated");
        back();
        break;
    }
  };

  const handleConfirmMapSelection = () => {
    const newPlace = addPlace({
      label: mapLocationLabel,
      line: mapLocationAddress,
      area: mapLocationAddress,
      icon: "pin",
      coords: mapCoords,
    });
    applyPlaceSelection(newPlace.id);
  };

  // Filtered places combining saved places, Lucknow hubs, and geocoding
  const filteredPlaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    const saved = state.places;
    const hubsAsPlaces: Place[] = LUCKNOW_HUBS.map((h, i) => ({
      ...h,
      id: `hub-${i}`,
    }));

    const combined = [...saved, ...hubsAsPlaces];
    if (!q) return combined;

    const filtered = combined.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.line.toLowerCase().includes(q)
    );

    return [...filtered, ...geocodedPlaces];
  }, [search, state.places, geocodedPlaces]);

  const isPickup = mode.includes("Pickup");
  const isDrop = mode.includes("Drop");
  const pinColor = isPickup ? "#22c55e" : "#e05a0f";

  const screenTitle =
    mode === "manage"
      ? "Saved addresses"
      : isPickup
      ? "Choose pickup location"
      : "Choose destination";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <FlowHeader title={screenTitle} onBack={back} showHelp={false} />

      {/* Search & Mode Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder={
              isPickup
                ? "Search pickup location, hub, or address"
                : "Search destination, landmark, or area"
            }
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
              <Icon name="close" size={14} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Toggle between List and Map selection */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewOnMap(false)}
            style={[styles.toggleBtn, !viewOnMap && styles.toggleBtnActive]}
          >
            <Icon
              name="list"
              size={15}
              color={!viewOnMap ? "#ffffff" : colors.muted}
            />
            <Text
              style={[
                styles.toggleBtnText,
                !viewOnMap && styles.toggleBtnTextActive,
              ]}
            >
              List & Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewOnMap(true)}
            style={[styles.toggleBtn, viewOnMap && styles.toggleBtnActive]}
          >
            <Icon
              name="pin"
              size={15}
              color={viewOnMap ? "#ffffff" : colors.muted}
            />
            <Text
              style={[
                styles.toggleBtnText,
                viewOnMap && styles.toggleBtnTextActive,
              ]}
            >
              Choose on map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Body: Map View or List View */}
      {viewOnMap ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: mapCoords.lat,
              longitude: mapCoords.lng,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            }}
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              handleMapPinChange(latitude, longitude);
            }}
            customMapStyle={DARK_MAP_STYLE}
          >
            <Marker
              coordinate={{ latitude: mapCoords.lat, longitude: mapCoords.lng }}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                handleMapPinChange(latitude, longitude);
              }}
              title={mapLocationLabel}
            >
              <View style={[styles.customPin, { borderColor: pinColor }]}>
                <View
                  style={[styles.customPinDot, { backgroundColor: pinColor }]}
                />
              </View>
            </Marker>
          </MapView>

          {/* Floating Selected Location Card */}
          <View style={styles.mapInfoCard}>
            <View style={styles.mapInfoLeft}>
              <View
                style={[
                  styles.mapPinCircle,
                  { backgroundColor: isPickup ? "rgba(34, 197, 94, 0.15)" : colors.accentSoft },
                ]}
              >
                <Icon name="pin" size={18} color={pinColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapInfoTitle} numberOfLines={1}>
                  {mapLocationLabel}
                </Text>
                <Text style={styles.mapInfoSub} numberOfLines={1}>
                  {mapLocationAddress}
                </Text>
              </View>
            </View>

            <Button onPress={handleConfirmMapSelection}>
              {isPickup ? "Confirm pickup point" : "Confirm destination"}
            </Button>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 70 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* GPS Current Location Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleUseCurrentLocation}
            disabled={detecting}
            style={styles.gpsRow}
          >
            <View style={styles.gpsIconBox}>
              {detecting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Icon name="pin" size={16} color="#ffffff" />
              )}
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.gpsTitle}>
                {detecting
                  ? "Detecting GPS location..."
                  : "Use current location (GPS)"}
              </Text>
              <Text style={styles.itemSub}>
                Enable device location for precise real-time pickup
              </Text>
            </View>
            <Icon name="arrow" size={16} color={colors.accent} />
          </TouchableOpacity>

          {isGeocoding && (
            <View style={styles.geocodingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.geocodingText}>Searching locations...</Text>
            </View>
          )}

          {/* Places List */}
          <View style={styles.listContainer}>
            {filteredPlaces.length === 0 ? (
              <View style={styles.emptySearch}>
                <Text style={styles.emptyTitle}>No matching locations found</Text>
                <Text style={styles.emptySub}>
                  Try searching for another landmark or tap "Choose on map".
                </Text>
              </View>
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = place.id === selectedPlace.id;
                return (
                  <TouchableOpacity
                    key={place.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedPlace(place);
                      if (place.coords) {
                        setMapCoords(place.coords);
                        setMapLocationLabel(place.label);
                        setMapLocationAddress(place.line || place.area);
                      }
                      applyPlaceSelection(place.id);
                    }}
                    style={[
                      styles.placeRow,
                      isSelected && styles.placeRowSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.placeIconBox,
                        isSelected && styles.placeIconBoxSelected,
                      ]}
                    >
                      <Icon
                        name={place.icon || "pin"}
                        size={16}
                        color={isSelected ? colors.accent : colors.muted}
                      />
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.placeTitle}>{place.label}</Text>
                      <Text style={styles.itemSub} numberOfLines={1}>
                        {place.line || place.area}
                      </Text>
                    </View>
                    {mode === "manage" && state.places.length > 1 ? (
                      <TouchableOpacity
                        onPress={() => {
                          removePlace(place.id);
                          showToast(`Removed ${place.label}`);
                        }}
                        style={styles.deleteBtn}
                      >
                        <Icon name="trash" size={16} color={colors.muted} />
                      </TouchableOpacity>
                    ) : (
                      <Icon
                        name={isSelected ? "check" : "arrow"}
                        size={16}
                        color={isSelected ? colors.accent : colors.muted}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            {/* Add a New Address Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => push({ name: "addAddress", mode })}
              style={[styles.placeRow, { backgroundColor: "#fbf9f6" }]}
            >
              <View style={styles.placeIconBox}>
                <Icon name="plus" size={16} color={colors.ink} />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.placeTitle}>Add a custom address</Text>
              </View>
              <Icon name="arrow" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    marginLeft: 8,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  toggleBtnTextActive: {
    color: "#ffffff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginTop: 12,
  },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(224, 90, 15, 0.2)",
  },
  gpsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  geocodingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  geocodingText: {
    fontSize: 12,
    color: colors.muted,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  placeRowSelected: {
    backgroundColor: colors.accentSoft,
  },
  placeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  placeIconBoxSelected: {
    backgroundColor: "#ffffff",
  },
  itemDetails: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  itemSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  emptySearch: {
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  customPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  customPinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mapInfoCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  mapInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapPinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mapInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  mapInfoSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
});
