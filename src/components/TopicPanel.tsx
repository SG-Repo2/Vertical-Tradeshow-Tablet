import { Gauge, ShieldCheck } from "lucide-react-native";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { MediaViewer } from "./MediaViewer";
import type { PumpTopic } from "../data/topics";
import { colors, radii, spacing } from "../theme/colors";

type TopicPanelProps = {
  compact?: boolean;
  currentIndex: number;
  largeTouch?: boolean;
  style?: StyleProp<ViewStyle>;
  topic: PumpTopic;
  totalTopics: number;
  variant?: "standard" | "console";
};

export function TopicPanel({
  compact = false,
  currentIndex,
  largeTouch = false,
  style,
  topic,
  totalTopics,
  variant = "standard",
}: TopicPanelProps) {
  const isConsole = variant === "console";
  const isCompactConsole = isConsole && compact;

  return (
    <View
      style={[
        styles.panel,
        isConsole && styles.panelConsole,
        isCompactConsole && styles.panelConsoleCompact,
        largeTouch && styles.panelLargeTouch,
        style,
      ]}
    >
      <View style={styles.kickerRow}>
        <Text
          style={[
            styles.moduleLabel,
            largeTouch && styles.moduleLabelLargeTouch,
          ]}
        >
          Module {String(currentIndex + 1).padStart(2, "0")} / {totalTopics}
        </Text>
        <Text
          style={[
            styles.navLabel,
            largeTouch && styles.navLabelLargeTouch,
          ]}
        >
          {topic.navLabel}
        </Text>
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.86}
        numberOfLines={isCompactConsole ? 1 : 2}
        style={[
          styles.title,
          isConsole && styles.titleConsole,
          isCompactConsole && styles.titleConsoleCompact,
          largeTouch && styles.titleLargeTouch,
        ]}
      >
        {topic.title}
      </Text>

      <View
        style={[
          isConsole ? styles.consoleBody : styles.standardBody,
          isCompactConsole && styles.consoleBodyCompact,
          largeTouch && styles.standardBodyLargeTouch,
        ]}
      >
        <View
          style={[
            isConsole ? styles.consoleMedia : undefined,
            isCompactConsole && styles.consoleMediaCompact,
          ]}
        >
          <MediaViewer
            largeTouch={largeTouch}
            media={topic.media}
            variant={
              isCompactConsole
                ? "consoleCompact"
                : isConsole
                  ? "console"
                  : "standard"
            }
          />
        </View>

        <View
          style={[
            isConsole ? styles.consoleCopy : styles.standardCopy,
            isCompactConsole && styles.consoleCopyCompact,
            largeTouch && styles.standardCopyLargeTouch,
          ]}
        >
          <Text
            style={[
              styles.summary,
              isConsole && styles.summaryConsole,
              isCompactConsole && styles.summaryConsoleCompact,
              largeTouch && styles.summaryLargeTouch,
            ]}
          >
            {topic.summary}
          </Text>

          <View
            style={[
              styles.noteGrid,
              isConsole && styles.noteGridConsole,
              isCompactConsole && styles.noteGridConsoleCompact,
              largeTouch && styles.noteGridLargeTouch,
            ]}
          >
            <InfoBlock
              compact={isCompactConsole}
              console={isConsole}
              largeTouch={largeTouch}
              icon={
                <ShieldCheck
                  color={colors.success}
                  size={largeTouch ? 22 : isConsole ? 20 : 18}
                  strokeWidth={2.4}
                />
              }
              label="Key Takeaway"
              text={topic.whyItMatters}
              tone="blue"
            />
            <InfoBlock
              compact={isCompactConsole}
              console={isConsole}
              largeTouch={largeTouch}
              icon={
                <Gauge
                  color={colors.amber}
                  size={largeTouch ? 22 : isConsole ? 20 : 18}
                  strokeWidth={2.4}
                />
              }
              label="Field Check"
              text={topic.fieldCheck}
              tone="amber"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

type InfoBlockProps = {
  compact: boolean;
  console: boolean;
  icon: ReactNode;
  label: string;
  largeTouch?: boolean;
  text: string;
  tone: "blue" | "amber";
};

function InfoBlock({
  compact,
  console,
  icon,
  label,
  largeTouch = false,
  text,
  tone,
}: InfoBlockProps) {
  return (
    <View
      style={[
        styles.infoBlock,
        console && styles.infoBlockConsole,
        compact && styles.infoBlockConsoleCompact,
        largeTouch && styles.infoBlockLargeTouch,
        tone === "blue" ? styles.infoBlockBlue : styles.infoBlockAmber,
      ]}
    >
      <View style={[styles.infoHeader, compact && styles.infoHeaderCompact]}>
        {icon}
        <Text
          style={[
            styles.infoLabel,
            compact && styles.infoLabelCompact,
            largeTouch && styles.infoLabelLargeTouch,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.infoText,
          compact && styles.infoTextCompact,
          largeTouch && styles.infoTextLargeTouch,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  panelLargeTouch: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
  },
  panelConsole: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  panelConsoleCompact: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  moduleLabel: {
    color: colors.pumpBlue,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  moduleLabelLargeTouch: {
    fontSize: 15,
  },
  navLabel: {
    flexShrink: 1,
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    textTransform: "uppercase",
  },
  navLabelLargeTouch: {
    fontSize: 15,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  titleLargeTouch: {
    fontSize: 34,
  },
  titleConsole: {
    fontSize: 30,
  },
  titleConsoleCompact: {
    fontSize: 24,
  },
  standardBody: {
    gap: spacing.md,
  },
  standardBodyLargeTouch: {
    gap: spacing.lg,
  },
  standardCopy: {
    gap: spacing.md,
  },
  standardCopyLargeTouch: {
    gap: spacing.lg,
  },
  consoleBody: {
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.xl,
  },
  consoleBodyCompact: {
    gap: spacing.md,
  },
  consoleMedia: {
    width: "38%",
    minWidth: 300,
    maxWidth: 520,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  consoleMediaCompact: {
    width: "32%",
    minWidth: 220,
    maxWidth: 300,
  },
  consoleCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-start",
    gap: spacing.lg,
  },
  consoleCopyCompact: {
    gap: spacing.sm,
  },
  summary: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  summaryLargeTouch: {
    fontSize: 19,
    lineHeight: 28,
  },
  summaryConsole: {
    fontSize: 18,
    lineHeight: 26,
  },
  summaryConsoleCompact: {
    fontSize: 15,
    lineHeight: 21,
  },
  noteGrid: {
    gap: spacing.md,
  },
  noteGridLargeTouch: {
    gap: spacing.lg,
  },
  noteGridConsole: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  noteGridConsoleCompact: {
    gap: spacing.sm,
  },
  infoBlock: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  infoBlockLargeTouch: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  infoBlockConsole: {
    flex: 1,
    padding: spacing.lg,
  },
  infoBlockConsoleCompact: {
    gap: spacing.xs,
    padding: spacing.sm,
  },
  infoBlockBlue: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  infoBlockAmber: {
    borderColor: "#e6cb7c",
    backgroundColor: colors.amberSoft,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoHeaderCompact: {
    gap: spacing.xs,
  },
  infoLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoLabelLargeTouch: {
    fontSize: 16,
  },
  infoLabelCompact: {
    fontSize: 11,
  },
  infoText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  infoTextLargeTouch: {
    fontSize: 17,
    lineHeight: 24,
  },
  infoTextCompact: {
    fontSize: 12,
    lineHeight: 17,
  },
});
