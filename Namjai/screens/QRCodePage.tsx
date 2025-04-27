import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchQrCodeByOfficerId } from '../services/apiService';

const QRCodePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { officerId, fullName } = route.params as { officerId: number; fullName: string };

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadQrCode = async () => {
      try {
        const data = await fetchQrCodeByOfficerId(officerId);
        if (data && data.data) {  // ✅ ตรงนี้คือการแก้ไขหลัก
          setQrCodeUrl(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch QR Code:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQrCode();
  }, [officerId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfoRow}>
        <Text style={styles.userInfo}>{fullName || ''}</Text>
        <Text style={styles.userInfo}>ลูกบ้าน</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBoxContainer}>
        <View style={styles.infoBoxLeft}>
          <Text style={styles.infoBoxTitle}>ยอดค่าใช้จ่ายน้ำป่า</Text>
        </View>
        <View style={styles.infoBoxRight}>
          <Text style={styles.infoBoxAmount}>160 บาท</Text>
        </View>
      </View>
      <Text style={styles.dueDateText}>โปรดชำระก่อนวันที่ 7 พฤศจิกายน 2567</Text>

      {/* QRCode Display */}
      <View style={styles.qrContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0288D1" />
        ) : qrCodeUrl ? (
          <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
        ) : (
          <Text style={styles.errorText}>ไม่พบ QR Code</Text>
        )}
      </View>

      <Text style={styles.qrLabel}>QRCode</Text>

      <TouchableOpacity style={styles.downloadButton}>
        <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E1F5FE', paddingBottom: 30 },
  header: {
    backgroundColor: '#0288D1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  logoHighlight: { color: '#FF4081' },
  menuIcon: { fontSize: 24, color: 'white' },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0288D1',
    paddingVertical: 10,
  },
  userInfo: { color: 'white', fontSize: 16 },
  infoBoxContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  infoBoxLeft: {
    flex: 1,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoBoxRight: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoBoxTitle: { fontSize: 16, color: '#0288D1', fontWeight: 'bold' },
  infoBoxAmount: { fontSize: 22, fontWeight: 'bold', color: '#0288D1' },
  dueDateText: { textAlign: 'center', marginTop: 5, color: '#0288D1', fontSize: 14 },
  qrContainer: {
    backgroundColor: '#0288D1',
    marginHorizontal: 50,
    marginTop: 30,
    height: 250,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  qrLabel: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 18,
    color: '#0288D1',
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#0288D1',
    marginTop: 20,
    marginHorizontal: 100,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default QRCodePage;
