import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Hotspot } from "./Hotspot";
import { pumpCrossSection, type PumpTopic } from "../data/topics";
import { colors, radii, spacing } from "../theme/colors";

type PumpCanvasProps = {
  activeTopic: PumpTopic;
  isStacked: boolean;
  largeTouch?: boolean;
  onSelectTopic: (topicId: string) => void;
  topics: PumpTopic[];
  variant?: "standard" | "kiosk";
};

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

const PUMP_ASPECT_RATIO = 16 / 9;
const STANDARD_IMAGE_ZOOM = 1.12;
const KIOSK_DEFAULT_ZOOM = 2.05;
const KIOSK_IMAGE_OFFSET_Y = 36;
const DIAGRAM_TITLE = "VS1 Vertical Pump Anatomy";
const oceanWaveBackground = require("../../assets/vertical/hydro-ocean-wave-background.gif");

// Numbered markers flank the pump in two columns pushed out toward the frame
// edges, well clear of the pump silhouette. Values are percentages of the
// cross-section artwork; y is aligned to each component's real height on the
// diagram. The x spread is deliberately wide — on the portrait kiosk the 2.05x
// zoom amplifies horizontal offset, carrying these toward the side margins
// while staying just inside the edge.
const HOTSPOT_MARKER_POSITIONS: Record<string, Point> = {
  "pump-motor-alignment": { x: 32, y: 12 },
  "packing-best-practice": { x: 30, y: 24 },
  resonance: { x: 70, y: 36 },
  "lineshaft-coupling": { x: 31, y: 52 },
  "floating-spiders": { x: 70, y: 64 },
  "stringent-tolerances": { x: 30, y: 70 },
  "impeller-lock-collar": { x: 70, y: 80 },
  "submerged-suction-umbrella": { x: 32, y: 88 },
  "reduce-velocity": { x: 70, y: 94 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// React Native has no CSS clamp(); size the markers from the stage's shorter
// edge so they read clearly at kiosk distance without overrunning the frame on
// smaller layouts. Kiosk runs a touch larger and allows a higher ceiling.
function getResponsiveHotspotSize(
  stage: Size,
  variant: "standard" | "kiosk",
): number {
  const basis = Math.min(stage.width, stage.height);
  const factor = variant === "kiosk" ? 0.12 : 0.092;
  const max = variant === "kiosk" ? 120 : 104;
  return Math.round(clamp(basis * factor, 60, max));
}

export function PumpCanvas({
  activeTopic,
  largeTouch = false,
  onSelectTopic,
  topics,
  variant = "standard",
}: PumpCanvasProps) {
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });
  // The pump is always presented at a fixed, fully-visible fit — there is no
  // manual zoom/pan on the exhibit. Kiosk mode scales the artwork up to fill
  // the reclaimed vertical space and crop the empty side margins.
  const imageOffsetY = variant === "kiosk" ? KIOSK_IMAGE_OFFSET_Y : 0;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const imageRect = useMemo(() => {
    if (!stageSize.width || !stageSize.height) {
      return { width: 0, height: 0, left: 0, top: 0 };
    }

    const stageRatio = stageSize.width / stageSize.height;
    const width =
      stageRatio > PUMP_ASPECT_RATIO
        ? stageSize.height * PUMP_ASPECT_RATIO
        : stageSize.width;
    const height = width / PUMP_ASPECT_RATIO;

    return {
      width,
      height,
      left: (stageSize.width - width) / 2,
      top: (stageSize.height - height) / 2,
    };
  }, [stageSize]);

  // Scale the kiosk artwork up to the design zoom, but never beyond what the
  // stage height can show once the title offset is accounted for. This keeps
  // the whole pump visible (no top/bottom clipping) even when the usable
  // display height is reduced by Android system bars.
  const zoom = useMemo(() => {
    if (variant !== "kiosk") {
      return STANDARD_IMAGE_ZOOM;
    }
    if (!imageRect.height) {
      return KIOSK_DEFAULT_ZOOM;
    }
    const heightLimitedZoom =
      (stageSize.height - 2 * imageOffsetY) / imageRect.height;
    return Math.max(1, Math.min(KIOSK_DEFAULT_ZOOM, heightLimitedZoom));
  }, [variant, imageRect.height, stageSize.height, imageOffsetY]);

  const toStagePoint = useCallback(
    (point: Point) => ({
      x:
        imageRect.left +
        imageRect.width / 2 +
        (point.x - imageRect.width / 2) * zoom,
      y:
        imageRect.top +
        imageOffsetY +
        imageRect.height / 2 +
        (point.y - imageRect.height / 2) * zoom,
    }),
    [
      imageRect.height,
      imageRect.left,
      imageRect.top,
      imageRect.width,
      imageOffsetY,
      zoom,
    ],
  );

  // Each marker's stage position, mapped from its percentage placement on the
  // cross-section through the same zoom/offset as the artwork.
  const stageHotspotPoints = useMemo(
    () =>
      topics.map((topic) => {
        const markerPosition =
          HOTSPOT_MARKER_POSITIONS[topic.id] ?? topic.hotspot;
        const point = toStagePoint({
          x: (markerPosition.x / 100) * imageRect.width,
          y: (markerPosition.y / 100) * imageRect.height,
        });
        return { topic, point };
      }),
    [imageRect.height, imageRect.width, toStagePoint, topics],
  );

  const activeHotspot =
    stageHotspotPoints.find(({ topic }) => topic.id === activeTopic.id) ??
    stageHotspotPoints[0];
  const activePoint = activeHotspot?.point ?? { x: 0, y: 0 };

  const hotspotTouchSize = getResponsiveHotspotSize(stageSize, variant);
  const activeRingSize = hotspotTouchSize + 20;
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.48, 0],
  });
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.55],
  });

  return (
    <View
      style={[
        styles.root,
        variant === "kiosk" && styles.rootKiosk,
        largeTouch && styles.rootLargeTouch,
      ]}
    >
      <View
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setStageSize({ width, height });
        }}
        style={styles.stage}
      >
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <Image
            resizeMode="cover"
            source={oceanWaveBackground}
            style={styles.backgroundImage}
          />
          <View style={styles.backgroundScrim} />
        </View>

        {imageRect.width > 0 ? (
          <>
            {/* Layer 2 — Pump visualization. */}
            <Animated.View
              style={[
                styles.imageLayer,
                {
                  left: imageRect.left,
                  top: imageRect.top + imageOffsetY,
                  width: imageRect.width,
                  height: imageRect.height,
                  transform: [{ scale: zoom }],
                },
              ]}
            >
              <Image
                accessibilityLabel="VS1 vertical turbine pump cross-section"
                accessibilityRole="image"
                resizeMode="contain"
                source={pumpCrossSection}
                style={styles.pumpImage}
              />
            </Animated.View>

            {/* Permanent diagram header above the numbered hotspots. */}
            <View
              pointerEvents="none"
              style={[
                styles.diagramTitle,
                variant === "kiosk" && styles.diagramTitleKiosk,
                largeTouch && styles.diagramTitleLargeTouch,
              ]}
            >
              <Text
                style={[
                  styles.diagramTitleText,
                  variant === "kiosk" && styles.diagramTitleTextKiosk,
                  largeTouch && styles.diagramTitleTextLargeTouch,
                ]}
              >
                {DIAGRAM_TITLE}
              </Text>
            </View>

            {/* Layer 3 — Active pulse ring + interactive hotspots. */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                {
                  height: activeRingSize,
                  left: activePoint.x - activeRingSize / 2,
                  opacity: pulseOpacity,
                  top: activePoint.y - activeRingSize / 2,
                  transform: [{ scale: pulseScale }],
                  width: activeRingSize,
                },
              ]}
            />
            {stageHotspotPoints.map(({ point, topic }, index) => (
              <Hotspot
                accessibilityLabel={`Show ${topic.title}`}
                active={topic.id === activeTopic.id}
                index={index + 1}
                key={topic.id}
                onPress={() => onSelectTopic(topic.id)}
                size={hotspotTouchSize}
                x={point.x}
                y={point.y}
              />
            ))}
          </>
        ) : (
          <Text style={styles.loadingText}>Loading pump view</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 300,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: colors.pumpBlueDark,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  rootKiosk: {
    minHeight: 0,
  },
  rootLargeTouch: {
    borderRadius: radii.xl,
  },
  stage: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.background,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  backgroundScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  imageLayer: {
    position: "absolute",
  },
  pumpImage: {
    width: "100%",
    height: "100%",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 3,
    borderColor: colors.pumpBlue,
    borderRadius: 999,
    backgroundColor: "rgba(25, 70, 142, 0.16)",
  },
  diagramTitle: {
    position: "absolute",
    top: 20,
    left: 24,
    right: 24,
    zIndex: 20,
    alignItems: "center",
  },
  diagramTitleKiosk: {
    top: 28,
    left: 32,
    right: 32,
  },
  diagramTitleLargeTouch: {
    top: 28,
    left: 32,
    right: 32,
  },
  diagramTitleText: {
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: colors.pumpBlueDark,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  diagramTitleTextKiosk: {
    fontSize: 38,
    lineHeight: 44,
  },
  diagramTitleTextLargeTouch: {
    fontSize: 34,
    lineHeight: 40,
  },
  loadingText: {
    alignSelf: "center",
    marginTop: spacing.xl,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
});
