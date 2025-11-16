import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchBankInfoByOfficerId } from '../services/apiService';

/** ---------- Helpers ---------- */
const formatAmount = (num?: number) =>
  num === undefined || num === null ? '-' : `${Number(num).toLocaleString('th-TH')} บาท`;

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

const getDueDateMessage = (billDate?: string, paymentStatus?: string) => {
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
/** ---------- End Helpers ---------- */

type Params = {
  officerId: number;
  fullName: string;
  billDate: string;
  paymentStatus: string;
  amountDue: number;
};

const BankTransferPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {
    officerId, fullName, billDate, paymentStatus, amountDue,
  } = (route.params || {}) as Params;

  const [bankName, setBankName] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const color = statusColor(paymentStatus);

  const loadBankInfo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBankInfoByOfficerId(officerId);
      if (data && data.data) {
        setBankName(data.data.bank);
        setBankAccountId(data.data.bank_id);
        setFirstName(data.data.first_name);
        setLastName(data.data.last_name);
      } else {
        setBankName('');
        setBankAccountId('');
        setFirstName('');
        setLastName('');
      }
    } catch (error: any) {
      console.error('Failed to fetch Bank Info:', error);
      Alert.alert('เกิดข้อผิดพลาด', error?.message?.toString?.() || 'ไม่สามารถดึงข้อมูลบัญชีธนาคารได้');
    } finally {
      setLoading(false);
    }
  }, [officerId]);

  useEffect(() => { loadBankInfo(); }, [loadBankInfo]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadBankInfo(); }
    finally { setRefreshing(false); }
  }, [loadBankInfo]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backChip}>
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>Nam<Text style={styles.brandAccent}>Jai</Text></Text>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.85} style={styles.refreshChip}>
          <Text style={styles.refreshText}>รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>โอนผ่านธนาคาร</Text>
        <Text style={styles.subtitle}>ดูข้อมูลบัญชีสำหรับโอนและทำรายการให้เสร็จสมบูรณ์</Text>
      </View>

      {/* Bill Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>สรุปบิลล่าสุด</Text>
          <View style={[styles.statusChip, { backgroundColor: color }]}>
            <Text style={styles.statusText}>{paymentStatus || 'Unknown'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>ชื่อผู้ใช้</Text>
          <Text style={styles.value}>{fullName || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>รอบบิล</Text>
          <Text style={styles.value}>
            {billDate ? new Date(billDate).toLocaleDateString('th-TH') : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ยอดที่ต้องชำระ</Text>
          <Text style={[styles.valueStrong, { color }]}>
            {paymentStatus === 'Green' ? 'ชำระเงินเสร็จสิ้น' : formatAmount(amountDue)}
          </Text>
        </View>

        {!!getDueDateMessage(billDate, paymentStatus) && (
          <View style={styles.dueWrap}>
            <Text style={styles.dueText}>{getDueDateMessage(billDate, paymentStatus)}</Text>
          </View>
        )}
      </View>

      {/* Bank Info */}
      <View style={styles.bankCard}>
        <Text style={styles.bankTitle}>บัญชีสำหรับโอน</Text>

        {loading ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator size="large" color="#0288D1" />
          </View>
        ) : (
          <>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>ธนาคาร</Text>
              <Text style={styles.bankValue}>{bankName || '-'}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>ชื่อบัญชี</Text>
              <Text style={styles.bankValue}>{`${firstName || '-'} ${lastName || ''}`.trim()}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>เลขบัญชี</Text>
              <Text style={styles.bankValue}>{bankAccountId || '-'}</Text>
            </View>

            <View style={styles.hintWrap}>
              <Text style={styles.hintText}>* โอนแล้วโปรดอัปโหลดหลักฐานในเมนู “ยืนยันชำระเงิน”</Text>
            </View>
          </>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default BankTransferPage;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E9F4FF', paddingVertical: 16, paddingHorizontal: 16 },

  // Header
  headerRow: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  backChip: {
    backgroundColor: '#E1EEF7', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 999, minWidth: 64, alignItems: 'center',
  },
  backText: { color: '#0D2A4A', fontWeight: '700' },
  brand: { fontSize: 28, fontWeight: '900', letterSpacing: 1, color: '#0D2A4A' },
  brandAccent: { color: '#FF4081' },
  refreshChip: {
    backgroundColor: '#0288D1', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    shadowColor: '#0288D1', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 4,
  },
  refreshText: { color: '#fff', fontWeight: '700' },

  // Title
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A' },
  subtitle: { fontSize: 12, color: '#4E6E90', marginTop: 4 },

  // Bill Card
  card: {
    width: '100%', backgroundColor: '#ffffff', borderRadius: 18, padding: 16,
    shadowColor: '#0D2A4A', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#E1EEF7', marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0D2A4A' },
  statusChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  divider: { height: 1, backgroundColor: '#E6F1FA', marginVertical: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#4E6E90', fontWeight: '700', fontSize: 12 },
  value: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },
  valueStrong: { fontSize: 16, fontWeight: '900' },

  dueWrap: {
    marginTop: 6, backgroundColor: '#F7FBFF', borderWidth: 1, borderColor: '#D7E8F5',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10,
  },
  dueText: { color: '#0D2A4A', fontWeight: '700', fontSize: 12 },

  // Bank Card
  bankCard: {
    width: '100%', backgroundColor: '#ffffff', borderRadius: 18, padding: 16,
    shadowColor: '#0D2A4A', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#E1EEF7',
  },
  bankTitle: { fontSize: 16, fontWeight: '900', color: '#0D2A4A', marginBottom: 8 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bankLabel: { color: '#4E6E90', fontWeight: '700', fontSize: 12 },
  bankValue: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },

  hintWrap: {
    marginTop: 6, backgroundColor: '#F7FBFF', borderWidth: 1, borderColor: '#D7E8F5',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10,
  },
  hintText: { color: '#0D2A4A', fontWeight: '700', fontSize: 12 },
});
