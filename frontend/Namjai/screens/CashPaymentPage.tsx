import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateBillStatus } from '../services/apiService';

const CashPaymentPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    numberId,
    fullName,
    amountDue,
    billDate,
    paymentStatus,
  } = route.params as {
    numberId: string;
    fullName: string;
    amountDue: number;
    billDate: string;
    paymentStatus: string;
  };

  const now = new Date();
  const dateLabel = `6/${now.getMonth() + 1}/${now.getFullYear()}`;

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

  const handleConfirm = async (cashTime: number) => {
    try {
      const result = await updateBillStatus(numberId, 'Yellow', cashTime);
      Alert.alert('สำเร็จ', 'ส่งข้อมูลเรียบร้อยแล้ว');
      console.log('✔️ Update Success:', result);
      navigation.goBack();
    } catch (error) {
      console.error('❌ Update Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถส่งข้อมูลได้');
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
      <View style={styles.userInfoRow}>
        <Text style={styles.userInfo}>{fullName || ''}</Text>
        <Text style={styles.userInfo}>ลูกบ้าน</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBoxContainer}>
        <View style={styles.infoBoxLeft}>
          <Text style={styles.infoBoxTitle}>ยอดค่าใช้จ่ายน้ำประปา</Text>
        </View>
        <View style={styles.infoBoxRight}>
          <Text style={styles.infoBoxAmount}>
            {paymentStatus === 'Green'
              ? 'ชำระเงินเสร็จสิ้น'
              : `${amountDue} บาท`}
          </Text>
        </View>
      </View>

      <Text style={styles.dueDateText}>{getDueDateMessage()}</Text>

      {/* ปุ่มนัดเวลา */}
      <Text style={styles.selectText}>กรุณาเลือกเวลานัดชำระเงินสด</Text>

      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => handleConfirm(1)}
      >
        <Text style={styles.timeText}>{dateLabel} เวลา 11.00 น.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => handleConfirm(2)}
      >
        <Text style={styles.timeText}>{dateLabel} เวลา 17.00 น.</Text>
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
  selectText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#0288D1',
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
  },
  timeButton: {
    backgroundColor: '#0288D1',
    marginHorizontal: 50,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CashPaymentPage;
