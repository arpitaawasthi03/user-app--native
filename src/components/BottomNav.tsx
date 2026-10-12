import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import type { TabName } from "../navigation/types";
import { colors, radii } from "../theme/tokens";

export interface BottomNavProps {
  active: TabName;
  count: number;
  onSelect: (value: TabName) => void;
}

export default function BottomNav({ active, count, onSelect }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  const items: [TabName, string, string][] = [
    ["home", "home", "Home"],
    ["navcart", "cart", "Cart"],
    ["wallet", "wallet", "Wallet"],
    ["orders", "list", "Orders"],
    ["account", "user", "Account"],
  ];

  return (
    <View style={[styles.nav, { paddingBottom: bottomPadding, height: 56 + bottomPadding }]}>
      {items.map(([id, icon, label]) => {
        const isActive = id === active;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={icon}
                size={22}
                color={isActive ? colors.accent : colors.muted}
              />
              {id === "navcart" && count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {count > 9 ? "9+" : count}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 64,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -7,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.muted,
    marginTop: 2,
  },
  labelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
