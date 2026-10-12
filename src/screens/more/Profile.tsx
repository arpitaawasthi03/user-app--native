import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlowHeader from "../../components/FlowHeader";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { prettyPhone } from "../../lib/format";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

export default function Profile() {
  const { back, reset } = useNav();
  const { state, updateProfile, signOut, showToast } = useApp();

  const [name, setName] = useState(state.profile.name || "Arjun Khanna");
  const [language, setLanguage] = useState(state.profile.language || "English");

  const handleSave = () => {
    if (!name.trim()) {
      showToast("Please enter your name");
      return;
    }
    updateProfile({ name: name.trim(), language });
    showToast("Profile updated successfully!");
    back();
  };

  const handleSignOut = () => {
    signOut();
    showToast("Signed out of RoadRider");
    reset([{ name: "splash" }]);
  };

  const displayPhone = state.profile.phone
    ? `+91 ${prettyPhone(state.profile.phone)}`
    : "+91 98765 43210";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <FlowHeader title="" onBack={back} showHelp={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIconBox}>
            <Icon name="user" size={28} color={colors.accent} />
          </View>
          <Text style={styles.heroEyebrow}>PERSONAL DETAILS</Text>
          <Text style={styles.heroTitle}>Profile & settings</Text>
          <Text style={styles.heroSub}>
            Keep your RoadRider account details and preferences up to date.
          </Text>
        </View>

        <View style={styles.cardPad}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>VERIFIED MOBILE NUMBER</Text>
            <TextInput
              value={displayPhone}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>APP LANGUAGE</Text>
            <View style={styles.langButtonsRow}>
              {["English", "हिन्दी (Hindi)"].map((lang) => {
                const isSelected = language === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    style={[
                      styles.langBtn,
                      isSelected && styles.langBtnSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.langBtnText,
                        isSelected && styles.langBtnTextSelected,
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          style={styles.signOutBtn}
        >
          <Icon name="logout" size={16} color="#c84b31" />
          <Text style={styles.signOutBtnText}>Sign out</Text>
        </TouchableOpacity>

        <View style={styles.actionPad}>
          <Button onPress={handleSave}>Save changes</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 280,
  },
  cardPad: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 16,
  },
  fieldGroup: {},
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: colors.ink,
  },
  inputDisabled: {
    backgroundColor: "#fbf9f6",
    color: colors.muted,
  },
  langButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  langBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  langBtnTextSelected: {
    color: colors.accent,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ffd0c7",
    marginTop: 16,
  },
  signOutBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#c84b31",
  },
  actionPad: {
    marginTop: 20,
  },
});
