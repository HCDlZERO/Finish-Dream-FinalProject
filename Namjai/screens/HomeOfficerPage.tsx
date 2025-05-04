import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { fetchOfficerData } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeOfficerPage = ({ navigation }: any) => {
  const [officerData, setOfficerData] = useState<any>(null);
  const [officerId, setOfficerId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getStoredData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setOfficerId(userData.officerId);
        }
      } catch (error) {
        console.error('Error getting stored data:', error);
      }
    };
    getStoredData();
  }, []);

  const fetchData = async () => {
    if (officerId) {
      try {
        const data = await fetchOfficerData(officerId);
        setOfficerData(data);
      } catch (error) {
        console.error('Error fetching officer data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [officerId]);

  const isLastTwoDaysOfMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return today.getDate() >= lastDay - 1;
  };

  const getButtonColor = (status: string) => {
    const colorMap: Record<string, string> = {
      Red: '#F44336',
      Orange: '#FF9800',
      Yellow: '#FFEB3B', // นุ่มตากว่าเดิม
      Green: '#4CAF50',
      Gray: '#9E9E9E',
    };
    return colorMap[status] || '#0288D1';
  };

  const handleButtonPress = (officer: any) => {
    navigation.navigate('UserBillsInfo', {
      officerId: officerId,
      paymentStatus: officer.paymentStatus,
      numberId: officer.numberId,
      cashTime: officer.cashTime,
    });
  };

  const handleCreateBillsButton = (officer: any) => {
    if (isLastTwoDaysOfMonth()) {
      navigation.navigate('CreateBills', {
        officerId: officerId,
        numberId: officer.numberId,
        firstName: officer.firstName,
        lastName: officer.lastName,
      });
    } else {
      alert('สามารถสร้างบิลได้เฉพาะ 2 วันสุดท้ายของเดือนเท่านั้น');
    }
  };

  const handleOfficerSettingButton = () => {
    navigation.navigate('SettingOfficerInfo', { officerId: officerId });
  };

  const handleAddMember = () => {
    navigation.navigate('AddMemberPage');
  };

  const handleDeleteMemberPage = () => {
    navigation.navigate('DeleteMemberPage');
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  if (!officerData) {
    return (
      <View style={styles.container}>
        <Text>ไม่พบข้อมูลลูกบ้าน</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
      </View>

      {officerData.map((officer: any, index: number) => (
        <View key={index} style={styles.userBox}>
          <View style={styles.userInfo}>
            <View style={[styles.statusDot, { backgroundColor: getButtonColor(officer.paymentStatus) }]} />
            <Text style={styles.userName}>{officer.firstName} {officer.lastName}</Text>
          </View>
          <TouchableOpacity style={styles.detailButton} onPress={() => handleButtonPress(officer)}>
            <Text style={styles.detailButtonText}>รายละเอียด</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
          <Text style={styles.plusMinus}>＋</Text>
          <Text style={styles.actionText}>เพิ่มลูกบ้าน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={handleDeleteMemberPage}>
          <Text style={styles.plusMinus}>－</Text>
          <Text style={styles.actionText}>ลดลูกบ้าน</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createBillButton} onPress={handleCreateBillsButton}>
        <Text style={styles.createBillText}>🧾 สร้างบิล</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingButton} onPress={handleOfficerSettingButton}>
        <Text style={styles.settingText}>⚙️ ตั้งค่าเจ้าหน้าที่</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default HomeOfficerPage;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E1F5FE', alignItems: 'center', paddingVertical: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  logoHighlight: { color: '#FF4081' },
  menuText: { fontSize: 26, color: '#0288D1' },
  userBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', width: '90%', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#0288D1' },
  detailButton: { backgroundColor: '#0288D1', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  detailButtonText: { color: '#fff', fontSize: 14 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginTop: 20 },
  addButton: { backgroundColor: '#0288D1', padding: 20, borderRadius: 10, alignItems: 'center', flex: 0.45 },
  removeButton: { backgroundColor: '#0288D1', padding: 20, borderRadius: 10, alignItems: 'center', flex: 0.45 },
  plusMinus: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  actionText: { fontSize: 16, color: 'white', marginTop: 5 },
  createBillButton: { marginTop: 20, backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, width: '90%', alignItems: 'center' },
  createBillText: { color: 'white', fontSize: 18 },
  settingButton: { marginTop: 10, backgroundColor: '#FF9800', padding: 15, borderRadius: 10, width: '90%', alignItems: 'center' },
  settingText: { color: 'white', fontSize: 18 },
});