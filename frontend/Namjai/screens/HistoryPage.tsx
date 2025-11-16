import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
  ActivityIndicator, Alert, RefreshControl, TextInput
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchBillHistory, fetchBillDetail } from '../services/apiService';

/** ---------- Helpers ---------- */
// ทำให้สถานะเป็นรูปแบบเดียวกันก่อน (จากลิสต์/ดีเทล/ตัวพิมพ์เล็ก/คำอื่นๆ)
const canonicalStatus = (raw?: string): 'Gray'|'Green'|'Yellow'|'Orange'|'Red'|undefined => {
  if (!raw) return undefined;
  const s = String(raw).trim().toLowerCase();

  // กลุ่ม “ชำระแล้ว”
  if (['green', 'paid', 'success', 'completed', 'done', 'paid_out'].includes(s)) return 'Green';

  // กลุ่ม “เงินสด”
  if (['yellow', 'cash', 'cash_paid'].includes(s)) return 'Yellow';

  // กลุ่ม “ยังไม่ได้ชำระ”
  if (['gray', 'unpaid', 'pending', 'new'].includes(s)) return 'Gray';

  // กลุ่ม “ค้างชำระ/เตือนขั้นต้น”
  if (['orange', 'overdue1', 'overdue_1', 'warning'].includes(s)) return 'Orange';

  // กลุ่ม “เกินกำหนดหนัก”
  if (['red', 'overdue', 'delinquent', 'cutoff'].includes(s)) return 'Red';

  // ถ้าเป็นรูปแบบ Green/Yellow/... อยู่แล้ว
  if (['Gray','Green','Yellow','Orange','Red'].includes(raw as any)) return raw as any;

  return undefined;
};

const statusText = (raw?: string) => {
  const st = canonicalStatus(raw);
  switch (st) {
    case 'Gray':   return 'ยังไม่ได้ชำระเงิน';
    case 'Green':  return 'ชำระแล้ว';
    case 'Yellow': return 'เงินสด';
    case 'Orange': return 'ค้างชำระ';
    case 'Red':    return 'เกินกำหนด';
    default:       return 'ไม่ทราบสถานะ';
  }
};
const statusColor = (raw?: string) => {
  const st = canonicalStatus(raw);
  switch (st) {
    case 'Green':  return '#2E7D32';
    case 'Gray':   return '#90A4AE';
    case 'Yellow': return '#FBC02D';
    case 'Orange': return '#FB8C00';
    case 'Red':    return '#D32F2F';
    default:       return '#607D8B';
  }
};
const formatTHDate = (iso?: string) => {
  try {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '-'; }
};
const formatAmount = (num?: number) =>
  num === undefined || num === null ? '-' : `${Number(num).toLocaleString('th-TH')} บาท`;
/** ---------- End Helpers ---------- */

type RouteParams = { numberId: string; fullName: string };

const HistoryPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { numberId, fullName } = (route.params || {}) as RouteParams;

  const [billList, setBillList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [billDetail, setBillDetail] = useState<any>(null);

  const [keyword, setKeyword] = useState('');

  const loadBillHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchBillHistory(numberId);
      // canonicalize status ตั้งแต่รับเข้ามา
      const data = (Array.isArray(result) ? result : []).map((b) => ({
        ...b,
        payment_status: canonicalStatus(b?.payment_status) ?? b?.payment_status ?? '',
      }));
      setBillList(data);
    } catch (error) {
      console.error('Error loading bill history:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดประวัติบิลได้');
    } finally {
      setLoading(false);
    }
  }, [numberId]);

  useEffect(() => { loadBillHistory(); }, [loadBillHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadBillHistory(); }
    finally { setRefreshing(false); }
  }, [loadBillHistory]);

  const openBillDetail = async (billId: string) => {
    try {
      const result = await fetchBillDetail(billId);
      if (result) {
        // อัปเดตสถานะของ item ในลิสต์ให้ตรงกับดีเทลทันที (กันข้อมูลเก่า)
        setBillList((prev) =>
          prev.map((b) =>
            b.bill_id === billId
              ? { ...b, payment_status: canonicalStatus(result.payment_status) ?? result.payment_status ?? b.payment_status }
              : b
          )
        );
        // เก็บดีเทล (canonical ไว้ด้วย เพื่อความสม่ำเสมอใน popup)
        setBillDetail({
          ...result,
          payment_status: canonicalStatus(result?.payment_status) ?? result?.payment_status ?? '',
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error loading bill detail:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบิลได้');
    }
  };

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return billList
      .filter((b) => {
        if (!kw) return true;
        const dateText = String(b.bill_date ?? '').toLowerCase();
        const stMapped = statusText(b.payment_status).toLowerCase(); // ใช้ข้อความสถานะแบบเดียวกับ popup
        const amt = String(b.amount_due ?? '').toLowerCase();
        return dateText.includes(kw) || stMapped.includes(kw) || amt.includes(kw);
      })
      .sort((a, b) => String(b.bill_date).localeCompare(String(a.bill_date)));
  }, [billList, keyword]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={{ marginTop:10, color:'#4E6E90' }}>กำลังโหลดประวัติบิล...</Text>
      </View>
    );
  }

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

      {/* Title / User */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ประวัติการใช้น้ำและการชำระเงิน</Text>
        <Text style={styles.subtitle}>{fullName} • หมายเลข {numberId}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="ค้นหาด้วยวันที่/สถานะ/จำนวนเงิน..."
          placeholderTextColor="#7FA3C1"
          value={keyword}
          onChangeText={setKeyword}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>ไม่พบประวัติ</Text>
          <Text style={styles.emptyDesc}>ลองพิมพ์คำค้นหาให้น้อยลง หรือรีเฟรชอีกครั้ง</Text>
        </View>
      ) : (
        <View style={{ width:'100%', gap:12 }}>
          {filtered.map((bill) => {
            const color = statusColor(bill.payment_status);
            return (
              <View key={bill.bill_id} style={styles.card}>
                <View style={[styles.leftAccent, { backgroundColor: color }]} />
                <View style={styles.cardContent}>
                  <View style={{ flex:1 }}>
                    <Text style={styles.nameText}>บิลวันที่ {formatTHDate(bill.bill_date)}</Text>
                    <Text style={styles.subText}>ยอดเงิน: {formatAmount(bill.amount_due)}</Text>
                  </View>
                  <View style={styles.rightCol}>
                    <View style={[styles.badge, { backgroundColor: color }]}>
                      <Text style={styles.badgeText}>{statusText(bill.payment_status)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      activeOpacity={0.9}
                      onPress={() => openBillDetail(bill.bill_id)}
                    >
                      <Text style={styles.detailText}>รายละเอียด</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Modal รายละเอียดบิล */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            {billDetail ? (
              <>
                <Text style={styles.toastTitle}>รายละเอียดบิล</Text>

                <View style={styles.rowLine}>
                  <Text style={styles.cellLabel}>วันที่</Text>
                  <Text style={styles.cellValue}>{formatTHDate(billDetail.bill_date)}</Text>
                </View>
                <View style={styles.rowLine}>
                  <Text style={styles.cellLabel}>หน่วยที่ใช้</Text>
                  <Text style={styles.cellValue}>{billDetail.units_used ?? '-' } หน่วย</Text>
                </View>
                <View style={styles.rowLine}>
                  <Text style={styles.cellLabel}>ยอดเงิน</Text>
                  <Text style={styles.cellValue}>{formatAmount(billDetail.amount_due)}</Text>
                </View>
                <View style={styles.rowLine}>
                  <Text style={styles.cellLabel}>สถานะ</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(billDetail.payment_status) }]}>
                    <Text style={styles.badgeText}>{statusText(billDetail.payment_status)}</Text>
                  </View>
                </View>
                {!!billDetail.cash_time && (
                  <View style={styles.rowLine}>
                    <Text style={styles.cellLabel}>เวลารับเงินสด</Text>
                    <Text style={styles.cellValue}>{billDetail.cash_time === '1' ? '11:00 น.' : '17:00 น.'}</Text>
                  </View>
                )}

                <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10, marginTop: 14 }}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.toastBtn, { backgroundColor:'#0288D1' }]}>
                    <Text style={styles.toastBtnText}>ปิด</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ActivityIndicator size="large" color="#0288D1" />
            )}
          </View>
        </View>
      </Modal>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default HistoryPage;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E9F4FF', paddingVertical: 16, paddingHorizontal: 16 },

  // Header
  headerRow: { width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  backChip: { backgroundColor:'#E1EEF7', paddingVertical:8, paddingHorizontal:14, borderRadius:999, minWidth:64, alignItems:'center' },
  backText: { color:'#0D2A4A', fontWeight:'700' },
  brand: { fontSize:28, fontWeight:'900', letterSpacing:1, color:'#0D2A4A' },
  brandAccent: { color:'#FF4081' },
  refreshChip: {
    backgroundColor:'#0288D1', paddingVertical:8, paddingHorizontal:14, borderRadius:999,
    shadowColor:'#0288D1', shadowOpacity:0.25, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:4,
  },
  refreshText: { color:'#fff', fontWeight:'700' },

  // Title
  titleWrap: { width:'100%', marginTop:6, marginBottom:8 },
  title: { fontSize:18, fontWeight:'800', color:'#0D2A4A' },
  subtitle: { fontSize:12, color:'#4E6E90', marginTop:4 },

  // Search
  searchBox: {
    backgroundColor:'#ffffff', borderRadius:14, borderWidth:1, borderColor:'#C7DFEF',
    paddingHorizontal:14, paddingVertical:10, shadowColor:'#000', shadowOpacity:0.05,
    shadowOffset:{ width:0, height:4 }, shadowRadius:6, elevation:2, marginBottom:10,
  },
  searchInput: { fontSize:14, color:'#0D2A4A' },

  // Card list
  card: {
    width:'100%', backgroundColor:'#ffffff', borderRadius:16, padding:14,
    shadowColor:'#0D2A4A', shadowOpacity:0.1, shadowOffset:{ width:0, height:10 },
    shadowRadius:14, elevation:3, borderWidth:1, borderColor:'#E1EEF7', position:'relative',
  },
  leftAccent: { position:'absolute', left:0, top:0, bottom:0, width:6, borderTopLeftRadius:16, borderBottomLeftRadius:16 },
  cardContent: { flexDirection:'row', alignItems:'center', gap:12 },
  nameText: { fontSize:16, fontWeight:'800', color:'#0D2A4A', marginBottom:2 },
  subText: { fontSize:12, color:'#4E6E90' },
  rightCol: { alignItems:'flex-end', gap:8 },
  badge: { paddingVertical:6, paddingHorizontal:10, borderRadius:999, alignSelf:'flex-start' },
  badgeText: { color:'#fff', fontWeight:'900', fontSize:11 },
  detailBtn: {
    backgroundColor:'#F4FAFF', borderWidth:1, borderColor:'#9BC6E3',
    paddingVertical:8, paddingHorizontal:12, borderRadius:999,
  },
  detailText: { color:'#0D2A4A', fontWeight:'800', fontSize:12 },

  // Empty
  emptyWrap: {
    width:'100%', backgroundColor:'#F7FBFF', borderWidth:1, borderColor:'#D7E8F5',
    borderRadius:16, paddingVertical:24, paddingHorizontal:16, alignItems:'center',
  },
  emptyEmoji: { fontSize:28, marginBottom:6 },
  emptyTitle: { fontSize:16, fontWeight:'800', color:'#0D2A4A' },
  emptyDesc: { fontSize:12, color:'#4E6E90', marginTop:4, textAlign:'center' },

  // Modal (Toast style)
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'86%', backgroundColor:'#fff', borderRadius:18, padding:18, borderWidth:1, borderColor:'#E1EEF7' },
  toastTitle:{ fontSize:18, fontWeight:'900', color:'#0D2A4A', marginBottom:8 },

  rowLine: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  cellLabel: { color:'#4E6E90', fontWeight:'700', fontSize:12 },
  cellValue: { color:'#0D2A4A', fontWeight:'800', fontSize:14 },

  toastBtn:{ paddingVertical:10, paddingHorizontal:16, borderRadius:12 },
  toastBtnText:{ color:'#fff', fontWeight:'800' },
});
