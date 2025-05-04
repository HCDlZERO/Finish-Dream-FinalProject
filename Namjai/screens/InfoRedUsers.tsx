import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, ScrollView
} from 'react-native';
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
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลลูกบ้าน...</Text>
        </View>
      ) : memberInfo ? (
        <>
          <Text style={styles.header}>🔴 ข้อมูลลูกบ้าน (Red)</Text>

          <View style={styles.card}>
            <Text style={styles.label}>👤 ชื่อ:</Text>
            <Text style={styles.value}>{memberInfo.firstName} {memberInfo.lastName}</Text>

            <Text style={styles.label}>🏠 เลขที่บ้าน:</Text>
            <Text style={styles.value}>{memberInfo.houseNumber}</Text>

            <Text style={styles.label}>🛣️ ถนน:</Text>
            <Text style={styles.value}>{memberInfo.street}</Text>

            <Text style={styles.label}>🏙️ เขต/อำเภอ:</Text>
            <Text style={styles.value}>{memberInfo.district}</Text>

            <Text style={styles.label}>📍 จังหวัด:</Text>
            <Text style={styles.value}>{memberInfo.city}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.error}>❌ ไม่พบข้อมูลลูกบ้าน</Text>
      )}
    </ScrollView>
  );
};

export default InfoRedUsers;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff5f5',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 25,
    elevation: 3,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
});
