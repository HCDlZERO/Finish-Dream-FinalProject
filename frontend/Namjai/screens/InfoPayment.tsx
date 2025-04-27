import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchConfirmInfo, confirmPayment } from '../services/apiService';

const InfoPayment = ({ route, navigation }: any) => {
  const { firstName, lastName } = route.params;
  const [confirmData, setConfirmData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('📦 Received Params in InfoPayment:', { firstName, lastName });
    if (firstName && lastName) {
      getConfirmInfo();
    }
  }, []);

  const getConfirmInfo = async () => {
    setLoading(true);
    try {
      const result = await fetchConfirmInfo(firstName, lastName);
      console.log('📥 API Response (fetchConfirmInfo):', result);
      if (Array.isArray(result) && result.length > 0) {
        setConfirmData(result[0]);
      } else {
        setConfirmData(null);
        console.warn('❌ No confirm info data');
      }
    } catch (error) {
      console.error('❌ Error fetching confirm info:', error);
      Alert.alert('Error', 'ไม่สามารถดึงข้อมูลยืนยันได้');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment({ firstName, lastName });
      Alert.alert('สำเร็จ', 'ยืนยันการชำระเงินเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() }, // ✅ หลังยืนยันเสร็จ ย้อนกลับไปหน้าเดิม
      ]);
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      Alert.alert('Error', 'ยืนยันการชำระเงินไม่สำเร็จ');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : confirmData ? (
        <>
          <Text style={styles.title}>ข้อมูลการยืนยันชำระเงิน</Text>

          <Text style={styles.label}>ชื่อ:</Text>
          <Text style={styles.value}>{confirmData.firstName} {confirmData.lastName}</Text>

          <Text style={styles.label}>จำนวนเงิน:</Text>
          <Text style={styles.value}>{confirmData.amountDue} บาท</Text>

          <Text style={styles.label}>วันที่ยืนยัน:</Text>
          <Text style={styles.value}>{confirmData.confirmDate}</Text>

          <Text style={styles.label}>เวลายืนยัน:</Text>
          <Text style={styles.value}>{confirmData.confirmTime}</Text>

          <Text style={styles.label}>เจ้าหน้าที่:</Text>
          <Text style={styles.value}>{confirmData.officerName}</Text>

          <Text style={styles.label}>รูปภาพยืนยัน:</Text>
          {confirmData.confirmImage ? (
            <Image
              source={{ uri: confirmData.confirmImage }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.value}>ไม่มีรูปภาพ</Text>
          )}

          <View style={{ marginTop: 20 }}>
            <Button title="ยืนยันการชำระเงิน" onPress={handleConfirmPayment} />
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>ไม่พบข้อมูลการยืนยัน</Text>
      )}
    </ScrollView>
  );
};

export default InfoPayment;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0288D1',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
