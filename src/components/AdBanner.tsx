import Constants from "expo-constants";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";

type GoogleMobileAdsModule = typeof import("react-native-google-mobile-ads");

function canUseNativeModules() {
  if (Platform.OS === "web") return false;
  return Constants.appOwnership !== "expo";
}

function loadGoogleMobileAdsModule(): GoogleMobileAdsModule | null {
  if (!canUseNativeModules()) return null;

  try {
    // Avoid importing at module scope: it crashes in Expo Go / binaries without the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  } catch {
    return null;
  }
}

export function AdBanner() {
  const googleMobileAds = useMemo(loadGoogleMobileAdsModule, []);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!googleMobileAds) return;

    const moduleAny = googleMobileAds as any;
    const mobileAds = moduleAny.default ?? moduleAny;

    mobileAds()
      .initialize()
      .catch((error: unknown) => {
        setInitError(error instanceof Error ? error.message : String(error));
      });
  }, [googleMobileAds]);

  if (!googleMobileAds) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>
          Anuncios no disponibles (requiere Development Build / Standalone).
        </Text>
      </View>
    );
  }

  const moduleAny = googleMobileAds as any;
  const BannerAd = moduleAny.BannerAd as React.ComponentType<any>;
  const BannerAdSize = moduleAny.BannerAdSize as any;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={TEST_BANNER_ID}
        size={BannerAdSize.ADAPTIVE_BANNER}
        onAdLoaded={() => setIsLoaded(true)}
        onAdFailedToLoad={() => setIsLoaded(false)}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />

      {!isLoaded ? (
        <Text style={styles.placeholder}>Cargando anuncios...</Text>
      ) : null}

      {initError ? (
        <Text style={styles.placeholder}>AdMob error: {initError}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  placeholder: {
    fontSize: 12,
    color: "#999",
  },
});
