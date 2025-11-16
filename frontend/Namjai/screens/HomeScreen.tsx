import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Animated, Easing } from 'react-native';

const HomeScreen = ({ navigation }: any) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* จุดกลมตกแต่ง */}
      <View style={[styles.circle, { top: -80, left: -60, width: 240, height: 240 }]} />
      <View style={[styles.circle, { bottom: -90, right: -80, width: 280, height: 280, opacity: 0.35 }]} />

      {/* แบรนด์ */}
      <SafeAreaView style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.brand}>Nam</Text>
          <Text style={[styles.brand, styles.brandAccent]}>Jai</Text>
          <Animated.Text style={[styles.heart, { transform: [{ scale: pulseAnim }] }]}>❤️</Animated.Text>
        </View>
      </SafeAreaView>

      {/* เนื้อหากลางจอ */}
      <View style={styles.content}>
        <View style={styles.titleWrap}>
          <Text style={styles.subtitle}>แอปสำหรับชุมชน • จ่ายค่าน้ำง่ายขึ้น</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#0288D1' }]}
            onPress={() => navigation.navigate('RegisterMember')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>สมัครใช้งาน (Member)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#7B1FA2' }]}
            onPress={() => navigation.navigate('RegisterOfficer')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>สมัครใช้งาน (Officer)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('LoginScreen')}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ฟุตเตอร์ */}
      <Text style={styles.footerNote}>เวอร์ชันทดลอง • โครงงานปี 4</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F4FF',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // ทำให้ title+buttons อยู่กลางจอ
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
  },

  circle: {
    position: 'absolute',
    backgroundColor: '#0288D1',
    opacity: 0.15,
    borderRadius: 9999,
  },
  headerRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 200,
  },
  brand: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0D2A4A',
  },
  brandAccent: { color: '#FF4081' },
  heart: { fontSize: 28, marginLeft: 6 },

  titleWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  subtitle: {
    color: '#4E6E90',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },

  actions: {
    width: '100%',
    gap: 14,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#F4FAFF',
    borderWidth: 1,
    borderColor: '#C7DFEF',
  },
  secondaryText: {
    color: '#0D2A4A',
    fontWeight: '900',
    fontSize: 16,
  },
  footerNote: {
    position: 'absolute',
    bottom: 18,
    color: '#7FA3C1',
    fontSize: 12,
    fontWeight: '700',
  },
});
