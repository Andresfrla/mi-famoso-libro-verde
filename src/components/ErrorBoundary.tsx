import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ocurri\u00f3 un error</Text>
          {this.state.message ? (
            <Text style={styles.message} numberOfLines={3}>
              {this.state.message}
            </Text>
          ) : null}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    color: '#666',
  },
  message: {
    marginTop: 6,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
});

