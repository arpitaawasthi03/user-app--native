import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlowHeader from "../../components/FlowHeader";
import Icon from "../../components/Icon";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { colors, radii } from "../../theme/tokens";

interface ChatSupportProps {
  orderId?: string;
}

type Message = {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
};

export default function ChatSupport({ orderId }: ChatSupportProps) {
  const { back } = useNav();
  const { state } = useApp();

  const relatedOrder = orderId
    ? state.orders.find((o) => o.id === orderId)
    : state.orders[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "agent",
      text: `Hello ${
        state.profile.name || "there"
      }! I'm Priya from RoadRider Customer Care. How can I assist you today?`,
      time: "Just now",
    },
    ...(relatedOrder
      ? [
          {
            id: "m2",
            sender: "agent" as const,
            text: `I can see your order #${relatedOrder.id} (${relatedOrder.title}). Feel free to ask any question regarding this order or any service.`,
            time: "Just now",
          },
        ]
      : []),
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const quickPrompts = [
    "Where is my driver right now?",
    "I want to change delivery address",
    "How do refunds work?",
    "Need urgent help with an order",
  ];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply =
        "Thank you for sharing. Our team is monitoring this and ensuring you have a smooth experience.";
      const lower = text.toLowerCase();
      if (
        lower.includes("driver") ||
        lower.includes("where") ||
        lower.includes("track")
      ) {
        reply = `Your partner is currently en route. You can check the real-time map on the status screen or call them directly via the partner card.`;
      } else if (lower.includes("address") || lower.includes("location")) {
        reply =
          "To update your drop location, you can choose from your saved addresses or add a new address in the Places menu.";
      } else if (
        lower.includes("refund") ||
        lower.includes("cancel") ||
        lower.includes("money")
      ) {
        reply =
          "All eligible refunds are automatically credited back to your RoadRider Wallet instantly, or to your original payment card within 2-3 business days.";
      } else if (
        lower.includes("help") ||
        lower.includes("issue") ||
        lower.includes("food") ||
        lower.includes("item")
      ) {
        reply =
          "I've flagged this with our priority escalation team. A supervisor is also reviewing your order log to ensure full satisfaction.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: "agent",
          text: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <FlowHeader title="Live Support" onBack={back} showHelp={false} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Support Agent Banner */}
        <View style={styles.agentBanner}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentAvatarText}>PR</Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>Priya · RoadRider Support</Text>
            <Text style={styles.agentStatus}>● Online · Replies in seconds</Text>
          </View>
          {relatedOrder && (
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>#{relatedOrder.id}</Text>
            </View>
          )}
        </View>

        {/* Message Thread */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <View
                key={m.id}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.agentBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.agentText,
                  ]}
                >
                  {m.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isUser ? styles.userTime : styles.agentTime,
                  ]}
                >
                  {m.time}
                </Text>
              </View>
            );
          })}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Priya is typing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        <View style={styles.promptsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsContent}
          >
            {quickPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                activeOpacity={0.8}
                onPress={() => sendMessage(prompt)}
                style={styles.promptBtn}
              >
                <Text style={styles.promptBtnText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            style={styles.textInput}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            style={[
              styles.sendBtn,
              !input.trim() && { opacity: 0.5 },
            ]}
          >
            <Icon name="arrow" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  keyboardContainer: {
    flex: 1,
  },
  agentBanner: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  agentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  agentAvatarText: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 14,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  agentStatus: {
    fontSize: 10,
    color: "#288153",
    fontWeight: "600",
    marginTop: 2,
  },
  orderBadge: {
    backgroundColor: colors.canvas,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
  },
  messagesScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 14,
    gap: 10,
  },
  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  agentBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  agentText: {
    color: colors.ink,
  },
  userText: {
    color: "#ffffff",
  },
  messageTime: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "right",
  },
  agentTime: {
    color: colors.muted,
  },
  userTime: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  typingIndicator: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  typingText: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: "italic",
  },
  promptsContainer: {
    paddingVertical: 6,
    backgroundColor: colors.canvas,
  },
  promptsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  promptBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
