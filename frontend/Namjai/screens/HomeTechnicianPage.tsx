import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🚨 รายชื่อลูกบ้านที่ถูกยกเลิก</Text>

      {users.length === 0 ? (
        <Text style={styles.noUser}>ไม่พบลูกบ้านที่มีสถานะยกเลิก</Text>
      ) : (
        users.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.userCard}
            onPress={() => handlePressUser(user.numberId)}
          >
            <Text style={styles.nameText}>🔴 {user.firstName} {user.lastName}</Text>
            <Text style={styles.subText}>🆔 หมายเลข: {user.numberId}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

export default HomeTechnicianPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff5f5',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#d32f2f',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#fff5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noUser: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 30,
  },
  userCard: {
    backgroundColor: '#fff0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#b71c1c',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
});
