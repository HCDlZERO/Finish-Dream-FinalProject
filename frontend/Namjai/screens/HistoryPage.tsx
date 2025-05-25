import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchBillHistory, fetchBillDetail } from '../services/apiService';

const HistoryPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { numberId, fullName } = route.params as { numberId: string; fullName: string };

  const [billList, setBillList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [billDetail, setBillDetail] = useState<any>(null);

  useEffect(() => {
    console.log('📦 [HistoryPage] Params received:', { fullName, numberId });
    loadBillHistory();
  }, []);

  const loadBillHistory = async () => {
    try {
      console.log('🚀 [HistoryPage] Fetching bill history for numberId:', numberId);
      const result = await fetchBillHistory(numberId);
      if (result && result.length > 0) {
        console.log('✅ [HistoryPage] Bill history fetched:', result);
        setBillList(result);
      } else {
        console.warn('⚠️ [HistoryPage] No bill history found.');
        setBillList([]);
      }
    } catch (error) {
      console.error('Error loading bill history:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดประวัติบิลได้');
    } finally {
      setLoading(false);
    }
  };

  const openBillDetail = async (billId: string) => {
    try {
      console.log('🔍 [HistoryPage] Fetching bill detail for billId:', billId);
      const result = await fetchBillDetail(billId);
      if (result) {
        console.log('✅ [HistoryPage] Bill detail fetched:', result);
        setBillDetail(result);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error loading bill detail:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบิลได้');
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${parseInt(year) + 543}`;
  };

  const mapPaymentStatus = (status: string) => {
    switch (status) {
      case 'Gray':
        return 'ยังไม่ได้ชำระเงิน';
      case 'Green':
        return 'ชำระเงินเสร็จสิ้น';
      case 'Yellow':
        return 'ชำระด้วยเงินสด';
      case 'Orange':
        return 'ค้างชำระเงิน';
      case 'Red':
        return 'เกินเวลาชำระเงิน';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>{fullName}</Text>
        <Text style={styles.userInfoText}>ลูกบ้าน</Text>
      </View>

      {/* Loading or Bill List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0288D1" style={{ marginTop: 50 }} />
      ) : billList.length > 0 ? (
        billList.map((bill) => (
          <View key={bill.bill_id} style={styles.billRow}>
            <Text style={styles.billDate}>บิลวันที่ {formatDate(bill.bill_date)}</Text>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => openBillDetail(bill.bill_id)}
            >
              <Text style={styles.detailButtonText}>รายละเอียด</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>ไม่พบประวัติการชำระเงิน</Text>
      )}

      {/* Modal แสดงรายละเอียดบิล */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {billDetail ? (
              <>
                <Text style={styles.modalTitle}>รายละเอียดบิล</Text>
                <Text>วันที่: {formatDate(billDetail.bill_date)}</Text>
                <Text>ค่าน้ำที่ใช้: {billDetail.units_used} หน่วย</Text>
                <Text>ยอดเงิน: {billDetail.amount_due} บาท</Text>
                <Text>สถานะการชำระเงิน: {mapPaymentStatus(billDetail.payment_status)}</Text>
                {billDetail.cash_time && (
                  <Text>เวลารับเงินสด: {billDetail.cash_time === '1' ? '11:00 น.' : '17:00 น.'}</Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>ปิด</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ActivityIndicator size="large" color="#0288D1" />
            )}
          </View>
        </View>
      </Modal>
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
  userInfo: {
    backgroundColor: '#0288D1',
    paddingVertical: 10,
    alignItems: 'center',
  },
  userInfoText: { color: 'white', fontSize: 16 },
  billRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  billDate: {
    flex: 1,
    backgroundColor: '#0288D1',
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 15,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#0288D1',
    fontWeight: 'bold',
  },
  noDataText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#0288D1',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  closeButton: {
    backgroundColor: '#0288D1',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HistoryPage;
