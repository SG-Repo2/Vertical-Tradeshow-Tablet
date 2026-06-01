import { Home, RotateCcw } from "lucide-react-native";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import { PumpCanvas } from "./PumpCanvas";
import { TopicPanel } from "./TopicPanel";
import { TopicRail } from "./TopicRail";
import { pumpTopics } from "../data/topics";
import { colors, radii, spacing } from "../theme/colors";

const KIOSK_BOTTOM_SAFE_AREA = 24;

export function TrainingShell() {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const forceKioskPreview =
    Platform.OS === "web" &&
    typeof globalThis.location !== "undefined" &&
    globalThis.location.search.includes("display=kiosk");
  const isPortraitKiosk =
    forceKioskPreview || (height >= 1000 && height > width * 1.12);
  const isCompactKiosk = isPortraitKiosk && (height < 1120 || width < 900);
  const isWideLayout = !isPortraitKiosk && width >= 920 && width >= height;
  const isLargeTouch = !isPortraitKiosk && width >= 1600 && width >= height;
  const isSmallLayout = width < 760;
  const activeTopic = pumpTopics[activeIndex];
  const panelWidth = useMemo(
    () =>
      isLargeTouch
        ? Math.min(Math.max(width * 0.34, 500), 680)
        : Math.min(Math.max(width * 0.32, 360), 470),
    [width, isLargeTouch],
  );
  const stackedCanvasHeight = Math.min(Math.max(height * 0.42, 330), 520);

  const selectTopic = (topicId: string) => {
    const nextIndex = pumpTopics.findIndex((topic) => topic.id === topicId);
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  };

  const workspace = (
    <View
      style={[
        styles.workspace,
        isWideLayout ? styles.workspaceWide : styles.workspaceStacked,
        isLargeTouch && styles.workspaceLargeTouch,
      ]}
    >
      <View
        style={[
          styles.canvasPane,
          !isWideLayout && { height: stackedCanvasHeight },
        ]}
      >
        <PumpCanvas
          activeTopic={activeTopic}
          isStacked={!isWideLayout}
          largeTouch={isLargeTouch}
          onSelectTopic={selectTopic}
          topics={pumpTopics}
          variant="standard"
        />
      </View>
      <TopicPanel
        currentIndex={activeIndex}
        largeTouch={isLargeTouch}
        style={isWideLayout ? { width: panelWidth } : styles.panelStacked}
        topic={activeTopic}
        totalTopics={pumpTopics.length}
        variant="standard"
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, isPortraitKiosk && styles.safeAreaKiosk]}
    >
      <View
        style={[
          styles.header,
          isPortraitKiosk && styles.headerKiosk,
          isCompactKiosk && styles.headerKioskCompact,
          isLargeTouch && styles.headerLargeTouch,
        ]}
      >
        <View style={styles.titleGroup}>
          <Text
            style={[
              styles.appLabel,
              isLargeTouch && styles.appLabelLargeTouch,
            ]}
          >
            VS1 Vertical Pump Interactive
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            numberOfLines={1}
            style={[
              styles.headerTitle,
              isPortraitKiosk && styles.headerTitleKiosk,
              isCompactKiosk && styles.headerTitleKioskCompact,
              isLargeTouch && styles.headerTitleLargeTouch,
            ]}
          >
            {activeTopic.title}
          </Text>
        </View>

        {!isSmallLayout ? (
          <View
            style={[
              styles.currentPill,
              isLargeTouch && styles.currentPillLargeTouch,
            ]}
          >
            <Home
              color={colors.cyan}
              size={isLargeTouch ? 22 : 17}
              strokeWidth={2.4}
            />
            <View style={styles.currentCopy}>
              <Text
                style={[
                  styles.currentLabel,
                  isLargeTouch && styles.currentLabelLargeTouch,
                ]}
              >
                Current Module
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.currentValue,
                  isLargeTouch && styles.currentValueLargeTouch,
                ]}
              >
                {activeTopic.navLabel}
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="Reset to first module"
          accessibilityRole="button"
          onPress={() => setActiveIndex(0)}
          style={({ pressed }) => [
            styles.resetButton,
            isLargeTouch && styles.resetButtonLargeTouch,
            pressed && styles.resetButtonPressed,
          ]}
        >
          <RotateCcw
            color={colors.pumpBlueDark}
            size={isLargeTouch ? 22 : 18}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.resetText,
              isLargeTouch && styles.resetTextLargeTouch,
            ]}
          >
            Reset
          </Text>
        </Pressable>
      </View>

      {isPortraitKiosk ? (
        <View style={styles.kioskBody}>
          <View
            style={[
              styles.kioskWorkspace,
              isCompactKiosk && styles.kioskWorkspaceCompact,
            ]}
          >
            <View style={styles.kioskCanvasPane}>
              <PumpCanvas
                activeTopic={activeTopic}
                isStacked
                onSelectTopic={selectTopic}
                topics={pumpTopics}
                variant="kiosk"
              />
            </View>
            <TopicPanel
              compact={isCompactKiosk}
              currentIndex={activeIndex}
              style={styles.kioskPanel}
              topic={activeTopic}
              totalTopics={pumpTopics.length}
              variant="console"
            />
            <View style={styles.kioskModuleNavigation}>
              <TopicRail
                activeTopicId={activeTopic.id}
                currentIndex={activeIndex}
                onSelectTopic={selectTopic}
                topics={pumpTopics}
              />
            </View>
          </View>
        </View>
      ) : isWideLayout ? (
        <View
          style={[
            styles.workspaceHolder,
            isLargeTouch && styles.workspaceHolderLargeTouch,
          ]}
        >
          {workspace}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.workspaceScrollContent}
          style={styles.workspaceScroll}
        >
          {workspace}
        </ScrollView>
      )}

      {!isPortraitKiosk ? (
        <TopicRail
          activeTopicId={activeTopic.id}
          currentIndex={activeIndex}
          largeTouch={isLargeTouch}
          onSelectTopic={selectTopic}
          topics={pumpTopics}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeAreaKiosk: {
    paddingBottom: KIOSK_BOTTOM_SAFE_AREA,
  },
  header: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLargeTouch: {
    minHeight: 96,
    gap: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
  },
  headerKiosk: {
    minHeight: 82,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerKioskCompact: {
    minHeight: 74,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  appLabel: {
    color: colors.pumpBlue,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  appLabelLargeTouch: {
    fontSize: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
  },
  headerTitleLargeTouch: {
    fontSize: 34,
  },
  headerTitleKiosk: {
    fontSize: 30,
  },
  headerTitleKioskCompact: {
    fontSize: 26,
  },
  currentPill: {
    minWidth: 194,
    maxWidth: 270,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  currentPillLargeTouch: {
    minWidth: 240,
    maxWidth: 340,
    minHeight: 64,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
  },
  currentCopy: {
    flex: 1,
    minWidth: 0,
  },
  currentLabel: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  currentLabelLargeTouch: {
    fontSize: 13,
  },
  currentValue: {
    color: colors.pumpBlueDark,
    fontSize: 15,
    fontWeight: "900",
  },
  currentValueLargeTouch: {
    fontSize: 20,
  },
  resetButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  resetButtonLargeTouch: {
    minHeight: 56,
    minWidth: 120,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
  },
  resetButtonPressed: {
    backgroundColor: colors.cyanSoft,
  },
  resetText: {
    color: colors.pumpBlueDark,
    fontSize: 14,
    fontWeight: "900",
  },
  resetTextLargeTouch: {
    fontSize: 18,
  },
  workspaceHolder: {
    flex: 1,
    padding: spacing.lg,
  },
  workspaceHolderLargeTouch: {
    padding: spacing.xxl,
  },
  workspaceLargeTouch: {
    gap: spacing.xl,
  },
  workspaceScroll: {
    flex: 1,
  },
  workspaceScrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  workspace: {
    flex: 1,
    gap: spacing.lg,
  },
  workspaceWide: {
    flexDirection: "row",
  },
  workspaceStacked: {
    flexDirection: "column",
  },
  canvasPane: {
    flex: 1,
    minHeight: 300,
  },
  panelStacked: {
    width: "100%",
  },
  kioskBody: {
    flex: 1,
    minHeight: 0,
  },
  kioskWorkspace: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  kioskWorkspaceCompact: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  kioskCanvasPane: {
    flex: 2.45,
    minHeight: 0,
  },
  kioskPanel: {
    flex: 0.72,
    minHeight: 0,
    width: "100%",
  },
  kioskModuleNavigation: {
    marginBottom: 60,
  },
});
