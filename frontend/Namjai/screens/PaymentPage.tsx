import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

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
/** ---------- End Helpers ---------- */

type Params = {
  officerId: number;
  fullName: string;
  numberId?: string;
  billDate?: string;
  paymentStatus?: string;
  amountDue?: number;
};

const PaymentPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {
    officerId,
    fullName,
    numberId,
    billDate,
    paymentStatus,
    amountDue,
  } = (route.params || {}) as Params;

  const color = statusColor(paymentStatus);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backChip}>
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>Nam<Text style={styles.brandAccent}>Jai</Text></Text>
        <TouchableOpacity onPress={() => { /* reserved for future refresh */ }} style={{ width: 64 }} activeOpacity={0.9}>
          {/* spacer หรือปุ่มเพิ่มเติมในอนาคต */}
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ชำระค่าน้ำประปา</Text>
        <Text style={styles.subtitle}>เลือกช่องทางที่สะดวกเพื่อดำเนินการชำระ</Text>
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
          <Text style={styles.label}>หมายเลขผู้ใช้</Text>
          <Text style={styles.value}>{numberId || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>รอบบิล</Text>
          <Text style={styles.value}>
            {billDate ? new Date(billDate).toLocaleDateString('th-TH') : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ยอดที่ต้องชำระ</Text>
          <Text style={[styles.valueStrong, { color }]}>{paymentStatus === 'Green' ? 'ชำระเงินเสร็จสิ้น' : formatAmount(amountDue)}</Text>
        </View>

        {/* Officer ID (dev chip) */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaKey}>Officer ID</Text>
            <Text style={styles.metaValue}>{String(officerId ?? '-')}</Text>
          </View>
        </View>
      </View>

      {/* Payment Options */}
      <Text style={styles.sectionTitle}>เลือกช่องทางการชำระ</Text>
      <View style={styles.grid}>
        {/* QR Code */}
        <TouchableOpacity
          style={styles.gridCard}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('QRCodePage', {
              officerId,
              fullName,
              billDate,
              paymentStatus,
              amountDue,
            })
          }
        >
          <Text style={styles.emoji}>📷</Text>
          <Text style={styles.gridTitle}>QRCode</Text>
          <Text style={styles.gridHint}>สแกนและชำระทันที</Text>
        </TouchableOpacity>

        {/* Bank Transfer */}
        <TouchableOpacity
          style={styles.gridCard}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('BankTransferPage', {
              officerId,
              fullName,
              billDate,
              paymentStatus,
              amountDue,
            })
          }
        >
          <Text style={styles.emoji}>🏦</Text>
          <Text style={styles.gridTitle}>โอนผ่านธนาคาร</Text>
          <Text style={styles.gridHint}>ดูเลขบัญชี/อัปโหลดสลิป</Text>
        </TouchableOpacity>

        {/* Cash */}
        <TouchableOpacity
          style={styles.gridCard}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('CashPaymentPage', {
              numberId,
              fullName,
              billDate,
              paymentStatus,
              amountDue,
            })
          }
        >
          <Text style={styles.emoji}>💵</Text>
          <Text style={styles.gridTitle}>ชำระเงินสด</Text>
          <Text style={styles.gridHint}>จ่ายผ่านเจ้าหน้าที่</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default PaymentPage;

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

  // Title
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A' },
  subtitle: { fontSize: 12, color: '#4E6E90', marginTop: 4 },

  // Card
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

  metaRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  metaChip: {
    backgroundColor: '#F4FAFF', borderWidth: 1, borderColor: '#C7DFEF',
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, flexDirection: 'row', gap: 8,
  },
  metaKey: { color: '#4E6E90', fontWeight: '700', fontSize: 12 },
  metaValue: { color: '#0D2A4A', fontWeight: '900', fontSize: 12 },

  // Grid
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0D2A4A', marginTop: 8, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: {
    width: '48%', backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0D2A4A', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#E1EEF7',
  },
  emoji: { fontSize: 34 },
  gridTitle: { marginTop: 8, fontSize: 14, fontWeight: '900', color: '#0D2A4A' },
  gridHint: { fontSize: 11, color: '#4E6E90', marginTop: 2 },
});
