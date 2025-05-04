import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLatestBillById } from '../services/apiService';
import { useNavigation } from '@react-navigation/native';

const HomeMemberPage = () => {
  const navigation = useNavigation();
  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string>('7 พฤศจิกายน 2567');
  const [officerId, setOfficerId] = useState<number | null>(null);
  const [collectionOfficerId, setCollectionOfficerId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [numberId, setNumberId] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          if (userData.officerId) setOfficerId(userData.officerId);
          if (userData.numberId) setNumberId(userData.numberId);
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const loadBill = async () => {
      if (officerId !== null) {
        try {
          const latestBill = await fetchLatestBillById(officerId);
          if (latestBill) {
            if (latestBill.amount_due != null) setAmountDue(latestBill.amount_due);
            if (latestBill.first_name) setFirstName(latestBill.first_name);
            if (latestBill.last_name) setLastName(latestBill.last_name);
            if (latestBill.collection_officer_id != null) setCollectionOfficerId(latestBill.collection_officer_id);
            if (latestBill.number_id) setNumberId(latestBill.number_id);
          }
        } catch (error) {
          console.error('Failed to fetch latest bill', error);
        }
      }
    };
    loadBill();
  }, [officerId]);

  const goToUserProfile = () => {
    if (!numberId) {
      Alert.alert('ข้อมูลไม่ครบ', 'ไม่พบหมายเลขผู้ใช้งาน');
      return;
    }
    navigation.navigate('UserProfilePage', { numberId });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfoRow}>
        <Text style={styles.userInfo}>
          {firstName || lastName ? `${firstName} ${lastName}` : ''}
        </Text>
        <Text style={styles.userInfo}>ลูกบ้าน</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBoxContainer}>
        <View style={styles.infoBoxLeft}>
          <Text style={styles.infoBoxTitle}>ยอดค่าใช้จ่ายน้ำป่า</Text>
        </View>
        <View style={styles.infoBoxRight}>
          <Text style={styles.infoBoxAmount}>
            {amountDue !== null ? `${amountDue} บาท` : '...'}
          </Text>
        </View>
      </View>

      <Text style={styles.dueDateText}>โปรดชำระก่อนวันที่ {dueDate}</Text>

      {/* Button Grid */}
      <View style={styles.buttonGrid}>
        {/* 1. ชำระเงิน */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('PaymentPage', {
                officerId: collectionOfficerId,
                fullName: `${firstName} ${lastName}`,
              });
          }}
        >
          <Text style={styles.emoji}>💵</Text>
          <Text style={styles.buttonText}>ชำระเงิน</Text>
        </TouchableOpacity>

        {/* 2. ประวัติ */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (numberId)
              navigation.navigate('HistoryPage', {
                numberId,
                fullName: `${firstName} ${lastName}`,
              });
          }}
        >
          <Text style={styles.emoji}>📜</Text>
          <Text style={styles.buttonText}>ประวัติ</Text>
        </TouchableOpacity>

        {/* 3. บัญชีผู้ใช้งาน */}
        <TouchableOpacity style={styles.button} onPress={goToUserProfile}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.buttonText}>บัญชีผู้ใช้งาน</Text>
        </TouchableOpacity>

        {/* 4. ยืนยันชำระเงิน */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('ConfirmPaymentPage', {
                officerId: collectionOfficerId,
                firstName,
                lastName,
                amountDue,
              });
          }}
        >
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.buttonText}>ยืนยันชำระเงิน</Text>
        </TouchableOpacity>

        {/* 5. ติดต่อ */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('ContactOfficerPage', {
                officerId: collectionOfficerId,
              });
          }}
        >
          <Text style={styles.emoji}>☎️</Text>
          <Text style={styles.buttonText}>ติดต่อ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E1F5FE', paddingBottom: 30 },
  header: {
    backgroundColor: '#0288D1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  logoHighlight: { color: '#FF4081' },
  menuIcon: { fontSize: 24, color: 'white' },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0288D1',
    paddingVertical: 10,
  },
  userInfo: { color: 'white', fontSize: 16 },
  infoBoxContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  infoBoxLeft: {
    flex: 1,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoBoxRight: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoBoxTitle: { fontSize: 16, color: '#0288D1', fontWeight: 'bold' },
  infoBoxAmount: { fontSize: 22, fontWeight: 'bold', color: '#0288D1' },
  dueDateText: { textAlign: 'center', marginTop: 5, color: '#0288D1', fontSize: 14 },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'white',
    width: 120,
    height: 120,
    margin: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
  },
  emoji: { fontSize: 36, color: '#0288D1' },
  buttonText: { marginTop: 8, fontSize: 14, color: '#0288D1', textAlign: 'center' },
});

export default HomeMemberPage;
