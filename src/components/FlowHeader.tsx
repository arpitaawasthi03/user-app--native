import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Icon from "./Icon";
import { useNav } from "../navigation/Navigation";
import { colors } from "../theme/tokens";

export interface FlowHeaderProps {
  title?: string;
  onBack?: () => void;
  showHelp?: boolean;
}

export default function FlowHeader({
  title = "",
  onBack,
  showHelp = true,
}: FlowHeaderProps) {
  const { back, push } = useNav();

  const handleBack = () => {
    if (onBack) onBack();
    else back();
  };

  return (
    <View style={styles.header}>
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="back" size={20} color={colors.ink} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {showHelp ? (
        <Pressable
          onPress={() => push({ name: "help" })}
          style={({ pressed }) => [
            styles.helpButton,
            pressed && styles.pressed,
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Help"
        >
          <Text style={styles.helpText}>?</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
    marginHorizontal: 8,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  helpText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  pressed: {
    opacity: 0.6,
  },
});
