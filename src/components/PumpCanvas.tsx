import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Svg, { Line } from "react-native-svg";

import { Hotspot, type HotspotLabelPosition } from "./Hotspot";
import {
  pumpCrossSection,
  type PumpTopic,
} from "../data/topics";
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

type HotspotLabelLayout = Point & {
  width?: number;
};

const PUMP_ASPECT_RATIO = 16 / 9;
const STANDARD_IMAGE_ZOOM = 1.12;
const KIOSK_DEFAULT_ZOOM = 2.05;
const KIOSK_IMAGE_OFFSET_Y = 36;
const DIAGRAM_TITLE = "VS1 Vertical Pump Anatomy";
const LABEL_EDGE_INSET = 14;
const oceanWaveBackground = require("../../assets/vertical/hydro-ocean-wave-background.gif");
const HOTSPOT_MARKER_POSITIONS: Record<string, Point> = {
  // Markers sit outboard of the pump body; their y is aligned to each
  // component's real location (topic.hotspot) so the dotted connector line
  // lands on the feature it points at rather than following a mechanical zigzag.
  "pump-motor-alignment": { x: 34, y: 13 },
  "packing-best-practice": { x: 35, y: 30 },
  resonance: { x: 66, y: 31 },
  "lineshaft-coupling": { x: 34, y: 51 },
  "floating-spiders": { x: 66, y: 62 },
  "stringent-tolerances": { x: 35, y: 72 },
  "impeller-lock-collar": { x: 66, y: 80 },
  "submerged-suction-umbrella": { x: 34, y: 90 },
  "reduce-velocity": { x: 66, y: 93 },
};

// Where each leader line terminates on the cross-section — the real component
// location. Overrides the authored topic.hotspot for markers whose feature sits
// on the column centerline (~x 49–50) rather than where the title callout was
// originally authored. Ids not listed fall back to topic.hotspot.
const HOTSPOT_COMPONENT_ANCHORS: Record<string, Point> = {
  "lineshaft-coupling": { x: 49, y: 54 },
  "floating-spiders": { x: 49, y: 66 },
  "stringent-tolerances": { x: 48, y: 76 },
  "impeller-lock-collar": { x: 50, y: 84 },
  "reduce-velocity": { x: 51, y: 95 },
};

const HOTSPOT_LABEL_LAYOUTS: Record<string, HotspotLabelLayout> = {
  "pump-motor-alignment": { x: 30, y: 20, width: 210 },
  "packing-best-practice": { x: 30, y: 37, width: 210 },
  resonance: { x: 77, y: 39, width: 214 },
  "lineshaft-coupling": { x: 30, y: 58, width: 210 },
  "floating-spiders": { x: 77, y: 69, width: 214 },
  "stringent-tolerances": { x: 30, y: 75, width: 210 },
  "impeller-lock-collar": { x: 77, y: 83, width: 214 },
  "submerged-suction-umbrella": { x: 30, y: 94, width: 210 },
  "reduce-velocity": { x: 77, y: 96, width: 214 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PumpCanvas({
  activeTopic,
  isStacked,
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

  const hotspotPoints = useMemo(
    () =>
      topics.map((topic) => {
        const markerPosition =
          HOTSPOT_MARKER_POSITIONS[topic.id] ?? topic.hotspot;
        const point = {
          x: (markerPosition.x / 100) * imageRect.width,
          y: (markerPosition.y / 100) * imageRect.height,
        };
        // The connector line terminates on the component's real location on
        // the cross-section, which is the topic's authored hotspot point.
        const anchorPosition =
          HOTSPOT_COMPONENT_ANCHORS[topic.id] ?? topic.hotspot;
        const anchor = {
          x: (anchorPosition.x / 100) * imageRect.width,
          y: (anchorPosition.y / 100) * imageRect.height,
        };

        return {
          topic,
          point,
          anchor,
        };
      }),
    [imageRect.height, imageRect.width, topics],
  );

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

  const stageHotspotPoints = useMemo(
    () =>
      hotspotPoints.map(({ point, anchor, topic }) => {
        const labelLayout =
          HOTSPOT_LABEL_LAYOUTS[topic.id] ??
          HOTSPOT_MARKER_POSITIONS[topic.id] ??
          topic.hotspot;
        const labelStagePoint = toStagePoint({
          x: (labelLayout.x / 100) * imageRect.width,
          y: (labelLayout.y / 100) * imageRect.height,
        });
        const labelWidth =
          labelLayout.width ?? (variant === "kiosk" ? 210 : 180);
        const labelHeightEstimate = variant === "kiosk" ? 64 : 54;
        const minLabelTop = variant === "kiosk" ? 112 : 88;
        const labelPosition: HotspotLabelPosition = {
          left: clamp(
            labelStagePoint.x - labelWidth / 2,
            LABEL_EDGE_INSET,
            Math.max(
              LABEL_EDGE_INSET,
              stageSize.width - labelWidth - LABEL_EDGE_INSET,
            ),
          ),
          top: clamp(
            labelStagePoint.y,
            minLabelTop,
            Math.max(
              minLabelTop,
              stageSize.height - labelHeightEstimate - LABEL_EDGE_INSET,
            ),
          ),
          width: labelWidth,
        };

        return {
          point: toStagePoint(point),
          anchor: toStagePoint(anchor),
          labelPosition,
          topic,
        };
      }),
    [
      hotspotPoints,
      imageRect.height,
      imageRect.width,
      stageSize.height,
      stageSize.width,
      toStagePoint,
      variant,
    ],
  );

  const activeHotspot =
    stageHotspotPoints.find(({ topic }) => topic.id === activeTopic.id) ??
    stageHotspotPoints[0];
  const activePoint = activeHotspot?.point ?? { x: 0, y: 0 };

  const hotspotTouchSize =
    variant === "kiosk" ? 88 : largeTouch ? 78 : isStacked ? 66 : 64;
  const activeRingSize = hotspotTouchSize + (variant === "kiosk" ? 18 : 16);
  // Light dotted leader lines from each marker to its component on the pump.
  const connectorWidth = variant === "kiosk" ? 3 : largeTouch ? 2.6 : 2.2;
  const connectorDash = `${connectorWidth} ${connectorWidth * 3.2}`;
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

            {/* Leader lines — light dotted connectors from each numbered
                marker to the component it labels on the cross-section. Drawn
                beneath the markers so the circles cap the marker-side end. */}
            <Svg
              height={stageSize.height}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              width={stageSize.width}
            >
              {stageHotspotPoints.map(({ point, anchor, topic }) => {
                const isActive = topic.id === activeTopic.id;
                return (
                  <Line
                    key={topic.id}
                    stroke={isActive ? colors.gold : colors.pumpBlue}
                    strokeDasharray={connectorDash}
                    strokeLinecap="round"
                    strokeOpacity={isActive ? 0.9 : 0.5}
                    strokeWidth={connectorWidth}
                    x1={point.x}
                    x2={anchor.x}
                    y1={point.y}
                    y2={anchor.y}
                  />
                );
              })}
            </Svg>

            {/* Permanent diagram header — the per-topic labels live beneath
                the numbered hotspots so the title can describe the full view. */}
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

            {/* Layer 3 — Interactive hotspots. */}
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
            {stageHotspotPoints.map(({ point, labelPosition, topic }, index) => (
              <Hotspot
                accessibilityLabel={`Show ${topic.title}`}
                active={topic.id === activeTopic.id}
                index={index + 1}
                key={topic.id}
                label={topic.hotspot.label}
                labelPosition={labelPosition}
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
    borderColor: colors.gold,
    borderRadius: 999,
    backgroundColor: "rgba(225, 192, 55, 0.14)",
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
