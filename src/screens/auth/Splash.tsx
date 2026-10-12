import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../components/Icon";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { PHOTOS } from "../../data/demo";
import { useNav } from "../../navigation/Navigation";
import { colors, radii } from "../../theme/tokens";

export default function Splash() {
  const { push } = useNav();

  const services = [
    { icon: "food", label: "Food" },
    { icon: "car", label: "Rides" },
    { icon: "bag", label: "Grocery" },
    { icon: "box", label: "Courier" },
  ];

  return (
    <ImageBackground
      source={{ uri: PHOTOS.rider }}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Logo light size={26} />
            <Text style={styles.tagline}>MOVE · EAT · SHOP · DELIVER</Text>
          </View>

          {/* Main Hero Copy */}
          <View style={styles.mainContent}>
            <Text style={styles.eyebrow}>ONE APP. EVERYDAY POSSIBILITIES.</Text>
            <Text style={styles.title}>
              Everything <Text style={styles.titleHighlight}>you need</Text>
              {"\n"}in one app.
            </Text>
            <Text style={styles.subtitle}>
              From your morning commute to dinner at your door, RoadRider keeps life moving.
            </Text>

            {/* Service Chips Row */}
            <View style={styles.serviceRow}>
              {services.map(({ icon, label }) => (
                <View key={label} style={styles.serviceItem}>
                  <View style={styles.serviceCircle}>
                    <Icon name={icon} size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.serviceLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <Button
              onPress={() => push({ name: "home" })}
              accentColor={colors.accent}
            >
              <Text style={styles.btnText}>Get started</Text>
              <Icon name="arrow" size={18} color="#ffffff" />
            </Button>
            <Text style={styles.photoCredit}>
              Photo by Cemrecan Yurtman on Unsplash
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(16, 10, 8, 0.72)",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "flex-start",
  },
  tagline: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(255, 255, 255, 0.72)",
    marginTop: 6,
  },
  mainContent: {
    marginTop: "auto",
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#f27955",
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -1.4,
    color: "#ffffff",
    marginBottom: 12,
  },
  titleHighlight: {
    color: "#f27955",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.75)",
    marginBottom: 24,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  serviceItem: {
    alignItems: "center",
  },
  serviceCircle: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  photoCredit: {
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 12,
  },
});
