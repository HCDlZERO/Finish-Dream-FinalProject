import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 รายชื่อเจ้าหน้าที่</Text>

      <View style={styles.buttonRow}>
        <Button title="➕ เพิ่มพนักงาน" onPress={() => navigation.navigate('AddOfficer')} />
        <Button title="🗑 ลบพนักงาน" onPress={() => navigation.navigate('DeleteOfficer')} />
        <Button title="✅ Approve Requests" onPress={() => navigation.navigate('ApproveRequest')} />
      </View>

      <FlatList
        data={officers}
        keyExtractor={(item) => item.numberId}
        renderItem={({ item }) => (
          <Text>{item.firstName} {item.lastName} ({item.role}) - Zone {item.zoneId}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  buttonRow: { flexDirection: 'column', gap: 10, marginBottom: 20 }
});

export default HomeHeadOfficerPage;
