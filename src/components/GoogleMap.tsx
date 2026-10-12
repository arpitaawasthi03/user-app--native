import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import {
  DARK_MAP_STYLE,
  DEFAULT_CENTER,
  PRESET_COORDS,
  computeDistanceKm,
  computeEstimatedEta,
  type LatLng,
} from "../lib/googleMaps";
import { colors, radii } from "../theme/tokens";

export interface EtaResult {
  durationText: string;
  distanceText: string;
  durationSeconds: number;
}

export interface GoogleMapProps {
  origin?: LatLng;
  destination?: LatLng;
  driver?: LatLng;
  etaText?: string;
  etaUnit?: string;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  showRoute?: boolean;
  onEtaCalculated?: (eta: EtaResult) => void;
  showCoordsChip?: boolean;
}

export default function GoogleMap({
  origin,
  destination,
  driver,
  etaText = "15 min",
  etaUnit = "away",
  interactive = true,
  style,
  showRoute = true,
  onEtaCalculated,
  showCoordsChip = false,
}: GoogleMapProps) {
  const mapRef = useRef<MapView>(null);
  const [liveEta, setLiveEta] = useState<EtaResult | null>(null);

  // Compute distance and ETA only when both origin and destination exist
  useEffect(() => {
    if (origin && destination) {
      const km = computeDistanceKm(origin, destination);
      const eta = computeEstimatedEta(km);
      setLiveEta(eta);
      onEtaCalculated?.(eta);
    } else {
      setLiveEta(null);
    }
  }, [origin, destination, onEtaCalculated]);

  // Calculate center and span region based on actual points
  const region = useMemo(() => {
    const lats: number[] = [];
    const lngs: number[] = [];
    if (origin) {
      lats.push(origin.lat);
      lngs.push(origin.lng);
    }
    if (destination) {
      lats.push(destination.lat);
      lngs.push(destination.lng);
    }
    if (driver) {
      lats.push(driver.lat);
      lngs.push(driver.lng);
    }

    if (lats.length === 0) {
      return {
        latitude: DEFAULT_CENTER.lat,
        longitude: DEFAULT_CENTER.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const latDelta = Math.max(0.02, (maxLat - minLat) * 1.5 || 0.03);
    const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.5 || 0.03);

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [origin, destination, driver]);

  const displayEta = liveEta ? liveEta.durationText : etaText;
  const displaySub = liveEta?.distanceText
    ? `${liveEta.distanceText} · ${etaUnit}`
    : etaUnit;

  const polylineCoords = useMemo(() => {
    if (!origin || !destination) return [];
    const coords = [
      { latitude: origin.lat, longitude: origin.lng },
    ];
    if (driver) {
      coords.push({ latitude: driver.lat, longitude: driver.lng });
    }
    coords.push({ latitude: destination.lat, longitude: destination.lng });
    return coords;
  }, [origin, destination, driver]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={false}
        customMapStyle={DARK_MAP_STYLE}
      >
        {/* Origin / Store Marker */}
        {origin && (
          <Marker
            coordinate={{ latitude: origin.lat, longitude: origin.lng }}
            title={origin.label || "Pickup"}
          >
            <View style={styles.originMarker}>
              <View style={styles.originDot} />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{ latitude: destination.lat, longitude: destination.lng }}
            title={destination.label || "Destination"}
          >
            <View style={styles.destinationMarker}>
              <View style={styles.destinationPin} />
            </View>
          </Marker>
        )}

        {/* Driver Marker */}
        {driver && (
          <Marker
            coordinate={{ latitude: driver.lat, longitude: driver.lng }}
            title={driver.label || "RoadRider Driver"}
          >
            <View style={styles.driverMarker}>
              <Text style={styles.driverEmoji}>🚗</Text>
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {showRoute && origin && destination && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor="#e05a0f"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* GPS Coordinates Chip - Only shown if explicitly requested and destination exists */}
      {showCoordsChip && destination && (
        <View style={styles.gpsChip}>
          <View style={styles.gpsLiveDot} />
          <Text style={styles.gpsText}>
            {destination.lat.toFixed(4)}° N, {destination.lng.toFixed(4)}° E
          </Text>
        </View>
      )}

      {/* ETA Bubble - Only shown when route/destination exists or custom eta */}
      {destination && (
        <View style={styles.etaBubble}>
          <Text style={styles.etaTitle}>{displayEta}</Text>
          <Text style={styles.etaSub}>{displaySub}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#161c24",
    position: "relative",
    overflow: "hidden",
  },
  originMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(34, 197, 94, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  destinationMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(224, 90, 15, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  destinationPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#e05a0f",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  driverMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff9900",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  driverEmoji: {
    fontSize: 13,
  },
  gpsChip: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(13, 27, 44, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  gpsLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  gpsText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 9,
    fontFamily: "monospace",
  },
  etaBubble: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  etaTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  etaSub: {
    fontSize: 10,
    color: colors.muted,
  },
});
