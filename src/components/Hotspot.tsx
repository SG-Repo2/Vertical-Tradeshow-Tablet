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
  size = 52,
  x,
  y,
  onPress,
}: HotspotProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(active ? 1.04 : 1)).current;
  const fontSize = size >= 58 ? 22 : 18;
  const hitSlop = Math.max(0, (44 - size) / 2);

  useEffect(() => {
    Animated.spring(scale, {
      friction: 8,
      tension: 170,
      toValue: active ? 1.08 : hovered || focused ? 1.06 : 1,
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
  },
  pressed: {
    opacity: 0.86,
  },
  markerCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  markerCircleInactive: {
    borderWidth: 3,
    borderColor: colors.pumpBlue,
    backgroundColor: colors.surface,
  },
  markerCircleActive: {
    borderWidth: 3,
    borderColor: colors.gold,
    backgroundColor: colors.pumpBlueDark,
  },
  markerText: {
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },
});
