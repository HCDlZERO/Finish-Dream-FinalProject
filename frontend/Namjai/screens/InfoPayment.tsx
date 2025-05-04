import React, { useEffect, useState } from 'react';
import {
  View, Text, Alert, Image, StyleSheet,
  ScrollView, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { fetchConfirmInfo, confirmPayment } from '../services/apiService';

const InfoPayment = ({ route, navigation }: any) => {
  const { firstName, lastName } = route.params;
  const [confirmData, setConfirmData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (firstName && lastName) {
      getConfirmInfo();
    }
  }, []);

  const getConfirmInfo = async () => {
    setLoading(true);
    try {
      const result = await fetchConfirmInfo(firstName, lastName);
      if (Array.isArray(result) && result.length > 0) {
        setConfirmData(result[0]);
      } else {
        setConfirmData(null);
      }
    } catch (error) {
      Alert.alert('Error', 'ไม่สามารถดึงข้อมูลยืนยันได้');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment({ firstName, lastName });
      Alert.alert('สำเร็จ', 'ยืนยันการชำระเงินเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'ยืนยันการชำระเงินไม่สำเร็จ');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0288D1" />
      ) : confirmData ? (
        <>
          <Text style={styles.title}>📄 ข้อมูลการยืนยันชำระเงิน</Text>

          <View style={styles.card}>
            <Text style={styles.label}>👤 ชื่อ:</Text>
            <Text style={styles.value}>{confirmData.firstName} {confirmData.lastName}</Text>

            <Text style={styles.label}>💰 จำนวนเงิน:</Text>
            <Text style={styles.value}>{confirmData.amountDue} บาท</Text>

            <Text style={styles.label}>📅 วันที่ยืนยัน:</Text>
            <Text style={styles.value}>{confirmData.confirmDate}</Text>

            <Text style={styles.label}>🕒 เวลายืนยัน:</Text>
            <Text style={styles.value}>{confirmData.confirmTime}</Text>

            <Text style={styles.label}>👮 เจ้าหน้าที่:</Text>
            <Text style={styles.value}>{confirmData.officerName}</Text>

            <Text style={styles.label}>🖼️ รูปภาพยืนยัน:</Text>
            {confirmData.confirmImage ? (
              <Image
                source={{ uri: confirmData.confirmImage }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.value}>ไม่มีรูปภาพ</Text>
            )}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
            <Text style={styles.buttonText}>✅ ยืนยันการชำระเงิน</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.errorText}>❌ ไม่พบข้อมูลการยืนยัน</Text>
      )}
    </ScrollView>
  );
};

export default InfoPayment;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#01579b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#455a64',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 6,
    color: '#263238',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
  },
});
