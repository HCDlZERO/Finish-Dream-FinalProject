import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import {
  fetchPendingUsers,
  approveRequestAPI,
  processDeleteAPI
} from '../services/apiService';

const ApproveRequest = () => {
  const [approveList, setApproveList] = useState([]);
  const [deleteList, setDeleteList] = useState([]);

  const loadData = async () => {
    try {
      const data = await fetchPendingUsers();
      const approve = data.filter((item: any) => item.tag === 'Approve');
      const toDelete = data.filter((item: any) => item.tag === 'delete');
      setApproveList(approve);
      setDeleteList(toDelete);
    } catch (error) {
      Alert.alert('โหลดข้อมูลล้มเหลว', 'ไม่สามารถโหลดรายการคำขอได้');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveAction = async (numberId: string, tag: 'Yes' | 'No') => {
    try {
      await approveRequestAPI(numberId, tag);
      Alert.alert('สำเร็จ', `ส่งคำสั่ง Approve (${tag}) แล้ว`);
      loadData(); // refresh
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ส่งคำสั่งล้มเหลว');
    }
  };

  const handleDeleteAction = async (numberId: string, tag: 'Yes' | 'No') => {
    try {
      await processDeleteAPI(numberId, tag);
      Alert.alert('สำเร็จ', `ส่งคำสั่ง Delete (${tag}) แล้ว`);
      loadData(); // refresh
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ส่งคำสั่งล้มเหลว');
    }
  };

  const renderRow = (item: any, onApprove: () => void, onReject: () => void) => (
    <View style={styles.row}>
      <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
      <View style={styles.actions}>
        <Button title="✅" onPress={onApprove} />
        <Button title="❌" color="red" onPress={onReject} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ รายชื่อรออนุมัติ (Approve)</Text>
      <FlatList
        data={approveList}
        keyExtractor={(item) => item.numberId}
        renderItem={({ item }) =>
          renderRow(
            item,
            () => handleApproveAction(item.numberId, 'Yes'),
            () => handleApproveAction(item.numberId, 'No')
          )
        }
      />

      <Text style={styles.title}>🗑 รายชื่อรอลบ (delete)</Text>
      <FlatList
        data={deleteList}
        keyExtractor={(item) => item.numberId}
        renderItem={({ item }) =>
          renderRow(
            item,
            () => handleDeleteAction(item.numberId, 'Yes'),
            () => handleDeleteAction(item.numberId, 'No')
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 10 }
});

export default ApproveRequest;
