import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";

type HotspotProps = {
  active: boolean;
  accessibilityLabel: string;
  index: number;
  size?: number;
  x: number;
  y: number;
  onPress: () => void;
};

export function Hotspot({
  active,
  accessibilityLabel,
  index,
  size = 64,
  x,
  y,
  onPress,
}: HotspotProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(active ? 1.15 : 1)).current;
  // Number scales with the circle so it stays proportionate across layouts.
  const fontSize = Math.max(20, Math.round(size * 0.36));
  // Keep a comfortable touch target even when the visual circle is on the
  // smaller end of the responsive band.
  const hitSlop = Math.max(0, Math.round((72 - size) / 2));

  useEffect(() => {
    Animated.spring(scale, {
      friction: 8,
      tension: 170,
      toValue: active ? 1.15 : hovered || focused ? 1.08 : 1,
      useNativeDriver: true,
    }).start();
  }, [active, focused, hovered, scale]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={hitSlop}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hotspot,
        {
          borderRadius: size / 2,
          height: size,
          left: x - size / 2,
          top: y - size / 2,
          width: size,
        },
        active && styles.hotspotActive,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.markerCircle,
          {
            borderRadius: size / 2,
            height: size,
            transform: [{ scale }],
            width: size,
          },
          active ? styles.markerCircleActive : styles.markerCircleInactive,
        ]}
      >
        <Text
          style={[
            styles.markerText,
            {
              color: active ? colors.surface : colors.pumpBlueDark,
              fontSize,
              lineHeight: Math.round(fontSize * 1.1),
            },
          ]}
        >
          {index}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hotspot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 12,
  },
  hotspotActive: {
    zIndex: 18,
  },
  pressed: {
    opacity: 0.86,
  },
  markerCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  // Inactive: white chip with a heavy navy ring and navy number.
  markerCircleInactive: {
    borderWidth: 4,
    borderColor: colors.pumpBlueDark,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
  },
  // Active: solid blue disc with a white number and a blue glow.
  markerCircleActive: {
    borderWidth: 4,
    borderColor: colors.pumpBlueDark,
    backgroundColor: colors.pumpBlue,
    shadowColor: colors.pumpBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 14,
  },
  markerText: {
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
});
