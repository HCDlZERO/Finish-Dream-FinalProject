import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLatestBillById } from '../services/apiService';
import { useNavigation } from '@react-navigation/native';

const HomeMemberPage = () => {
  const navigation = useNavigation();
  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [officerId, setOfficerId] = useState<number | null>(null);
  const [collectionOfficerId, setCollectionOfficerId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [numberId, setNumberId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>(''); // ✅
  const [billDate, setBillDate] = useState<string>(''); // ✅

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
            if (latestBill.payment_status) setPaymentStatus(latestBill.payment_status); // ✅
            if (latestBill.bill_date) setBillDate(latestBill.bill_date); // ✅
          }
        } catch (error) {
          console.error('Failed to fetch latest bill', error);
        }
      }
    };
    loadBill();
  }, [officerId]);

  const getDueDateMessage = () => {
    if (!billDate) return '';
    const date = new Date(billDate);
    const month = date.getMonth() + 2;
    const thaiMonths = [
      '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const displayMonth = thaiMonths[month > 12 ? 1 : month];
    const year = date.getFullYear() + (month > 12 ? 1 : 0) + 543;

    switch (paymentStatus) {
      case 'Gray':
      case 'Yellow':
        return `โปรดชำระก่อนวันที่ 7 ${displayMonth} ${year}`;
      case 'Orange':
        return `โปรดชำระก่อนวันที่ 14 ${displayMonth} ${year}`;
      case 'Red':
        return 'โปรดชำระก่อนเจ้าหน้าที่ตัดท่อน้ำ';
      case 'Green':
        return 'ชำระเงินเสร็จสิ้น';
      default:
        return '';
    }
  };

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
          <Text style={styles.infoBoxTitle}>ยอดค่าใช้จ่ายน้ำประปา</Text>
        </View>
        <View style={styles.infoBoxRight}>
          <Text style={styles.infoBoxAmount}>
            {paymentStatus === 'Green'
              ? 'ชำระเงินเสร็จสิ้น'
              : amountDue !== null
                ? `${amountDue} บาท`
                : '...'}
          </Text>
        </View>
      </View>

      <Text style={styles.dueDateText}>{getDueDateMessage()}</Text>

      {/* Button Grid */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (collectionOfficerId)
              navigation.navigate('PaymentPage', {
                officerId: collectionOfficerId,
                fullName: `${firstName} ${lastName}`,
                billDate,
                paymentStatus,
                amountDue,
              });
          }}
        >
          <Text style={styles.emoji}>💵</Text>
          <Text style={styles.buttonText}>ชำระเงิน</Text>
        </TouchableOpacity>


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

        <TouchableOpacity style={styles.button} onPress={goToUserProfile}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.buttonText}>บัญชีผู้ใช้งาน</Text>
        </TouchableOpacity>

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
