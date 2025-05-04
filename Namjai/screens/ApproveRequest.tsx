import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Alert,
  TouchableOpacity, ScrollView
} from 'react-native';
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
      loadData();
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ส่งคำสั่งล้มเหลว');
    }
  };

  const handleDeleteAction = async (numberId: string, tag: 'Yes' | 'No') => {
    try {
      await processDeleteAPI(numberId, tag);
      Alert.alert('สำเร็จ', `ส่งคำสั่ง Delete (${tag}) แล้ว`);
      loadData();
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ส่งคำสั่งล้มเหลว');
    }
  };

  const renderRow = (item: any, onApprove: () => void, onReject: () => void) => (
    <View style={styles.card}>
      <Text style={styles.name}>👤 {item.firstName} {item.lastName}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionButton, styles.approve]} onPress={onApprove}>
          <Text style={styles.actionText}>✅ อนุมัติ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.reject]} onPress={onReject}>
          <Text style={styles.actionText}>❌ ไม่อนุมัติ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 รายชื่อรออนุมัติ</Text>
      {approveList.length === 0 ? (
        <Text style={styles.empty}>ไม่มีรายการรออนุมัติ</Text>
      ) : (
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
      )}

      <Text style={styles.title}>🗑 รายชื่อรอลบ</Text>
      {deleteList.length === 0 ? (
        <Text style={styles.empty}>ไม่มีรายการรอลบ</Text>
      ) : (
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
      )}
    </ScrollView>
  );
};

export default ApproveRequest;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f1f8e9',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#33691e',
  },
  empty: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2e7d32',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  approve: {
    backgroundColor: '#aed581',
  },
  reject: {
    backgroundColor: '#ef9a9a',
  },
  actionText: {
    fontWeight: 'bold',
    color: '#263238',
  },
});
