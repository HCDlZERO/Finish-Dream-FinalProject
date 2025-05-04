import React, { useEffect, useState } from 'react';
import {
  View, Text, Alert, StyleSheet,
  ScrollView, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { fetchBillInfo, cancelService } from '../services/apiService';

const UserBillsInfo = ({ route, navigation }: any) => {
  const { numberId, paymentStatus } = route.params;
  const [billInfo, setBillInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (numberId) getBillInfo();
    else Alert.alert('Error', 'Invalid number ID received.');
  }, []);

  const getBillInfo = async () => {
    setLoading(true);
    try {
      const data = await fetchBillInfo(numberId);
      if (Array.isArray(data) && data.length > 0) {
        setBillInfo(data[0]);
      } else {
        setBillInfo(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bill information.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoPayment = () => {
    if (!billInfo) return;
    navigation.navigate('InfoPayment', {
      firstName: billInfo.firstName,
      lastName: billInfo.lastName,
    });
  };

  const handleCancelService = async () => {
    try {
      await cancelService(numberId);
      Alert.alert('บริการถูกยกเลิกแล้ว');
    } catch (error) {
      Alert.alert('Error', 'ไม่สามารถยกเลิกบริการได้');
    }
  };

  const renderConditionalButton = () => {
    if (!billInfo) return null;

    const status = billInfo.paymentStatus;
    if (["Gray", "Green", "Yellow", "Orange"].includes(status)) {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleInfoPayment}>
          <Text style={styles.buttonText}>ดูรายละเอียดการชำระเงิน</Text>
        </TouchableOpacity>
      );
    } else if (status === "Red") {
      return (
        <TouchableOpacity style={styles.dangerButton} onPress={handleCancelService}>
          <Text style={styles.buttonText}>ยกเลิกบริการ</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderStatusTag = () => {
    if (!billInfo) return null;

    const status = billInfo.paymentStatus;
    let message = '';
    let color = '';

    switch (status) {
      case 'Gray': message = 'รอการชำระ'; color = '#9e9e9e'; break;
      case 'Green': message = 'ชำระเสร็จสิ้น'; color = '#4caf50'; break;
      case 'Yellow': message = 'ชำระเป็นเงินสด'; color = '#fdd835'; break;
      case 'Orange': message = 'ค้างชำระ'; color = '#fb8c00'; break;
      case 'Red': message = 'เกินเวลาชำระ'; color = '#e53935'; break;
    }

    return (
      <View style={[styles.statusTag, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{message}</Text>
      </View>
    );
  };

  const renderCashTimeBox = () => {
    if (!billInfo || billInfo.paymentStatus !== 'Yellow') return null;

    let timeMsg = '-';
    if (String(billInfo.cashTime) === '1') timeMsg = '11.00 น.';
    else if (String(billInfo.cashTime) === '2') timeMsg = '17.00 น.';

    return (
      <View style={[styles.statusTag, { backgroundColor: '#ffeb3b', marginTop: 10 }]}>
        <Text style={[styles.statusText, { color: '#000' }]}>เวลานัดชำระ: {timeMsg}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" />
      ) : billInfo ? (
        <>
          <View style={styles.statusContainer}>
            {renderStatusTag()}
            {renderCashTimeBox()}
          </View>

          <Text style={styles.header}>ข้อมูลบิลค่าน้ำ</Text>

          <View style={styles.card}>
            <Text style={styles.label}>ชื่อ-สกุล:</Text>
            <Text style={styles.value}>{billInfo.firstName} {billInfo.lastName}</Text>

            <Text style={styles.label}>หมายเลขผู้ใช้:</Text>
            <Text style={styles.value}>{billInfo.numberId}</Text>

            <Text style={styles.label}>ปริมาณน้ำที่ใช้:</Text>
            <Text style={styles.value}>{billInfo.unitsUsed}</Text>

            <Text style={styles.label}>วันที่ออกบิล:</Text>
            <Text style={styles.value}>{billInfo.billDate}</Text>

            <Text style={styles.label}>ยอดค้างชำระ:</Text>
            <Text style={styles.value}>{billInfo.amountDue} บาท</Text>

            {billInfo.cash && (
              <>
                <Text style={styles.label}>ค่าปรับ:</Text>
                <Text style={[styles.value, { color: '#d32f2f' }]}>{billInfo.cash} บาท</Text>
              </>
            )}

            <Text style={styles.label}>สถานะการชำระ:</Text>
            <Text style={styles.value}>{billInfo.paymentStatus}</Text>
          </View>

          {renderConditionalButton()}
        </>
      ) : (
        <Text style={styles.errorText}>ไม่พบข้อมูลบิลสำหรับผู้ใช้นี้</Text>
      )}
    </ScrollView>
  );
};

export default UserBillsInfo;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  header: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20,
    textAlign: 'center', color: '#0d47a1',
  },
  card: {
    backgroundColor: '#ffffff', padding: 20, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3, marginBottom: 25,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#455a64' },
  value: { fontSize: 16, marginBottom: 12, color: '#263238' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
  statusContainer: { alignItems: 'flex-end', marginBottom: 10 },
  statusTag: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 14, alignSelf: 'flex-end',
  },
  statusText: { fontWeight: 'bold', color: '#fff' },
  primaryButton: {
    backgroundColor: '#2196f3', borderRadius: 25,
    paddingVertical: 12, alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#e53935', borderRadius: 25,
    paddingVertical: 12, alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase',
  },
});
