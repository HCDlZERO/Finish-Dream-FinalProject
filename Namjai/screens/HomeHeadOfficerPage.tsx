import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert,
  TouchableOpacity, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchAllHeadOfficers } from '../services/apiService';

const HomeHeadOfficerPage = () => {
  const [officers, setOfficers] = useState([]);
  const navigation = useNavigation();

  const loadOfficers = async () => {
    try {
      const data = await fetchAllHeadOfficers();
      setOfficers(data);
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลเจ้าหน้าที่ได้');
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const renderOfficer = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.name}>👤 {item.firstName} {item.lastName}</Text>
      <Text style={styles.detail}>📌 ตำแหน่ง: {item.role}</Text>
      <Text style={styles.detail}>📍 Zone: {item.zoneId}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧾 รายชื่อเจ้าหน้าที่ทั้งหมด</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddOfficer')}>
          <Text style={styles.buttonText}>➕ เพิ่มพนักงาน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DeleteOfficer')}>
          <Text style={styles.buttonText}>🗑 ลบพนักงาน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ApproveRequest')}>
          <Text style={styles.buttonText}>✅ Approve Requests</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>👥 รายชื่อเจ้าหน้าที่</Text>

      <FlatList
        data={officers}
        keyExtractor={(item) => item.numberId}
        renderItem={renderOfficer}
        contentContainerStyle={styles.list}
      />
    </ScrollView>
  );
};

export default HomeHeadOfficerPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#01579b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0277bd',
  },
  buttonRow: {
    marginBottom: 25,
    gap: 10,
  },
  button: {
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#546e7a',
  },
});
