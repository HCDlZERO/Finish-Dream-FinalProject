import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchOfficerData, deleteUser } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeleteMemberPage = () => {
  const navigation = useNavigation();
  const [members, setMembers] = useState<any[]>([]);
  const [officerId, setOfficerId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      console.log('📦 Read userData from AsyncStorage:', storedUserData);

      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log('✅ Parsed userData:', userData);

        setOfficerId(userData.officerId);
        console.log('🔑 officerId set to:', userData.officerId);

        const data = await fetchOfficerData(userData.officerId);
        console.log('📥 Fetched members from API:', data);

        setMembers(data);
      } else {
        console.warn('⚠️ No userData found in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (member: any) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบ ${member.firstName} ${member.lastName} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑 Deleting member:', member);

              await deleteUser({
                numberId: member.numberId,
                firstName: member.firstName,
                lastName: member.lastName,
              });

              Alert.alert('ลบสำเร็จ', 'ลูกบ้านถูกลบออกเรียบร้อย');
              loadMembers(); // Reload after delete
            } catch (error) {
              console.error('❌ Failed to delete member:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบลูกบ้านได้');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      <Text style={styles.pageTitle}>ลบรายชื่อลูกบ้าน</Text>

      {members.map((member, index) => (
        <View key={index} style={styles.memberBox}>
          <Text style={styles.memberText}>
            {member.firstName} {member.lastName}
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(member)}>
            <Text style={styles.deleteButtonText}>ลบ</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default DeleteMemberPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E1F5FE',
    paddingBottom: 30,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0288D1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  logoHighlight: { color: '#FF4081' },
  menuIcon: { fontSize: 24, color: 'white' },
  pageTitle: {
    fontSize: 22,
    color: '#0288D1',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  memberBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  memberText: { fontSize: 16, color: '#0288D1' },
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
