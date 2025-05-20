import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { COLORS } from "../../lib/constants";
import { formatDate, formatHTMLtoText } from "../../lib/utils";
import { Message } from "../../types/app.types";

interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  showTimestamp = false,
  isStreaming = false,
}: Readonly<MessageBubbleProps>) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isStreaming && styles.streamingBubble,
        ]}
      >
        {isUser ? (
          <Text style={[styles.text, styles.userText]}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>
            {formatHTMLtoText(message.content)}
          </Markdown>
        )}
        {showTimestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {formatDate(message.timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: width * 0.8,
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 20,
    padding: 12,
    maxWidth: width * 0.75,
  },
  userBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderBottomLeftRadius: 4,
  },
  streamingBubble: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.TEXT.INVERSE,
  },
  assistantText: {
    color: COLORS.TEXT.PRIMARY,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: COLORS.TEXT.INVERSE + "80",
    textAlign: "right",
  },
  assistantTimestamp: {
    color: COLORS.TEXT.SECONDARY,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: COLORS.TEXT.PRIMARY,
    fontSize: 16,
    lineHeight: 22,
  },
  // Headings
  heading1: {
    fontSize: 24,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "bold",
    color: COLORS.TEXT.PRIMARY,
  },
  heading2: {
    fontSize: 22,
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "bold",
    color: COLORS.TEXT.PRIMARY,
  },
  heading3: {
    fontSize: 20,
    marginTop: 6,
    marginBottom: 4,
    fontWeight: "bold",
    color: COLORS.TEXT.PRIMARY,
  },
  heading4: {
    fontSize: 18,
    marginTop: 4,
    marginBottom: 2,
    fontWeight: "bold",
    color: COLORS.TEXT.PRIMARY,
  },
  // Lists
  list_item: {
    marginBottom: 5,
    flexDirection: "row",
  },
  bullet_list: {
    marginVertical: 5,
  },
  ordered_list: {
    marginVertical: 5,
  },
  // Code blocks
  code_block: {
    backgroundColor: COLORS.BACKGROUND + "80",
    padding: 8,
    borderRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
  },
  code_inline: {
    backgroundColor: COLORS.BACKGROUND + "80",
    borderRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
    padding: 2,
  },
  // Links and emphasis
  link: {
    color: COLORS.PRIMARY,
    textDecorationLine: "underline",
  },
  strong: {
    fontWeight: "bold",
  },
  em: {
    fontStyle: "italic",
  },
});
