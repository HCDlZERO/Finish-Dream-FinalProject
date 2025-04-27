import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchBankInfoByOfficerId } from '../services/apiService';

const BankTransferPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { officerId, fullName } = route.params as { officerId: number; fullName: string };

  const [bankName, setBankName] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBankInfo = async () => {
      try {
        const data = await fetchBankInfoByOfficerId(officerId);
        if (data && data.data) {  // ✅ แก้ตรงนี้
          setBankName(data.data.bank);
          setBankAccountId(data.data.bank_id);
        }
      } catch (error) {
        console.error('Failed to fetch Bank Info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBankInfo();
  }, [officerId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfoRow}>
        <Text style={styles.userInfo}>{fullName || ''}</Text>
        <Text style={styles.userInfo}>ลูกบ้าน</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBoxContainer}>
        <View style={styles.infoBoxLeft}>
          <Text style={styles.infoBoxTitle}>ยอดค่าใช้จ่ายน้ำป่า</Text>
        </View>
        <View style={styles.infoBoxRight}>
          <Text style={styles.infoBoxAmount}>160 บาท</Text>
        </View>
      </View>
      <Text style={styles.dueDateText}>โปรดชำระก่อนวันที่ 7 พฤศจิกายน 2567</Text>

      {/* Bank Info Section */}
      {loading ? (
        <ActivityIndicator size="large" color="#0288D1" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.bankContainer}>
          <Text style={styles.bankName}>{bankName}</Text>

          <View style={styles.accountBox}>
            <Text style={styles.accountLabel}>ชื่อบัญชี:</Text>
            <Text style={styles.accountText}>{fullName}</Text>

            <Text style={styles.accountLabel}>เลขบัญชี:</Text>
            <Text style={styles.accountText}>{bankAccountId}</Text>
          </View>
        </View>
      )}
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
  logo: { fontSize: 24, fontWeight: 'bold', color: 'white' },
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
  bankContainer: {
    backgroundColor: '#0288D1',
    marginHorizontal: 30,
    marginTop: 30,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  bankName: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  accountBox: {
    backgroundColor: '#E1F5FE',
    width: '100%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'flex-start',
  },
  accountLabel: {
    fontSize: 14,
    color: '#0288D1',
    marginTop: 5,
    fontWeight: 'bold',
  },
  accountText: {
    fontSize: 16,
    color: '#0288D1',
    marginBottom: 10,
  },
});

export default BankTransferPage;
