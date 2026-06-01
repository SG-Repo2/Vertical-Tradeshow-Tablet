import { useMemo } from "react";
import { Asset } from "expo-asset";
import { Image, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

import type { PumpTopic } from "../data/topics";
import { colors, radii, spacing } from "../theme/colors";

type MediaViewerProps = {
  largeTouch?: boolean;
  media: PumpTopic["media"];
  variant?: "standard" | "console" | "consoleCompact";
};

export function MediaViewer({
  largeTouch = false,
  media,
  variant = "standard",
}: MediaViewerProps) {
  if (media.type === "video") {
    return (
      <VideoMedia
        key={media.alt}
        largeTouch={largeTouch}
        media={media}
        variant={variant}
      />
    );
  }

  return (
    <View
      accessibilityLabel={media.alt}
      accessibilityRole="image"
      style={[
        styles.mediaFrame,
        variant === "console" && styles.mediaFrameConsole,
        variant === "consoleCompact" && styles.mediaFrameConsoleCompact,
        largeTouch && styles.mediaFrameLargeTouch,
      ]}
    >
      <Image
        resizeMode="contain"
        source={media.source}
        style={styles.image}
      />
    </View>
  );
}

function VideoMedia({
  largeTouch = false,
  media,
  variant = "standard",
}: MediaViewerProps) {
  const videoSource = useMemo(() => {
    const asset = Asset.fromModule(media.source);

    return asset.localUri ?? asset.uri;
  }, [media.source]);

  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = true;
  });

  return (
    <View
      accessibilityLabel={media.alt}
      accessibilityRole="image"
      style={[
        styles.mediaFrame,
        variant === "console" && styles.mediaFrameConsole,
        variant === "consoleCompact" && styles.mediaFrameConsoleCompact,
        largeTouch && styles.mediaFrameLargeTouch,
      ]}
    >
      <VideoView
        allowsFullscreen
        contentFit="contain"
        nativeControls
        player={player}
        style={styles.video}
      />
      <Text
        style={[
          styles.videoLabel,
          variant === "consoleCompact" && styles.videoLabelCompact,
          largeTouch && styles.videoLabelLargeTouch,
        ]}
      >
        Inline MP4 reference
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mediaFrame: {
    width: "100%",
    aspectRatio: 1.48,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  mediaFrameLargeTouch: {
    borderRadius: radii.xl,
  },
  mediaFrameConsole: {
    aspectRatio: 1.42,
  },
  mediaFrameConsoleCompact: {
    aspectRatio: 1.72,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoLabel: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    overflow: "hidden",
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  videoLabelCompact: {
    left: spacing.sm,
    bottom: spacing.xs,
    fontSize: 10,
  },
  videoLabelLargeTouch: {
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
