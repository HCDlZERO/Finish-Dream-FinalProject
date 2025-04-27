import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { fetchMemberInfoByNumberId } from '../services/apiService';

const InfoRedUsers = ({ route }: any) => {
  const { numberId } = route.params;
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMemberInfo = async () => {
      try {
        const data = await fetchMemberInfoByNumberId(numberId);
        setMemberInfo(data);
        console.log('✅ ข้อมูลลูกบ้าน:', data);
      } catch (error) {
        console.error('❌ ดึงข้อมูลลูกบ้านล้มเหลว:', error);
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลลูกบ้านได้');
      } finally {
        setLoading(false);
      }
    };

    loadMemberInfo();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : memberInfo ? (
        <>
          <Text style={styles.header}>ข้อมูลลูกบ้าน</Text>

          <View style={styles.card}>
            <Text style={styles.label}>ชื่อ:</Text>
            <Text style={styles.value}>{memberInfo.firstName} {memberInfo.lastName}</Text>

            <Text style={styles.label}>เลขที่บ้าน:</Text>
            <Text style={styles.value}>{memberInfo.houseNumber}</Text>

            <Text style={styles.label}>ถนน:</Text>
            <Text style={styles.value}>{memberInfo.street}</Text>

            <Text style={styles.label}>เขต/อำเภอ:</Text>
            <Text style={styles.value}>{memberInfo.district}</Text>

            <Text style={styles.label}>จังหวัด:</Text>
            <Text style={styles.value}>{memberInfo.city}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.error}>ไม่พบข้อมูลลูกบ้าน</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  value: { fontSize: 16, color: '#333', marginBottom: 5 },
  error: { fontSize: 16, color: 'red', textAlign: 'center' },
});

export default InfoRedUsers;
