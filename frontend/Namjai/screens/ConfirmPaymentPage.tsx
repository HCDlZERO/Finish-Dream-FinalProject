import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Image, PermissionsAndroid, Platform, SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { submitConfirmPayment } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

const ConfirmPaymentPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { officerId, firstName, lastName, amountDue } = route.params as {
    officerId: number; firstName: string; lastName: string; amountDue: number;
  };

  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('');
  const [imageBase64Raw, setImageBase64Raw] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ visible: boolean; message?: string }>({ visible: false });

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setConfirmDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setConfirmTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const perm = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const granted = await PermissionsAndroid.request(perm, {
        title: 'Permission Request',
        message: 'แอปนี้ต้องการเข้าถึงคลังรูปภาพของคุณ',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e: any) {
      setPopup({ visible: true, message: e?.message?.toString?.() || 'ไม่สามารถขอสิทธิ์เข้าถึงรูปภาพได้' });
      return false;
    }
  };

  const pickImage = useCallback(async () => {
    if (!(await requestStoragePermission())) {
      return setPopup({ visible: true, message: 'กรุณาอนุญาตการเข้าถึงรูปภาพเพื่ออัปโหลดหลักฐาน' });
    }
    launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.75 }, (res: any) => {
      if (res?.errorMessage) return setPopup({ visible: true, message: `เลือกรูปไม่ได้: ${res.errorMessage}` });
      const b64 = res?.assets?.[0]?.base64;
      if (!b64) return;
      setImageBase64Raw(b64);
    });
  }, []);

  const validate = () => {
    if (!imageBase64Raw) return 'กรุณาอัปโหลดรูปภาพยืนยันการชำระเงิน';
    if (!confirmDate || !confirmTime) return 'ข้อมูลวันที่/เวลาไม่ครบ';
    if (!firstName?.trim() || !lastName?.trim()) return 'ข้อมูลชื่อผู้ชำระไม่ครบ';
    if (amountDue == null) return 'จำนวนเงินไม่ถูกต้อง';
    return '';
  };

  const handleSubmit = async () => {
    const msg = validate(); if (msg) return setPopup({ visible: true, message: msg });
    const payload = {
      firstName, lastName, amountDue,
      confirmDate, confirmTime,
      officerName: String(officerId),
      confirmImage: `data:image/jpeg;base64,${imageBase64Raw}`,
    };
    try {
      setLoading(true);
      await submitConfirmPayment(payload);
      setPopup({ visible: true, message: 'บันทึกการยืนยันการชำระเงินเรียบร้อยแล้ว' });
      navigation.goBack();
    } catch (e: any) {
      setPopup({ visible: true, message: e?.message?.toString?.() || 'ไม่สามารถส่งข้อมูลได้ โปรดลองใหม่' });
    } finally {
      setLoading(false);
    }
  };

  const dateDisplay = confirmDate ? confirmDate.split('-').reverse().join('/') : '-';
  const timeDisplay = confirmTime ? `${confirmTime} น.` : '-';

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <SafeAreaView style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backChip}>
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>Nam<Text style={styles.brandAccent}>Jai</Text></Text>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.uploadChip}>
          <Text style={styles.uploadText}>เลือกรูป</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Title + meta */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ยืนยันการชำระเงิน</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaKey}>เจ้าหน้าที่</Text>
            <Text style={styles.metaValue}>{officerId}</Text>
          </View>
          <View style={[styles.amountChip]}>
            <Text style={styles.amountText}>{amountDue?.toLocaleString?.() ?? amountDue} บาท</Text>
          </View>
        </View>
      </View>

      {/* Upload Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>หลักฐานการโอน</Text>
        <TouchableOpacity style={styles.imageBox} onPress={pickImage} disabled={loading} activeOpacity={0.9}>
          {imageBase64Raw ? (
            <>
              <Image source={{ uri: `data:image/jpeg;base64,${imageBase64Raw}` }} style={styles.image} resizeMode="contain" />
              <View style={styles.imageOverlay}>
                <Text style={styles.overlayText}>เปลี่ยนรูป</Text>
              </View>
            </>
          ) : (
            <View style={styles.placeholderWrap}>
              <Text style={styles.placeholderIcon}>🧾</Text>
              <Text style={styles.placeholderText}>แตะเพื่ออัปโหลดสลิป</Text>
              <Text style={styles.placeholderHint}>รองรับ JPG/PNG • แนะนำให้เห็นวัน‑เวลา/ยอดชัดเจน</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>รายละเอียดการชำระ</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>ชื่อผู้ชำระ</Text>
          <Text style={styles.rowValue}>{firstName} {lastName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>วันที่</Text>
          <Text style={styles.rowValue}>{dateDisplay}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>เวลา</Text>
          <Text style={styles.rowValue}>{timeDisplay}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>ยอดเงิน</Text>
          <Text style={styles.rowValue}>{amountDue?.toLocaleString?.() ?? amountDue} บาท</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: .6 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>ยืนยัน</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>ยกเลิก</Text>
        </TouchableOpacity>
      </View>

      <ErrorPopup
        visible={popup.visible}
        message={popup.message}
        onClose={() => setPopup({ visible: false, message: '' })}
        title="แจ้งเตือน"
      />
    </ScrollView>
  );
};

export default ConfirmPaymentPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E9F4FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: { fontSize: 28, fontWeight: '900', letterSpacing: 1, color: '#0D2A4A' },
  brandAccent: { color: '#FF4081' },
  backChip: {
    backgroundColor: '#E1EEF7', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 999, minWidth: 64, alignItems: 'center'
  },
  backText: { color: '#0D2A4A', fontWeight: '700' },
  uploadChip: {
    backgroundColor: '#0288D1',
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    shadowColor: '#0288D1', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 4
  },
  uploadText: { color: '#fff', fontWeight: '700' },

  // Title & Meta
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
  metaChip: {
    backgroundColor: '#F4FAFF', borderWidth: 1, borderColor: '#C7DFEF',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'baseline'
  },
  metaKey: { color: '#4E6E90', fontWeight: '700', fontSize: 12 },
  metaValue: { color: '#0D2A4A', fontWeight: '900', fontSize: 14 },
  amountChip: {
    backgroundColor: '#0D2A4A',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12,
  },
  amountText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1EEF7',
    marginBottom: 12,
  },

  // Upload
  imageBox: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7DFEF',
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderWrap: { alignItems: 'center', gap: 6 },
  placeholderIcon: { fontSize: 28 },
  placeholderText: { fontWeight: '900', color: '#0D2A4A' },
  placeholderHint: { fontSize: 12, color: '#4E6E90' },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', right: 10, bottom: 10,
    backgroundColor: '#0288D1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999,
    shadowColor: '#0288D1', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 3
  },
  overlayText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  // Rows
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0D2A4A', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  rowLabel: { color: '#4E6E90', fontWeight: '700', fontSize: 12, minWidth: 110 },
  rowValue: { color: '#0D2A4A', fontWeight: '700', fontSize: 14, flex: 1, textAlign: 'right' },

  // Actions
  actionsRow: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 6 },
  primaryBtn: {
    flex: 1, backgroundColor: '#0288D1', paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    shadowColor: '#0288D1', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 4
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },
  secondaryBtn: {
    paddingVertical: 14, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: '#9BC6E3', backgroundColor: '#F4FAFF'
  },
  secondaryText: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },
});
