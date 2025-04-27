import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { fetchRedAndCancelledBills } from '../services/apiService';

const HomeTechnicianPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchRedAndCancelledBills();
        setUsers(data);
        console.log('✅ ดึงข้อมูลลูกบ้าน Red & Cancel แล้ว:', data);
      } catch (error) {
        console.error('❌ ดึงข้อมูลล้มเหลว:', error);
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลลูกบ้านที่ถูกยกเลิกได้');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handlePressUser = (numberId: string) => {
    navigation.navigate('InfoRedUsers', { numberId });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Red Cancelled Users</Text>

      {users.length === 0 ? (
        <Text style={styles.noUser}>ไม่มีลูกบ้านที่ถูกยกเลิก</Text>
      ) : (
        users.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.userCard}
            onPress={() => handlePressUser(user.numberId)}
          >
            <Text style={styles.nameText}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.subText}>Number ID: {user.numberId}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  noUser: { textAlign: 'center', fontSize: 16, color: 'gray' },
  userCard: {
    backgroundColor: '#ffe5e5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  nameText: { fontSize: 18, fontWeight: '600', color: '#d32f2f' },
  subText: { fontSize: 14, color: '#555' },
});

export default HomeTechnicianPage;
