import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { TrainingShell } from "./src/components/TrainingShell";
import { colors } from "./src/theme/colors";

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <TrainingShell />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
