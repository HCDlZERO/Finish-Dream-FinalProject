import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  RefreshControl, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLatestBillById } from '../services/apiService';
import { useNavigation } from '@react-navigation/native';

/** ---------- Helpers ---------- */
// Thai initials: ข้ามสระนำ เ แ โ ใ ไ และเครื่องหมายประกอบ จนเจอพยัญชนะตัวแรก
const THAI_LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);
const THAI_COMBINING_MARKS = new Set([
  'ะ', 'ั', 'า', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู',
  '็', '่', '้', '๊', '๋', '์', 'ฺ', 'ํ', '๎'
]);
const NON_LETTER = new Set([' ', '-', '_', '.', ',', '(', ')', '[', ']', '{', '}', '/', '\\', 'ฯ', 'ๆ', '฿', '"', '\'', '・']);
const isThaiConsonant = (ch: string) => {
  if (ch < 'ก' || ch > 'ฮ') return false;
  if (THAI_COMBINING_MARKS.has(ch)) return false;
  if (THAI_LEADING_VOWELS.has(ch)) return false;
  return true;
};
const isAsciiLetterOrDigit = (ch: string) => /[A-Za-z0-9]/.test(ch);
const getInitialFromName = (name?: string) => {
  if (!name) return '';
  const s = name.normalize('NFC');
  for (const ch of s) {
    if (NON_LETTER.has(ch)) continue;
    if (THAI_COMBINING_MARKS.has(ch)) continue;
    if (THAI_LEADING_VOWELS.has(ch)) continue;
    if (isThaiConsonant(ch)) return ch;
    if (isAsciiLetterOrDigit(ch)) return ch.toUpperCase();
  }
  return '';
};
const makeInitials = (firstName?: string, lastName?: string) => {
  const a = getInitialFromName(firstName);
  const b = getInitialFromName(lastName);
  const initials = `${a}${b}`.trim();
  return initials.length ? initials : '??';
};

const formatAmount = (num?: number | null) =>
  (num ?? null) === null ? '...' : `${Number(num).toLocaleString('th-TH')} บาท`;

const statusColor = (paymentStatus?: string) => {
  switch (paymentStatus) {
    case 'Green':  return '#2E7D32';
    case 'Gray':   return '#90A4AE';
    case 'Yellow': return '#FBC02D';
    case 'Orange': return '#FB8C00';
    case 'Red':    return '#D32F2F';
    default:       return '#607D8B';
  }
};
/** ---------- End Helpers ---------- */

const HomeMemberPage = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [officerId, setOfficerId] = useState<number | null>(null);
  const [collectionOfficerId, setCollectionOfficerId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [numberId, setNumberId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>(''); // ✅
  const [billDate, setBillDate] = useState<string>(''); // ✅

  const initials = useMemo(() => makeInitials(firstName, lastName), [firstName, lastName]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          if (userData.officerId) setOfficerId(userData.officerId);
          if (userData.numberId) setNumberId(userData.numberId);
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      }
    };
    loadUserData();
  }, []);

  const loadBill = useCallback(async () => {
    if (officerId === null) return;
    try {
      setLoading(true);
      const latestBill = await fetchLatestBillById(officerId);
      if (latestBill) {
        if (latestBill.amount_due != null) setAmountDue(latestBill.amount_due);
        if (latestBill.first_name) setFirstName(latestBill.first_name);
        if (latestBill.last_name) setLastName(latestBill.last_name);
        if (latestBill.collection_officer_id != null) setCollectionOfficerId(latestBill.collection_officer_id);
        if (latestBill.number_id) setNumberId(latestBill.number_id);
        if (latestBill.payment_status) setPaymentStatus(latestBill.payment_status);
        if (latestBill.bill_date) setBillDate(latestBill.bill_date);
      }
    } catch (error) {
      console.error('Failed to fetch latest bill', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลบิลล่าสุดได้');
    } finally {
      setLoading(false);
    }
  }, [officerId]);

  useEffect(() => {
    loadBill();
  }, [loadBill]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadBill(); }
    finally { setRefreshing(false); }
  }, [loadBill]);

  const getDueDateMessage = () => {
    if (!billDate) return '';
    const date = new Date(billDate);
    const month = date.getMonth() + 2;
    const thaiMonths = [
      '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const displayMonth = thaiMonths[month > 12 ? 1 : month];
    const year = date.getFullYear() + (month > 12 ? 1 : 0) + 543;

    switch (paymentStatus) {
      case 'Gray':
      case 'Yellow':
        return `โปรดชำระก่อนวันที่ 7 ${displayMonth} ${year}`;
      case 'Orange':
        return `โปรดชำระก่อนวันที่ 14 ${displayMonth} ${year}`;
      case 'Red':
        return 'โปรดชำระก่อนเจ้าหน้าที่ตัดท่อน้ำ';
      case 'Green':
        return 'ชำระเงินเสร็จสิ้น';
      default:
        return '';
    }
  };

  const goToUserProfile = () => {
    if (!numberId) {
      Alert.alert('ข้อมูลไม่ครบ', 'ไม่พบหมายเลขผู้ใช้งาน');
      return;
    }
    navigation.navigate('UserProfilePage', { numberId });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={{ marginTop:10, color:'#4E6E90' }}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  const color = statusColor(paymentStatus);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Nam<Text style={styles.brandAccent}>Jai</Text></Text>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.85} style={styles.refreshChip}>
          <Text style={styles.refreshText}>รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome */}
      <View style={styles.welcomeRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex:1 }}>
          <Text style={styles.welcomeName}>
            {firstName || lastName ? `${firstName} ${lastName}` : 'ลูกบ้าน'}
          </Text>
          <Text style={styles.welcomeSub}>หมายเลขผู้ใช้: {numberId || '-'}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: color }]}>
          <Text style={styles.statusText}>{paymentStatus || 'Unknown'}</Text>
        </View>
      </View>

      {/* Bill Summary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>ยอดน้ำประปาล่าสุด</Text>
          <Text style={[styles.amountText, { color }]}>{paymentStatus === 'Green' ? 'ชำระเงินเสร็จสิ้น' : formatAmount(amountDue)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>รอบบิล</Text>
          <Text style={styles.value}>
            {billDate ? new Date(billDate).toLocaleDateString('th-TH') : '-'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>กำหนดชำระ</Text>
          <Text style={styles.value}>{getDueDateMessage() || '-'}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>เมนูการใช้งาน</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('PaymentPage', {
                officerId: collectionOfficerId,
                fullName: `${firstName} ${lastName}`,
                billDate,
                paymentStatus,
                amountDue,
              });
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.emoji}>💵</Text>
          <Text style={styles.gridTitle}>ชำระเงิน</Text>
          <Text style={styles.gridHint}>วิธการชำระ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => {
            if (numberId)
              navigation.navigate('HistoryPage', {
                numberId,
                fullName: `${firstName} ${lastName}`,
              });
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.emoji}>📜</Text>
          <Text style={styles.gridTitle}>ประวัติ</Text>
          <Text style={styles.gridHint}>ดูบิลย้อนหลัง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={goToUserProfile} activeOpacity={0.9}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.gridTitle}>บัญชีผู้ใช้</Text>
          <Text style={styles.gridHint}>ข้อมูลส่วนตัว</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('ConfirmPaymentPage', {
                officerId: collectionOfficerId,
                firstName,
                lastName,
                amountDue,
              });
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.gridTitle}>ยืนยันชำระเงิน</Text>
          <Text style={styles.gridHint}>แจ้งยืนยันการชำระ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('ContactOfficerPage', {
                officerId: collectionOfficerId,
              });
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.emoji}>☎️</Text>
          <Text style={styles.gridTitle}>ติดต่อ</Text>
          <Text style={styles.gridHint}>ติดต่อเจ้าหน้าที่</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default HomeMemberPage;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E9F4FF', paddingVertical: 16, paddingHorizontal: 16 },

  // Header
  headerRow: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  brand: { fontSize: 28, fontWeight: '900', letterSpacing: 1, color: '#0D2A4A' },
  brandAccent: { color: '#FF4081' },
  refreshChip: {
    backgroundColor: '#0288D1', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    shadowColor: '#0288D1', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 4,
  },
  refreshText: { color: '#fff', fontWeight: '700' },

  // Welcome
  welcomeRow: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: '#F0F7FF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CDE2F2',
  },
  avatarText: { fontWeight: '900', fontSize: 20, color: '#0D2A4A' },
  welcomeName: { fontSize: 18, fontWeight: '900', color: '#0D2A4A' },
  welcomeSub: { fontSize: 12, color: '#4E6E90', marginTop: 2 },
  statusChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 11 },

  // Card
  card: {
    width: '100%', backgroundColor: '#ffffff', borderRadius: 18, padding: 16,
    shadowColor: '#0D2A4A', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#E1EEF7', marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0D2A4A' },
  amountText: { fontSize: 20, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#E6F1FA', marginVertical: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#4E6E90', fontWeight: '700', fontSize: 12 },
  value: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },

  // Section
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0D2A4A', marginTop: 6, marginBottom: 10 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: {
    width: '48%', backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0D2A4A', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#E1EEF7',
  },
  emoji: { fontSize: 34 },
  gridTitle: { marginTop: 8, fontSize: 14, fontWeight: '900', color: '#0D2A4A' },
  gridHint: { fontSize: 11, color: '#4E6E90', marginTop: 2 },
});
