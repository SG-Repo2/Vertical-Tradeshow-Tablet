import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

export type HotspotLabelPosition = {
  left: number;
  top: number;
  width: number;
};

type HotspotProps = {
  active: boolean;
  accessibilityLabel: string;
  index: number;
  label: string;
  labelPosition: HotspotLabelPosition;
  size?: number;
  x: number;
  y: number;
  onPress: () => void;
};

export function Hotspot({
  active,
  accessibilityLabel,
  index,
  label,
  labelPosition,
  size = 52,
  x,
  y,
  onPress,
}: HotspotProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(active ? 1.04 : 1)).current;
  const fontSize = size >= 58 ? 22 : 18;
  const labelFontSize = size >= 80 ? 14 : size >= 58 ? 12 : 11;
  const labelLineHeight = Math.round(labelFontSize * 1.18);
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
    <>
      <View
        pointerEvents="none"
        style={[
          styles.labelWrap,
          active && styles.labelWrapActive,
          {
            left: labelPosition.left,
            top: labelPosition.top,
            width: labelPosition.width,
          },
        ]}
      >
        <Text
          style={[
            styles.markerLabel,
            {
              fontSize: labelFontSize,
              lineHeight: labelLineHeight,
            },
          ]}
        >
          {label}
        </Text>
      </View>
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
    </>
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
  labelWrap: {
    position: "absolute",
    zIndex: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(25, 70, 142, 0.28)",
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    color: colors.pumpBlueDark,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  labelWrapActive: {
    zIndex: 20,
    borderColor: colors.gold,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
  },
  markerLabel: {
    color: colors.pumpBlueDark,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
