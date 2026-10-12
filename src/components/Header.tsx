import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import { useApp } from "../state/AppState";
import { useNav } from "../navigation/Navigation";
import { initials } from "../lib/format";
import { colors, radii } from "../theme/tokens";

interface HeaderProps {
  dark?: boolean;
}

export default function Header({ dark = false }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { state, placeById } = useApp();
  const { push, switchTab } = useNav();

  const currentPlace = placeById(state.defaultPlaceId) ?? state.places[0];
  const placeLabel = currentPlace
    ? `${currentPlace.label}, ${currentPlace.area.split(",")[0]}`
    : "Select Location";
  const unreadCount = state.notifications.filter((n) => !n.read).length;
  const userInitials = initials(state.profile.name || "Arjun Khanna");

  const textColor = dark ? "#ffffff" : colors.ink;
  const subColor = dark ? "rgba(255, 255, 255, 0.6)" : colors.muted;
  const buttonBg = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.05)";

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
      {/* Location selector */}
      <Pressable
        onPress={() => push({ name: "places", mode: "delivery" })}
        style={({ pressed }) => [styles.locationBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Change delivery location"
      >
        <View style={[styles.locIconWrapper, { backgroundColor: colors.accentSoft }]}>
          <Icon name="pin" size={15} color={colors.accent} />
        </View>
        <View style={styles.locTextCol}>
          <Text style={[styles.locSub, { color: subColor }]}>Delivering to</Text>
          <Text style={[styles.locLabel, { color: textColor }]} numberOfLines={1}>
            {placeLabel}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: subColor }]}>⌄</Text>
      </Pressable>

      <View style={styles.actionsRow}>
        {/* Favorites button */}
        <Pressable
          onPress={() => push({ name: "favorites", service: state.service })}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: buttonBg },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Favorites"
        >
          <Icon
            name="heart"
            size={18}
            color={state.favorites.length > 0 ? "#ff6b4a" : textColor}
            filled={state.favorites.length > 0}
          />
          {state.favorites.length > 0 && <View style={styles.dot} />}
        </Pressable>

        {/* Notifications button */}
        <Pressable
          onPress={() => push({ name: "notifications" })}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: buttonBg },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Icon name="bell" size={19} color={textColor} />
          {unreadCount > 0 && <View style={styles.dot} />}
        </Pressable>

        {/* Profile Avatar */}
        <Pressable
          onPress={() => switchTab("account")}
          style={({ pressed }) => [
            styles.avatarBtn,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Account profile"
        >
          <Text style={styles.avatarText}>{userInitials}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  locIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  locTextCol: {
    flexShrink: 1,
  },
  locSub: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 14,
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
