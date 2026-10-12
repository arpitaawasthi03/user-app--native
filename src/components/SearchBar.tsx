import React from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import Icon from "./Icon";
import { colors, radii } from "../theme/tokens";

export interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (val: string) => void;
  onFilter?: () => void;
}

export default function SearchBar({
  placeholder,
  value,
  onChange,
  onFilter,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Icon name="search" size={18} color={colors.muted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value ?? ""}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {Boolean(value) && (
        <Pressable
          onPress={() => onChange?.("")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Icon name="close" size={15} color={colors.muted} />
        </Pressable>
      )}
      {Boolean(onFilter) && (
        <Pressable
          onPress={onFilter}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.filterBtn}
          accessibilityRole="button"
          accessibilityLabel="Search filters"
        >
          <Icon name="filter" size={18} color={colors.ink} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    marginLeft: 10,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    padding: 4,
    marginLeft: 6,
  },
});
