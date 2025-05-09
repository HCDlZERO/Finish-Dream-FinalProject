import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { officerId, fullName, numberId, billDate, paymentStatus, amountDue } = route.params as {
    officerId: number;
    fullName: string;
    numberId: string;
    billDate: string;
    paymentStatus: string;
    amountDue: number;
  };

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

      {/* Payment Options */}
      <View style={styles.optionGrid}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() =>
            navigation.navigate('QRCodePage', {
              officerId,
              fullName,
              billDate,
              paymentStatus,
              amountDue, // ✅ เพิ่มตรงนี้
            })
          }
        >
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.label}>QRCode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() =>
            navigation.navigate('BankTransferPage', {
              officerId,
              fullName,
              billDate,
              paymentStatus,
              amountDue,
            })
          }
        >
          <Text style={styles.icon}>🏦</Text>
          <Text style={styles.label}>ธนาคาร</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() =>
            navigation.navigate('CashPaymentPage', {
              numberId,
              fullName,
              billDate,
              paymentStatus,
              amountDue,
            })
          }
        >
          <Text style={styles.icon}>💵</Text>
          <Text style={styles.label}>เงินสด</Text>
        </TouchableOpacity>
      </View>

      {/* Officer ID for Debug */}
      <Text style={styles.officerIdText}>Officer ID: {officerId}</Text>
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
  optionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    flexWrap: 'wrap',
  },
  paymentButton: {
    backgroundColor: 'white',
    width: 100,
    height: 120,
    margin: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  icon: {
    fontSize: 40,
    color: '#0288D1',
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: '#0288D1',
    fontWeight: 'bold',
  },
  officerIdText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
});

export default PaymentPage;
