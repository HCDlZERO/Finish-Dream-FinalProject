import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, Alert, TouchableOpacity
} from 'react-native';
import { createBill } from '../services/apiService';

const CreateBills = ({ route, navigation }: any) => {
  const { officerId, users = [] } = route.params; // ✅ ป้องกัน undefined

  const [zone, setZone] = useState('');
  const [unitsMap, setUnitsMap] = useState<{ [numberId: string]: string }>({});

  const handleUnitChange = (numberId: string, value: string) => {
    setUnitsMap(prev => ({ ...prev, [numberId]: value }));
  };

  const handleSubmitAll = async () => {
    if (!zone) {
      Alert.alert('⚠️ กรุณาใส่ Zone ก่อน');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      for (const user of users) {
        const unitsUsed = parseFloat(unitsMap[user.numberId] || '0');
        if (unitsUsed <= 0) continue;

        const payload = {
          numberId: user.numberId,
          collectionOfficerId: parseInt(officerId),
          billDate: today,
          unitsUsed,
          amountDue: unitsUsed * 14 + 20,
          paymentStatus: 'Gray',
          zone: parseInt(zone),
        };

        console.log('📤 ส่งข้อมูลบิล:', payload);
        await createBill(payload);
      }

      Alert.alert('✅ สำเร็จ', 'สร้างบิลให้ลูกบ้านที่เลือกเรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('❌ ผิดพลาด', 'ไม่สามารถสร้างบิลได้');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧾 สร้างบิลสำหรับลูกบ้านทุกคน</Text>

      <Text style={styles.label}>📍 Zone</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={zone}
        onChangeText={setZone}
        placeholder="กรอกหมายเลขโซน"
        placeholderTextColor="#aaa"
      />

      {Array.isArray(users) && users.map((user: any) => (
        <View key={user.numberId} style={styles.userCard}>
          <Text style={styles.userName}>👤 {user.firstName} {user.lastName}</Text>
          <TextInput
            placeholder="หน่วยค่าน้ำ"
            keyboardType="numeric"
            style={styles.input}
            value={unitsMap[user.numberId] || ''}
            onChangeText={(val) => handleUnitChange(user.numberId, val)}
            placeholderTextColor="#bbb"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAll}>
        <Text style={styles.submitButtonText}>💧 สร้างบิลทั้งหมด</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateBills;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e3f2fd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#01579b',
    textAlign: 'center',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#455a64',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
