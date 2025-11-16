import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateBillStatus } from '../services/apiService';

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
  numberId: string;
  fullName: string;
  amountDue: number;
  billDate: string;
  paymentStatus: string;
};

const CashPaymentPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { numberId, fullName, amountDue, billDate, paymentStatus } = (route.params || {}) as Params;

  const color = useMemo(() => statusColor(paymentStatus), [paymentStatus]);

  // mock label เดิมตามโค้ดต้นฉบับ
  const now = new Date();
  const dateLabel = `6/${now.getMonth() + 1}/${now.getFullYear()}`;

  const [confirm, setConfirm] = useState<{visible:boolean; slot?: 1 | 2; label?: string}>({ visible:false });

  const handleConfirmSend = async () => {
    const slot = confirm.slot;
    if (!slot) return setConfirm({ visible:false });
    try {
      await updateBillStatus(numberId, 'Yellow', slot);
      setConfirm({ visible:false });
      Alert.alert('สำเร็จ', 'ส่งข้อมูลเรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Update Error:', error);
      setConfirm({ visible:false });
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถส่งข้อมูลได้');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backChip}>
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>
          Nam<Text style={styles.brandAccent}>Jai</Text>
        </Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>นัดชำระเงินสดกับเจ้าหน้าที่</Text>
        <Text style={styles.subtitle}>เลือกช่วงเวลาที่สะดวกเพื่อให้เจ้าหน้าที่รับชำระ</Text>
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
          <Text style={styles.label}>ยอดที่ต้องชำระ</Text>
          <Text style={[styles.valueStrong, { color }]}>
            {paymentStatus === 'Green' ? 'ชำระเงินเสร็จสิ้น' : formatAmount(amountDue)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>กำหนดชำระ</Text>
          <Text style={styles.value}>{getDueDateMessage(billDate, paymentStatus) || '-'}</Text>
        </View>
      </View>

      {/* Select Slot */}
      <Text style={styles.sectionTitle}>เลือกเวลานัดหมาย</Text>
      <View style={styles.slotGrid}>
        <TouchableOpacity
          style={styles.slotCard}
          activeOpacity={0.9}
          onPress={() => setConfirm({ visible:true, slot:1, label:`${dateLabel} เวลา 11.00 น.` })}
        >
          <Text style={styles.slotEmoji}>🕚</Text>
          <Text style={styles.slotLabel}>{dateLabel} เวลา 11.00 น.</Text>
          <Text style={styles.slotHint}>ช่วงสาย </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.slotCard}
          activeOpacity={0.9}
          onPress={() => setConfirm({ visible:true, slot:2, label:`${dateLabel} เวลา 17.00 น.` })}
        >
          <Text style={styles.slotEmoji}>🕔</Text>
          <Text style={styles.slotLabel}>{dateLabel} เวลา 17.00 น.</Text>
          <Text style={styles.slotHint}>ช่วงเย็น </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />

      {/* Confirm Modal */}
      <Modal transparent animationType="fade" visible={confirm.visible} onRequestClose={() => setConfirm({ visible:false })}>
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>ยืนยันนัดหมาย</Text>
            <Text style={styles.toastMsg}>ต้องการยืนยันการนัดชำระเงินสดที่ {confirm.label} ใช่หรือไม่?</Text>
            <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10 }}>
              <TouchableOpacity onPress={() => setConfirm({ visible:false })} style={[styles.toastBtn, { backgroundColor:'#9e9e9e' }]}>
                <Text style={styles.toastBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmSend} style={[styles.toastBtn, { backgroundColor:'#0288D1' }]}>
                <Text style={styles.toastBtnText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default CashPaymentPage;

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

  // Card (Bill summary)
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

  // Section
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0D2A4A', marginTop: 6, marginBottom: 10 },

  // Slots
  slotGrid: { flexDirection: 'row', gap: 12 },
  slotCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0D2A4A', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#E1EEF7',
  },
  slotEmoji: { fontSize: 30 },
  slotLabel: { marginTop: 8, fontSize: 14, fontWeight: '900', color: '#0D2A4A', textAlign: 'center' },
  slotHint: { fontSize: 11, color: '#4E6E90', marginTop: 2, textAlign: 'center' },

  // Modal / Toast
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'86%', backgroundColor:'#fff', borderRadius:18, padding:18, borderWidth:1, borderColor:'#E1EEF7' },
  toastTitle:{ fontSize:18, fontWeight:'900', color:'#0D2A4A', marginBottom:6 },
  toastMsg:{ fontSize:14, color:'#4E6E90', marginBottom:14 },
  toastBtn:{ paddingVertical:10, paddingHorizontal:16, borderRadius:12 },
  toastBtnText:{ color:'#fff', fontWeight:'800' },
});
