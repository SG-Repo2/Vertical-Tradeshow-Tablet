import { Gauge, ShieldCheck, X } from "lucide-react-native";
import {
  Pressable,
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
  onClose?: () => void;
  onMediaPress?: () => void;
  style?: StyleProp<ViewStyle>;
  topic: PumpTopic;
  totalTopics: number;
  variant?: "standard" | "console" | "modal";
};

export function TopicPanel({
  compact = false,
  currentIndex,
  largeTouch = false,
  onClose,
  onMediaPress,
  style,
  topic,
  totalTopics,
  variant = "standard",
}: TopicPanelProps) {
  const isConsole = variant === "console";
  const isModal = variant === "modal";
  const isModalWide = isModal && !compact;
  const isCompactConsole = isConsole && compact;
  const usesInlineInfoBlocks = isConsole || isModalWide;
  const mediaVariant = isCompactConsole
    ? "consoleCompact"
    : isConsole || isModalWide
      ? "console"
      : "standard";

  return (
    <View
      style={[
        styles.panel,
        isConsole && styles.panelConsole,
        isModal && styles.panelModal,
        isCompactConsole && styles.panelConsoleCompact,
        isModal && compact && styles.panelModalCompact,
        largeTouch && styles.panelLargeTouch,
        style,
      ]}
    >
      {isModal ? (
        onClose ? (
          <Pressable
            accessibilityLabel="Close module"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              styles.closeButtonFloating,
              largeTouch && styles.closeButtonLargeTouch,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <X
              color={colors.pumpBlueDark}
              size={largeTouch ? 24 : 20}
              strokeWidth={3}
            />
          </Pressable>
        ) : null
      ) : (
        <View style={styles.kickerRow}>
          <Text
            style={[
              styles.moduleLabel,
              largeTouch && styles.moduleLabelLargeTouch,
            ]}
          >
            Module {String(currentIndex + 1).padStart(2, "0")} / {totalTopics}
          </Text>
          <View style={styles.kickerRight}>
            <Text
              style={[
                styles.navLabel,
                largeTouch && styles.navLabelLargeTouch,
              ]}
            >
              {topic.navLabel}
            </Text>
            {onClose ? (
              <Pressable
                accessibilityLabel="Close module"
                accessibilityRole="button"
                hitSlop={10}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  largeTouch && styles.closeButtonLargeTouch,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <X
                  color={colors.pumpBlueDark}
                  size={largeTouch ? 24 : 20}
                  strokeWidth={3}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.86}
        numberOfLines={isCompactConsole ? 1 : 2}
        style={[
          styles.title,
          isConsole && styles.titleConsole,
          isModal && styles.titleModal,
          isCompactConsole && styles.titleConsoleCompact,
          isModal && compact && styles.titleModalCompact,
          largeTouch && styles.titleLargeTouch,
        ]}
      >
        {topic.title}
      </Text>

      <View
        style={[
          isConsole ? styles.consoleBody : styles.standardBody,
          isModalWide && styles.modalBody,
          isCompactConsole && styles.consoleBodyCompact,
          largeTouch && styles.standardBodyLargeTouch,
        ]}
      >
        <View
          style={[
            isConsole ? styles.consoleMedia : undefined,
            isModalWide && styles.modalMedia,
            isCompactConsole && styles.consoleMediaCompact,
          ]}
        >
          <MediaViewer
            largeTouch={largeTouch}
            media={topic.media}
            onPress={
              isModal && topic.media.type === "image"
                ? onMediaPress
                : undefined
            }
            variant={mediaVariant}
          />
        </View>

        <View
          style={[
            isConsole ? styles.consoleCopy : styles.standardCopy,
            isModalWide && styles.modalCopy,
            isCompactConsole && styles.consoleCopyCompact,
            largeTouch && styles.standardCopyLargeTouch,
          ]}
        >
          <Text
            style={[
              styles.summary,
              isConsole && styles.summaryConsole,
              isModal && styles.summaryModal,
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
              isModalWide && styles.noteGridModal,
              isCompactConsole && styles.noteGridConsoleCompact,
              largeTouch && styles.noteGridLargeTouch,
            ]}
          >
            <InfoBlock
              compact={isCompactConsole}
              console={usesInlineInfoBlocks}
              largeTouch={largeTouch}
              icon={
                <ShieldCheck
                  color={colors.surface}
                  size={largeTouch ? 22 : usesInlineInfoBlocks ? 20 : 18}
                  strokeWidth={2.4}
                />
              }
              label="Key Takeaway"
              text={topic.whyItMatters}
              tone="blue"
            />
            <InfoBlock
              compact={isCompactConsole}
              console={usesInlineInfoBlocks}
              largeTouch={largeTouch}
              icon={
                <Gauge
                  color={colors.pumpBlueDark}
                  size={largeTouch ? 22 : usesInlineInfoBlocks ? 20 : 18}
                  strokeWidth={2.4}
                />
              }
              label="Field Check"
              text={topic.fieldCheck}
              tone="gold"
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
  tone: "blue" | "gold";
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
        tone === "blue" ? styles.infoBlockBlue : styles.infoBlockGold,
      ]}
    >
      <View style={[styles.infoHeader, compact && styles.infoHeaderCompact]}>
        {icon}
        <Text
          style={[
            styles.infoLabel,
            tone === "gold" && styles.infoLabelGold,
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
          tone === "gold" && styles.infoTextGold,
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
    position: "relative",
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
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
  panelModal: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  panelConsoleCompact: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  panelModalCompact: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  kickerRight: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  closeButtonLargeTouch: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  closeButtonFloating: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
  },
  closeButtonPressed: {
    opacity: 0.76,
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
    textAlign: "center",
    position: "relative",
    top: -12, // move it up without shifting layout below
  },
  titleLargeTouch: {
    fontSize: 34,
  },
  titleConsole: {
    fontSize: 30,
  },
  titleModal: {
    paddingRight: 44,
    fontWeight: "900",
    textAlign: "left",
    top: 0,
  },
  titleConsoleCompact: {
    fontSize: 24,
  },
  titleModalCompact: {
    fontSize: 24,
    paddingRight: 40,
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
  modalBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
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
  modalMedia: {
    width: "38%",
    minWidth: 260,
    maxWidth: 360,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  consoleCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-start",
    gap: spacing.lg,
  },
  modalCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
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
  summaryModal: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
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
  noteGridModal: {
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
    borderColor: colors.pumpBlue,
    backgroundColor: colors.pumpBlue,
  },
  infoBlockGold: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
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
    color: colors.surface,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoLabelGold: {
    color: colors.pumpBlueDark,
  },
  infoLabelLargeTouch: {
    fontSize: 16,
  },
  infoLabelCompact: {
    fontSize: 11,
  },
  infoText: {
    color: colors.surface,
    fontSize: 14,
    lineHeight: 20,
  },
  infoTextGold: {
    color: colors.pumpBlueDark,
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
