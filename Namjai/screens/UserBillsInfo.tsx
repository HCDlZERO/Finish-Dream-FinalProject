import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchBillInfo, cancelService } from '../services/apiService';

const UserBillsInfo = ({ route, navigation }: any) => {
  const { numberId, paymentStatus } = route.params;
  const [billInfo, setBillInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('📦 Received Params from Route:', { numberId, paymentStatus });
    if (numberId) {
      getBillInfo();
    } else {
      Alert.alert('Error', 'Invalid number ID received.');
    }
  }, []);

  const getBillInfo = async () => {
    setLoading(true);
    try {
      const data = await fetchBillInfo(numberId);
      console.log('📥 API Response (fetchBillInfo):', data);
      if (Array.isArray(data) && data.length > 0) {
        setBillInfo(data[0]);
      } else {
        setBillInfo(null);
        console.warn('❌ No valid bill data received');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bill information.');
      console.error('❌ Error fetching bill info:', error);
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
      console.error('❌ Error canceling service:', error);
    }
  };

  const renderConditionalButton = () => {
    if (!billInfo) return null;

    const status = billInfo.paymentStatus;
    if (["Gray", "Green", "Yellow", "Orange"].includes(status)) {
      return (
        <Button title="Info Payment" onPress={handleInfoPayment} />
      );
    } else if (status === "Red") {
      return (
        <Button title="Cancel Service" color="red" onPress={handleCancelService} />
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
      case 'Gray': message = 'รอการชำระ'; color = 'gray'; break;
      case 'Green': message = 'ชำระเสร็จสิ้น'; color = 'green'; break;
      case 'Yellow': message = 'ชำระเป็นเงินสด'; color = 'gold'; break;
      case 'Orange': message = 'ค้างชำระ'; color = 'orange'; break;
      case 'Red': message = 'เกินเวลาชำระ'; color = 'red'; break;
    }

    return (
      <View style={[styles.statusTag, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{message}</Text>
      </View>
    );
  };

  const renderCashTimeBox = () => {
    if (!billInfo || billInfo.paymentStatus !== 'Yellow') return null;

    console.log('⌛ Checking Cash Time from API (billInfo.cashTime):', billInfo.cashTime);

    let timeMsg = '-';
    if (String(billInfo.cashTime) === '1') timeMsg = '11.00น.';
    else if (String(billInfo.cashTime) === '2') timeMsg = '17.00น.';

    return (
      <View style={[styles.statusTag, { backgroundColor: '#ffd700', marginTop: 10 }]}>
        <Text style={styles.statusText}>เวลานัดชำระ: {timeMsg}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : billInfo ? (
        <>
          <View style={styles.topRightCorner}>
            {renderStatusTag()}
            {renderCashTimeBox()}
          </View>

          <Text style={styles.header}>Bill Information</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{billInfo.firstName} {billInfo.lastName}</Text>

            <Text style={styles.label}>Number ID:</Text>
            <Text style={styles.value}>{billInfo.numberId}</Text>

            <Text style={styles.label}>Units Used:</Text>
            <Text style={styles.value}>{billInfo.unitsUsed}</Text>

            <Text style={styles.label}>Bill Date:</Text>
            <Text style={styles.value}>{billInfo.billDate}</Text>

            <Text style={styles.label}>Amount Due:</Text>
            <Text style={styles.value}>{billInfo.amountDue} THB</Text>

            {billInfo.cash && (
              <>
                <Text style={styles.label}>Penalty (ค่าปรับ):</Text>
                <Text style={[styles.value, { color: 'red' }]}>{billInfo.cash} THB</Text>
              </>
            )}

            <Text style={styles.label}>Payment Status:</Text>
            <Text style={styles.value}>{billInfo.paymentStatus}</Text>
          </View>

          {renderConditionalButton()}
        </>
      ) : (
        <Text style={styles.errorText}>Error: No bill information available.</Text>
      )}
    </ScrollView>
  );
};

export default UserBillsInfo;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  card: {
    backgroundColor: '#fff', padding: 20, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, marginBottom: 20,
  },
  label: { fontSize: 18, fontWeight: 'bold', color: '#666' },
  value: { fontSize: 18, marginBottom: 10, color: '#333' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
  topRightCorner: { alignItems: 'flex-end', marginBottom: 10 },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontWeight: 'bold' },
});
