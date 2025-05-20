import { NAV_THEME } from "@/lib/constants";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "react-query";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
  fonts: {
    regular: {
      fontFamily: "Urbanist-Regular",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "Urbanist-Medium",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "Urbanist-Bold",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "Urbanist-Heavy",
      fontWeight: "900",
    },
  },
};

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before app is ready
SplashScreen.preventAutoHideAsync();

function AppContent({ children }: Readonly<{ children: ReactNode }>) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{
        paddingTop: Platform.OS === "ios" ? 0 : insets.top,
      }}
    >
      {children}
      <PortalHost />
    </View>
  );
}

export default function RootProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  useEffect(() => {
    // Add background color for web platform
    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    // Hide splash screen once app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={LIGHT_THEME}>
        <SafeAreaProvider>
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <AppContent>{children}</AppContent>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
