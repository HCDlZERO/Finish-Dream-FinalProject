import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { fetchAllHeadOfficers, deleteHeadOfficer } from '../services/apiService';

const DeleteOfficer = () => {
  const [officers, setOfficers] = useState([]);

  const loadOfficers = async () => {
    try {
      const data = await fetchAllHeadOfficers();
      setOfficers(data);
    } catch (error) {
      Alert.alert('โหลดข้อมูลล้มเหลว');
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const handleDelete = async (numberId: string) => {
    try {
      await deleteHeadOfficer(numberId);
      Alert.alert('สำเร็จ', `ลบ ${numberId} แล้ว`);
      loadOfficers();
    } catch {
      Alert.alert('ลบไม่สำเร็จ');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ลบรายชื่อลูกบ้าน</Text>
      <FlatList
        data={officers}
        keyExtractor={(item) => item.numberId}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Text style={styles.nameText}>{item.firstName} {item.lastName}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.numberId)}>
              <Text style={styles.deleteButtonText}>ลบ</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#E1F5FE',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0288D1',
    marginBottom: 20,
  },
  itemBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nameText: {
    fontSize: 16,
    color: '#0288D1',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DeleteOfficer;
