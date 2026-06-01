import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react-native";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Hotspot } from "./Hotspot";
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

const PUMP_ASPECT_RATIO = 16 / 9;
const KIOSK_DEFAULT_ZOOM = 1.95;
const KIOSK_IMAGE_OFFSET_Y = 52;
const HOTSPOT_MARKER_POSITIONS: Record<string, Point> = {
  "pump-motor-alignment": { x: 43, y: 10 },
  "packing-best-practice": { x: 43, y: 22 },
  resonance: { x: 59, y: 35 },
  "lineshaft-coupling": { x: 43, y: 47 },
  "floating-spiders": { x: 59, y: 58 },
  "stringent-tolerances": { x: 43, y: 69 },
  "impeller-lock-collar": { x: 59, y: 78 },
  "submerged-suction-umbrella": { x: 43, y: 86 },
  "reduce-velocity": { x: 59, y: 92 },
};

export function PumpCanvas({
  activeTopic,
  isStacked,
  largeTouch = false,
  onSelectTopic,
  topics,
  variant = "standard",
}: PumpCanvasProps) {
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });
  const defaultZoom = variant === "kiosk" ? KIOSK_DEFAULT_ZOOM : 1;
  const [zoom, setZoom] = useState(defaultZoom);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const pulse = useRef(new Animated.Value(0)).current;
  const panRef = useRef(pan);
  const panStartRef = useRef(pan);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    setZoom(defaultZoom);
    setPan({ x: 0, y: 0 });
  }, [defaultZoom]);

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
  const imageOffsetY = variant === "kiosk" ? KIOSK_IMAGE_OFFSET_Y : 0;

  const hotspotPoints = useMemo(
    () =>
      topics.map((topic) => {
        const markerPosition =
          HOTSPOT_MARKER_POSITIONS[topic.id] ?? topic.hotspot;
        const point = {
          x: (markerPosition.x / 100) * imageRect.width,
          y: (markerPosition.y / 100) * imageRect.height,
        };

        return {
          topic,
          point,
        };
      }),
    [imageRect.height, imageRect.width, topics],
  );

  const toStagePoint = useCallback(
    (point: Point) => ({
      x:
        imageRect.left +
        imageRect.width / 2 +
        pan.x +
        (point.x - imageRect.width / 2) * zoom,
      y:
        imageRect.top +
        imageOffsetY +
        imageRect.height / 2 +
        pan.y +
        (point.y - imageRect.height / 2) * zoom,
    }),
    [
      imageRect.height,
      imageRect.left,
      imageRect.top,
      imageRect.width,
      imageOffsetY,
      pan.x,
      pan.y,
      zoom,
    ],
  );

  const stageHotspotPoints = useMemo(
    () =>
      hotspotPoints.map(({ point, topic }) => ({
        point: toStagePoint(point),
        topic,
      })),
    [hotspotPoints, toStagePoint],
  );

  const activeHotspot =
    stageHotspotPoints.find(({ topic }) => topic.id === activeTopic.id) ??
    stageHotspotPoints[0];
  const activePoint = activeHotspot?.point ?? { x: 0, y: 0 };

  const maxPan = useMemo(
    () => ({
      x: Math.max(0, (imageRect.width * (zoom - 1)) / 2),
      y: Math.max(0, (imageRect.height * (zoom - 1)) / 2),
    }),
    [imageRect.height, imageRect.width, zoom],
  );

  const clampPan = useCallback(
    (next: Point) => ({
      x: clamp(next.x, -maxPan.x, maxPan.x),
      y: clamp(next.y, -maxPan.y, maxPan.y),
    }),
    [maxPan.x, maxPan.y],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          zoom > 1.01 &&
          (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5),
        onPanResponderGrant: () => {
          panStartRef.current = panRef.current;
        },
        onPanResponderMove: (_, gesture) => {
          setPan(
            clampPan({
              x: panStartRef.current.x + gesture.dx,
              y: panStartRef.current.y + gesture.dy,
            }),
          );
        },
      }),
    [clampPan, zoom],
  );

  const setZoomLevel = useCallback((nextZoom: number) => {
    const next = clamp(nextZoom, 1, variant === "kiosk" ? 2.65 : 2.25);
    setZoom(next);
    if (next === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [variant]);

  const hotspotTouchSize = variant === "kiosk" ? 60 : largeTouch ? 60 : isStacked ? 50 : 48;
  const activeRingSize = hotspotTouchSize + (variant === "kiosk" ? 18 : 16);
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
        {...panResponder.panHandlers}
      >
        {imageRect.width > 0 ? (
          <>
            <Animated.View
              style={[
                styles.imageLayer,
                {
                  left: imageRect.left,
                  top: imageRect.top + imageOffsetY,
                  width: imageRect.width,
                  height: imageRect.height,
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                    { scale: zoom },
                  ],
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
                {activeTopic.hotspot.label}
              </Text>
            </View>
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

      <View
        style={[
          styles.zoomControls,
          largeTouch && styles.zoomControlsLargeTouch,
        ]}
      >
        <IconButton
          accessibilityLabel="Zoom out pump image"
          disabled={zoom <= 1}
          largeTouch={largeTouch}
          onPress={() => setZoomLevel(zoom - 0.25)}
        >
          <ZoomOut
            color={colors.pumpBlueDark}
            size={largeTouch ? 24 : 18}
            strokeWidth={2.3}
          />
        </IconButton>
        <IconButton
          accessibilityLabel="Fit pump image to view"
          largeTouch={largeTouch}
          onPress={() => setZoomLevel(defaultZoom)}
        >
          <Maximize2
            color={colors.pumpBlueDark}
            size={largeTouch ? 24 : 18}
            strokeWidth={2.3}
          />
        </IconButton>
        <IconButton
          accessibilityLabel="Zoom in pump image"
          disabled={zoom >= (variant === "kiosk" ? 2.65 : 2.25)}
          largeTouch={largeTouch}
          onPress={() => setZoomLevel(zoom + 0.25)}
        >
          <ZoomIn
            color={colors.pumpBlueDark}
            size={largeTouch ? 24 : 18}
            strokeWidth={2.3}
          />
        </IconButton>
      </View>
    </View>
  );
}

type IconButtonProps = {
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  largeTouch?: boolean;
  onPress: () => void;
};

function IconButton({
  accessibilityLabel,
  children,
  disabled = false,
  largeTouch = false,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        largeTouch && styles.iconButtonLargeTouch,
        pressed && styles.iconButtonPressed,
        disabled && styles.iconButtonDisabled,
      ]}
    >
      {children}
    </Pressable>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 300,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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
    borderColor: colors.cyan,
    borderRadius: 999,
    backgroundColor: "rgba(22, 164, 200, 0.12)",
  },
  diagramTitle: {
    position: "absolute",
    top: 20,
    left: 24,
    right: 176,
    zIndex: 20,
  },
  diagramTitleKiosk: {
    right: 188,
  },
  diagramTitleLargeTouch: {
    top: 28,
    left: 32,
    right: 220,
  },
  diagramTitleText: {
    color: colors.pumpBlueDark,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 29,
  },
  diagramTitleTextKiosk: {
    fontSize: 32,
    lineHeight: 38,
  },
  diagramTitleTextLargeTouch: {
    fontSize: 30,
    lineHeight: 36,
  },
  loadingText: {
    alignSelf: "center",
    marginTop: spacing.xl,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  zoomControls: {
    position: "absolute",
    right: 20,
    top: 20,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  zoomControlsLargeTouch: {
    right: 28,
    top: 28,
    borderRadius: radii.xl,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  iconButtonLargeTouch: {
    width: 56,
    height: 56,
  },
  iconButtonPressed: {
    backgroundColor: colors.cyanSoft,
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
});
