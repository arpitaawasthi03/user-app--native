import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../components/Icon";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { isValidIndianMobile, normalisePhone, prettyPhone } from "../../lib/format";
import { colors, radii } from "../../theme/tokens";

export default function PhoneLogin() {
  const { push, back } = useNav();
  const { showToast } = useApp();
  const [phone, setPhone] = useState("98765 43210");
  const [error, setError] = useState("");

  const handlePhoneChange = (val: string) => {
    const raw = normalisePhone(val);
    setPhone(prettyPhone(raw));
    if (error) setError("");
  };

  const handleSendOtp = () => {
    const raw = normalisePhone(phone);
    if (!raw) {
      setError("Please enter your mobile number.");
      return;
    }
    if (!isValidIndianMobile(raw)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    push({ name: "otp", phone: raw });
  };

  const handleSocial = (provider: string) => {
    showToast(
      `${provider} login is not configured in this demo build. Please use mobile number.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable
            onPress={back}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="back" size={20} color={colors.ink} />
          </Pressable>

          {/* Logo & Tagline */}
          <Logo size={24} />
          <Text style={styles.authTag}>MOVE · EAT · SHOP · DELIVER</Text>

          {/* Illustrated Banner */}
          <View style={styles.illustration}>
            <View style={styles.illustrationInner}>
              <View style={styles.phoneDevice}>
                <Icon name="pin" size={28} color={colors.accent} />
              </View>
              <View style={styles.riderBox}>
                <Icon name="box" size={22} color={colors.ink} />
              </View>
            </View>
          </View>

          {/* Copy */}
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>WELCOME TO ROADRIDER</Text>
            <Text style={styles.title}>Let's get started</Text>
            <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
          </View>

          {/* Phone Input */}
          <View style={[styles.inputRow, Boolean(error) && styles.inputError]}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor={colors.muted}
              maxLength={15}
              accessibilityLabel="Mobile number"
            />
          </View>
          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          {/* Primary CTA */}
          <Button onPress={handleSendOtp} style={{ marginTop: 14 }}>
            <Text style={styles.btnText}>Send OTP</Text>
            <Icon name="arrow" size={18} color="#ffffff" />
          </Button>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Row */}
          <View style={styles.socialRow}>
            <Pressable
              onPress={() => handleSocial("Google")}
              style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
            >
              <Text style={styles.socialText}>G</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSocial("Apple")}
              style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
            >
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSocial("Email")}
              style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
            >
              <Text style={styles.socialText}>@ Email</Text>
            </Pressable>
          </View>

          {/* Legal */}
          <Text style={styles.legal}>
            By continuing, you agree to our{" "}
            <Text style={styles.legalBold}>Terms of Service</Text>
            {"\n"}and <Text style={styles.legalBold}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fffdfa",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  authTag: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: "#9a928c",
    marginTop: 6,
    marginBottom: 20,
  },
  illustration: {
    height: 180,
    backgroundColor: "#faeadd",
    borderRadius: radii.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  illustrationInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  phoneDevice: {
    width: 60,
    height: 90,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5ded4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  riderBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  copy: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: colors.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.accent,
  },
  prefixBox: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    marginRight: 10,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: 0.5,
  },
  errorText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.muted,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: colors.muted,
  },
  legalBold: {
    fontWeight: "700",
    color: colors.ink,
  },
  pressed: {
    opacity: 0.6,
  },
});
