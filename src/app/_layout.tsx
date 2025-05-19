import "@/../global.css";
import RootProvider from "@/providers/root-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <RootProvider>
      <SafeAreaView className="flex-1">
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="models" />
          <Stack.Screen name="[modelId]" />
        </Stack>
      </SafeAreaView>
    </RootProvider>
  );
}
