import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListChecks,
} from "lucide-react-native";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeTopic =
    topics.find((topic) => topic.id === activeTopicId) ?? topics[currentIndex];
  const showDrawer = !isVertical;

  const handleSelectTopic = (topicId: string) => {
    onSelectTopic(topicId);
    if (showDrawer) {
      setDrawerOpen(false);
    }
  };

  const topicButtons = topics.map((topic, index) => {
    const active = topic.id === activeTopicId;
    const viewed = index < currentIndex;

    return (
      <Pressable
        accessibilityLabel={`Open module ${index + 1}: ${topic.title}`}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        key={topic.id}
        onPress={() => handleSelectTopic(topic.id)}
        style={({ pressed }) => [
          styles.topicButton,
          showDrawer && styles.topicButtonDrawer,
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
            showDrawer && styles.topicLabelDrawer,
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
  });

  if (showDrawer) {
    return (
      <View pointerEvents="box-none" style={styles.drawerOverlay}>
        <View
          style={[
            styles.drawerShell,
            drawerOpen && styles.drawerShellOpen,
            largeTouch && styles.drawerShellLargeTouch,
          ]}
        >
          <Pressable
            accessibilityLabel={
              drawerOpen
                ? "Hide module navigation"
                : `Show module navigation. Current module ${currentIndex + 1} of ${topics.length}: ${activeTopic.title}`
            }
            accessibilityRole="button"
            accessibilityState={{ expanded: drawerOpen }}
            onPress={() => setDrawerOpen((open) => !open)}
            style={({ pressed }) => [
              styles.drawerToggle,
              largeTouch && styles.drawerToggleLargeTouch,
              pressed && styles.drawerTogglePressed,
            ]}
          >
            <ListChecks
              color={colors.pumpBlue}
              size={largeTouch ? 22 : 17}
              strokeWidth={2.4}
            />
            <View style={styles.drawerCopy}>
              <Text
                style={[
                  styles.drawerKicker,
                  largeTouch && styles.drawerKickerLargeTouch,
                ]}
              >
                Module {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {topics.length}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.drawerTitle,
                  largeTouch && styles.drawerTitleLargeTouch,
                ]}
              >
                {activeTopic.navLabel}
              </Text>
            </View>
            {drawerOpen ? (
              <ChevronDown
                color={colors.textSubtle}
                size={largeTouch ? 24 : 18}
                strokeWidth={2.4}
              />
            ) : (
              <ChevronUp
                color={colors.textSubtle}
                size={largeTouch ? 24 : 18}
                strokeWidth={2.4}
              />
            )}
          </Pressable>

          {drawerOpen ? (
            <>
              <View style={styles.drawerDivider} />
              <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={[styles.topicScroller, styles.topicScrollerDrawer]}
                contentContainerStyle={[
                  styles.topicScrollerContent,
                  styles.topicScrollerContentDrawer,
                  largeTouch && styles.topicScrollerContentLargeTouch,
                ]}
              >
                {topicButtons}
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    );
  }

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
        {topicButtons}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: spacing.md,
    zIndex: 50,
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
  },
  drawerShell: {
    minWidth: 264,
    maxWidth: 560,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  drawerShellOpen: {
    width: 320,
    maxWidth: "100%",
  },
  drawerShellLargeTouch: {
    width: 390,
    minWidth: 340,
    maxWidth: 420,
    borderRadius: radii.xl,
  },
  drawerToggle: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  drawerToggleLargeTouch: {
    minHeight: 58,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  drawerTogglePressed: {
    backgroundColor: colors.cyanSoft,
  },
  drawerCopy: {
    flex: 1,
    minWidth: 0,
  },
  drawerKicker: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  drawerKickerLargeTouch: {
    fontSize: 12,
  },
  drawerTitle: {
    color: colors.pumpBlueDark,
    fontSize: 14,
    fontWeight: "900",
  },
  drawerTitleLargeTouch: {
    fontSize: 18,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  rail: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.borderStrong,
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
    borderRightWidth: 2,
    borderRightColor: colors.borderStrong,
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
  topicScrollerDrawer: {
    flex: 0,
    maxHeight: 420,
  },
  topicScrollerContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  topicScrollerContentDrawer: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
    minWidth: 104,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  topicButtonDrawer: {
    width: "100%",
    minHeight: 42,
    justifyContent: "flex-start",
    paddingHorizontal: spacing.md,
  },
  topicButtonLargeTouch: {
    minWidth: 142,
    minHeight: 56,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.cyanSoft,
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
  topicLabelDrawer: {
    flex: 1,
    maxWidth: "100%",
  },
  topicLabelLargeTouch: {
    maxWidth: 132,
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
