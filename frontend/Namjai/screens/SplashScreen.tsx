// src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Animated, Easing } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // ทำ animation ให้ fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // รอ 2.5 วิแล้วไปหน้า Home
    const timer = setTimeout(() => {
      navigation.replace('HomeScreen');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0288D1" />
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={styles.brand}>
          Nam<Text style={styles.brandAccent}>Jai</Text>
        </Text>
        <Text style={styles.subtitle}>ชุมชนแห่งน้ำใจ ❤️</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 30 }} />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0288D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  brandAccent: {
    color: '#FFEB3B',
  },
  subtitle: {
    color: '#E1F5FE',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
});
