import React from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import Icon from "./Icon";
import type { Service } from "../data/demo";
import { colors, radii } from "../theme/tokens";

interface ServiceTabsProps {
  service: Service;
  onSelect: (value: Service) => void;
}

export default function ServiceTabs({ service, onSelect }: ServiceTabsProps) {
  const items: [Service, string, string][] = [
    ["food", "food", "Food"],
    ["rides", "car", "Rides"],
    ["grocery", "bag", "Grocery"],
    ["courier", "box", "Courier"],
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {items.map(([id, icon, label]) => {
          const isActive = id === service;
          const activeColor = colors.services[id].accent;
          return (
            <Pressable
              key={id}
              onPress={() => onSelect(id)}
              style={({ pressed }) => [
                styles.tab,
                isActive && { backgroundColor: activeColor },
                pressed && styles.pressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                name={icon}
                size={16}
                color={isActive ? "#ffffff" : colors.ink}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  labelActive: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.8,
  },
});
