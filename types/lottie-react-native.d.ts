declare module 'lottie-react-native' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  interface LottieViewProps {
    source: any;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;
    style?: StyleProp<ViewStyle>;
    onAnimationFinish?: () => void;
    onAnimationFailure?: (error: Error) => void;
    resizeMode?: 'cover' | 'contain' | 'center';
    imageAssetsFolder?: string;
    renderMode?: 'AUTOMATIC' | 'HARDWARE' | 'SOFTWARE';
    cacheComposition?: boolean;
    enableMergePathsAndroidForKitKatAndAbove?: boolean;
    useNativeLooping?: boolean;
  }

  export default class LottieView extends Component<LottieViewProps> {
    play(startFrame?: number, endFrame?: number): void;
    pause(): void;
    resume(): void;
    reset(): void;
  }
}
