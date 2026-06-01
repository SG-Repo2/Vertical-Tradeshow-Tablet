import { CheckCircle2 } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { PumpTopic } from "../data/topics";
import { colors, radii, spacing } from "../theme/colors";

type TopicRailProps = {
  activeTopicId: string;
  compact?: boolean;
  currentIndex: number;
  largeTouch?: boolean;
  onSelectTopic: (topicId: string) => void;
  orientation?: "horizontal" | "vertical";
  topics: PumpTopic[];
};

export function TopicRail({
  activeTopicId,
  compact = false,
  currentIndex,
  largeTouch = false,
  onSelectTopic,
  orientation = "horizontal",
  topics,
}: TopicRailProps) {
  const isVertical = orientation === "vertical";
  const compactVertical = isVertical && compact;

  return (
    <View
      style={[
        styles.rail,
        isVertical && styles.railVertical,
        compactVertical && styles.railVerticalCompact,
        largeTouch && styles.railLargeTouch,
      ]}
    >
      <ScrollView
        horizontal={!isVertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.topicScroller}
        contentContainerStyle={[
          styles.topicScrollerContent,
          isVertical && styles.topicScrollerContentVertical,
          compactVertical && styles.topicScrollerContentVerticalCompact,
          largeTouch && styles.topicScrollerContentLargeTouch,
        ]}
      >
        {topics.map((topic, index) => {
          const active = topic.id === activeTopicId;
          const viewed = index < currentIndex;

          return (
            <Pressable
              accessibilityLabel={`Open module ${index + 1}: ${topic.title}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={topic.id}
              onPress={() => onSelectTopic(topic.id)}
              style={({ pressed }) => [
                styles.topicButton,
                isVertical && styles.topicButtonVertical,
                compactVertical && styles.topicButtonVerticalCompact,
                largeTouch && styles.topicButtonLargeTouch,
                active && styles.topicButtonActive,
                pressed && styles.topicButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.topicIndex,
                  isVertical && styles.topicIndexVertical,
                  compactVertical && styles.topicIndexVerticalCompact,
                  largeTouch && styles.topicIndexLargeTouch,
                  active && styles.topicIndexActive,
                  viewed && styles.topicIndexViewed,
                ]}
              >
                {viewed && !active ? (
                  <CheckCircle2
                    color={colors.surface}
                    size={largeTouch ? 18 : 14}
                    strokeWidth={3}
                  />
                ) : (
                  <Text
                    style={[
                      styles.topicIndexText,
                      isVertical && styles.topicIndexTextVertical,
                      compactVertical && styles.topicIndexTextVerticalCompact,
                      largeTouch && styles.topicIndexTextLargeTouch,
                      active && styles.topicIndexTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.topicLabel,
                  isVertical && styles.topicLabelVertical,
                  compactVertical && styles.topicLabelVerticalCompact,
                  largeTouch && styles.topicLabelLargeTouch,
                  active && styles.topicLabelActive,
                ]}
              >
                {topic.navLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  railLargeTouch: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
  },
  railVertical: {
    width: 148,
    alignItems: "stretch",
    alignSelf: "stretch",
    flexDirection: "column",
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  railVerticalCompact: {
    width: 124,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  topicScroller: {
    flex: 1,
  },
  topicScrollerContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  topicScrollerContentLargeTouch: {
    gap: spacing.md,
    paddingRight: spacing.xl,
  },
  topicScrollerContentVertical: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingRight: 0,
  },
  topicScrollerContentVerticalCompact: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  topicButton: {
    minWidth: 116,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  topicButtonLargeTouch: {
    minWidth: 160,
    minHeight: 64,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
  },
  topicButtonVertical: {
    minWidth: 0,
    width: "100%",
    minHeight: 60,
    paddingHorizontal: spacing.sm,
  },
  topicButtonVerticalCompact: {
    minHeight: 50,
  },
  topicButtonActive: {
    borderColor: colors.pumpBlue,
    backgroundColor: "#edf7fb",
  },
  topicButtonPressed: {
    backgroundColor: colors.cyanSoft,
  },
  topicIndex: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  topicIndexLargeTouch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  topicIndexVertical: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  topicIndexVerticalCompact: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  topicIndexActive: {
    backgroundColor: colors.pumpBlue,
  },
  topicIndexViewed: {
    backgroundColor: colors.success,
  },
  topicIndexText: {
    color: colors.pumpBlueDark,
    fontSize: 12,
    fontWeight: "900",
  },
  topicIndexTextLargeTouch: {
    fontSize: 16,
  },
  topicIndexTextVertical: {
    fontSize: 13,
  },
  topicIndexTextVerticalCompact: {
    fontSize: 12,
  },
  topicIndexTextActive: {
    color: colors.surface,
  },
  topicLabel: {
    maxWidth: 82,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "900",
  },
  topicLabelLargeTouch: {
    maxWidth: 120,
    fontSize: 17,
  },
  topicLabelVertical: {
    flex: 1,
    maxWidth: 110,
    fontSize: 14,
  },
  topicLabelVerticalCompact: {
    maxWidth: 92,
    fontSize: 13,
  },
  topicLabelActive: {
    color: colors.pumpBlueDark,
  },
});
