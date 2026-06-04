import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react-native";

import { PumpCanvas } from "./PumpCanvas";
import { TopicPanel } from "./TopicPanel";
import { pumpTopics } from "../data/topics";
import { colors, radii, spacing } from "../theme/colors";

const KIOSK_BOTTOM_SAFE_AREA = 24;
const oceanWaveBackground = require("../../assets/vertical/hydro-ocean-wave-background.gif");

export function TrainingShell() {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModuleModalVisible, setIsModuleModalVisible] = useState(false);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const waveDrift = useRef(new Animated.Value(0)).current;

  const forceKioskPreview =
    Platform.OS === "web" &&
    typeof globalThis.location !== "undefined" &&
    globalThis.location.search.includes("display=kiosk");
  const isPortraitKiosk = forceKioskPreview || height > width * 1.05;
  const isCompactKiosk = isPortraitKiosk && (height < 1120 || width < 900);
  const isWideLayout = !isPortraitKiosk && width >= 920 && width >= height;
  const isLargeTouch = !isPortraitKiosk && width >= 1600 && width >= height;
  const isModalWide = width >= 760;
  const activeTopic = pumpTopics[activeIndex];
  const panelWidth = useMemo(
    () =>
      isLargeTouch
        ? Math.min(Math.max(width * 0.34, 500), 680)
        : Math.min(Math.max(width * 0.32, 360), 470),
    [width, isLargeTouch],
  );
  const modalFrame = useMemo(() => {
    const padding = width < 600 ? spacing.md : spacing.xl;
    const availableWidth = Math.max(width - padding * 2, 240);
    const availableHeight = Math.max(
      height - padding * 2 - KIOSK_BOTTOM_SAFE_AREA,
      320,
    );

    return {
      maxHeight: availableHeight,
      width: Math.min(availableWidth, isModalWide ? 940 : 680),
    };
  }, [height, isModalWide, width]);
  const mediaLightboxFrame = useMemo(() => {
    const padding = width < 600 ? spacing.lg : spacing.xxxl;

    return {
      height: Math.min(Math.max(height - padding * 2, 260), 820),
      width: Math.min(Math.max(width - padding * 2, 260), 1120),
    };
  }, [height, width]);
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

  useEffect(() => {
    if (!isPortraitKiosk && isModuleModalVisible) {
      setIsModuleModalVisible(false);
      setIsMediaModalVisible(false);
    }
  }, [isModuleModalVisible, isPortraitKiosk]);

  const selectTopic = (topicId: string) => {
    const nextIndex = pumpTopics.findIndex((topic) => topic.id === topicId);
    if (nextIndex >= 0) {
      setIsMediaModalVisible(false);
      setActiveIndex(nextIndex);
      if (isPortraitKiosk) {
        setIsModuleModalVisible(true);
      }
    }
  };

  const closeModuleModal = () => {
    setIsMediaModalVisible(false);
    setIsModuleModalVisible(false);
  };

  const openMediaLightbox = () => {
    if (activeTopic.media.type === "image") {
      setIsMediaModalVisible(true);
    }
  };

  const closeMediaLightbox = () => {
    setIsMediaModalVisible(false);
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
                styles.kioskWorkspaceModal,
                isCompactKiosk && styles.kioskWorkspaceCompact,
              ]}
            >
              <View style={styles.kioskCanvasPaneModal}>
                <PumpCanvas
                  activeTopic={activeTopic}
                  isStacked
                  onSelectTopic={selectTopic}
                  topics={pumpTopics}
                  variant="kiosk"
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
      </SafeAreaView>

      <Modal
        animationType="fade"
        onRequestClose={closeModuleModal}
        transparent
        visible={isPortraitKiosk && isModuleModalVisible}
      >
        <View style={styles.moduleModalOverlay}>
          <Pressable
            accessibilityLabel="Close module details"
            accessibilityRole="button"
            onPress={closeModuleModal}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={[
              styles.moduleModalFrame,
              {
                maxHeight: modalFrame.maxHeight,
                width: modalFrame.width,
              },
            ]}
          >
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.moduleModalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              style={styles.moduleModalScroll}
            >
              <TopicPanel
                compact={!isModalWide}
                currentIndex={activeIndex}
                onClose={closeModuleModal}
                onMediaPress={openMediaLightbox}
                style={styles.moduleModalPanel}
                topic={activeTopic}
                totalTopics={pumpTopics.length}
                variant="modal"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={closeMediaLightbox}
        transparent
        visible={
          isPortraitKiosk &&
          isModuleModalVisible &&
          isMediaModalVisible &&
          activeTopic.media.type === "image"
        }
      >
        <View style={styles.mediaLightboxOverlay}>
          <Pressable
            accessibilityLabel="Return to module details"
            accessibilityRole="button"
            onPress={closeMediaLightbox}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={[
              styles.mediaLightboxFrame,
              {
                height: mediaLightboxFrame.height,
                width: mediaLightboxFrame.width,
              },
            ]}
          >
            {activeTopic.media.type === "image" ? (
              <Image
                accessibilityLabel={activeTopic.media.alt}
                accessibilityRole="image"
                resizeMode="contain"
                source={activeTopic.media.source}
                style={styles.mediaLightboxImage}
              />
            ) : null}
            <Pressable
              accessibilityLabel="Close enlarged image"
              accessibilityRole="button"
              hitSlop={10}
              onPress={closeMediaLightbox}
              style={({ pressed }) => [
                styles.mediaLightboxClose,
                pressed && styles.mediaLightboxClosePressed,
              ]}
            >
              <X color={colors.pumpBlueDark} size={24} strokeWidth={3} />
            </Pressable>
          </View>
        </View>
      </Modal>
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
  kioskWorkspaceModal: {
    gap: 0,
  },
  kioskWorkspaceCompact: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  kioskCanvasPaneModal: {
    flex: 1,
    minHeight: 0,
  },
  moduleModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0, 45, 73, 0.66)",
  },
  moduleModalFrame: {
    zIndex: 1,
    maxWidth: "100%",
  },
  moduleModalScroll: {
    width: "100%",
  },
  moduleModalScrollContent: {
    paddingVertical: spacing.xs,
  },
  moduleModalPanel: {
    width: "100%",
  },
  mediaLightboxOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0, 22, 36, 0.82)",
  },
  mediaLightboxFrame: {
    zIndex: 1,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  mediaLightboxImage: {
    width: "100%",
    height: "100%",
  },
  mediaLightboxClose: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  mediaLightboxClosePressed: {
    opacity: 0.76,
  },
});
