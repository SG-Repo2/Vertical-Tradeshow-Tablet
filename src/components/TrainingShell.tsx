import {
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";

import { PumpCanvas } from "./PumpCanvas";
import { TopicPanel } from "./TopicPanel";
import { pumpTopics } from "../data/topics";
import { colors, spacing } from "../theme/colors";

const KIOSK_BOTTOM_SAFE_AREA = 24;
const oceanWaveBackground = require("../../assets/vertical/hydro-ocean-wave-background.gif");

export function TrainingShell() {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const waveDrift = useRef(new Animated.Value(0)).current;

  const forceKioskPreview =
    Platform.OS === "web" &&
    typeof globalThis.location !== "undefined" &&
    globalThis.location.search.includes("display=kiosk");
  const isPortraitKiosk =
    forceKioskPreview || (height >= 1000 && height > width * 1.12);
  const isCompactKiosk = isPortraitKiosk && (height < 1120 || width < 900);
  const isWideLayout = !isPortraitKiosk && width >= 920 && width >= height;
  const isLargeTouch = !isPortraitKiosk && width >= 1600 && width >= height;
  const activeTopic = pumpTopics[activeIndex];
  const panelWidth = useMemo(
    () =>
      isLargeTouch
        ? Math.min(Math.max(width * 0.34, 500), 680)
        : Math.min(Math.max(width * 0.32, 360), 470),
    [width, isLargeTouch],
  );
  const stackedCanvasHeight = Math.min(Math.max(height * 0.42, 330), 520);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(waveDrift, {
        toValue: 1,
        duration: 18000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [waveDrift]);

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
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <Animated.Image
          resizeMode="cover"
          source={oceanWaveBackground}
          style={[
            styles.backgroundImage,
            {
              transform: [
                {
                  translateX: waveDrift.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [-28, 28, -28],
                  }),
                },
                {
                  translateY: waveDrift.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -10, 0],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.backgroundScrim} />
      </View>

      <SafeAreaView
        style={[styles.safeArea, isPortraitKiosk && styles.safeAreaKiosk]}
      >
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
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  backgroundImage: {
    width: "108%",
    height: "106%",
    left: "-4%",
    top: "-3%",
  },
  backgroundScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeAreaKiosk: {
    paddingBottom: KIOSK_BOTTOM_SAFE_AREA,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  kioskWorkspaceCompact: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  kioskCanvasPane: {
    flex: 3.05,
    minHeight: 0,
  },
  kioskPanel: {
    flex: 0.72,
    minHeight: 0,
    width: "100%",
  },
});
