import Constants from "expo-constants";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

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
  const productionBannerUnitId = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID;
  const googleMobileAds = useMemo(
    () => (productionBannerUnitId ? loadGoogleMobileAdsModule() : null),
    [productionBannerUnitId]
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!googleMobileAds) return;

    const moduleAny = googleMobileAds as any;
    const mobileAds = moduleAny.default ?? moduleAny;

    try {
      mobileAds()
        .initialize()
        .catch((error: unknown) => {
          setInitError(error instanceof Error ? error.message : String(error));
        });
    } catch (error: unknown) {
      setInitError(error instanceof Error ? error.message : String(error));
    }
  }, [googleMobileAds]);

  if (!productionBannerUnitId) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>
          Anuncios desactivados (falta EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID).
        </Text>
      </View>
    );
  }

  if (!googleMobileAds) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>
          Anuncios no disponibles (requiere build nativo con el m\u00f3dulo instalado).
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
        unitId={productionBannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER ?? BannerAdSize.ADAPTIVE_BANNER}
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
