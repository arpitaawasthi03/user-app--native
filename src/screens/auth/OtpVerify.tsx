import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../components/Icon";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { prettyPhone } from "../../lib/format";
import { colors, radii } from "../../theme/tokens";

export interface OtpVerifyProps {
  phone: string;
}

export default function OtpVerify({ phone }: OtpVerifyProps) {
  const { back, reset, pop, canGoBack } = useNav();
  const { signIn, showToast } = useApp();
  const [otp, setOtp] = useState("482");
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const pressKey = (key: number | string) => {
    if (key === "⌫") {
      setOtp((v) => v.slice(0, -1));
    } else if (typeof key === "number" && otp.length < 6) {
      setOtp((v) => `${v}${key}`);
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(30);
    setOtp("");
    showToast("A new demo OTP has been generated (use any 6 digits).");
  };

  const handleVerify = () => {
    if (otp.length < 6) {
      showToast("Please enter all 6 digits of the OTP.");
      return;
    }
    signIn(phone);
    showToast("Signed in successfully!");
    if (canGoBack()) {
      pop(2);
    } else {
      reset([{ name: "home" }]);
    }
  };

  const formattedPhone = phone
    ? `+91 ${prettyPhone(phone)}`
    : "+91 98765 43210";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <Pressable
          onPress={back}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={20} color={colors.ink} />
        </Pressable>

        <Logo size={24} />
        <Text style={styles.authTag}>MOVE · EAT · SHOP · DELIVER</Text>

        {/* Copy */}
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>ONE LAST STEP</Text>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{" "}
            <Text style={styles.boldText}>{formattedPhone}</Text>
          </Text>
          <Text style={styles.demoNotice}>
            Demo mode: No SMS is sent. Enter any 6 digits to continue.
          </Text>
        </View>

        {/* 6 OTP Boxes */}
        <View style={styles.otpBoxesRow}>
          {Array.from({ length: 6 }, (_, index) => {
            const isFilled = index < otp.length;
            const isFocused = index === otp.length;
            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isFilled && styles.otpBoxFilled,
                  isFocused && styles.otpBoxFocused,
                ]}
              >
                <Text style={styles.otpDigit}>{otp[index] || ""}</Text>
              </View>
            );
          })}
        </View>

        {/* Resend link */}
        <Pressable
          onPress={handleResend}
          disabled={cooldown > 0}
          style={styles.resendBtn}
        >
          {cooldown > 0 ? (
            <Text style={styles.resendText}>Resend code in {cooldown}s</Text>
          ) : (
            <Text style={styles.resendActiveText}>Resend code</Text>
          )}
        </Pressable>

        {/* Verify CTA */}
        <Button onPress={handleVerify} style={{ marginTop: 8 }}>
          <Text style={styles.btnText}>Verify & continue</Text>
          <Icon name="arrow" size={18} color="#ffffff" />
        </Button>

        {/* On-Screen Numeric Keypad */}
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((key, index) => {
            if (key === "") {
              return <View key={index} style={styles.keyItem} />;
            }
            return (
              <Pressable
                key={index}
                onPress={() => pressKey(key)}
                style={({ pressed }) => [
                  styles.keyItem,
                  pressed && styles.keyPressed,
                ]}
              >
                <Text style={styles.keyDigit}>{key}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fffdfa",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
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
  copy: {
    marginBottom: 24,
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
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700",
    color: colors.ink,
  },
  demoNotice: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 6,
    fontWeight: "600",
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    borderColor: colors.ink,
  },
  otpBoxFocused: {
    borderColor: colors.accent,
    backgroundColor: "#fffaf7",
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  resendBtn: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 13,
    color: colors.muted,
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 24,
    justifyContent: "space-between",
  },
  keyItem: {
    width: "30%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
    borderRadius: radii.md,
  },
  keyPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  keyDigit: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
  },
  pressed: {
    opacity: 0.6,
  },
});
