import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, Alert
} from 'react-native';
import { createBill } from '../services/apiService';

const CreateBills = ({ route, navigation }: any) => {
  const { officerId, users } = route.params; // 🟡 รับ users ทั้งกลุ่มมาจากหน้า HomeOfficerPage

  const [zone, setZone] = useState('');
  const [unitsMap, setUnitsMap] = useState<{ [numberId: string]: string }>({});

  const handleUnitChange = (numberId: string, value: string) => {
    setUnitsMap(prev => ({ ...prev, [numberId]: value }));
  };

  const handleSubmitAll = async () => {
    if (!zone) {
      Alert.alert('กรุณาใส่ Zone ก่อน');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      for (const user of users) {
        const unitsUsed = parseFloat(unitsMap[user.numberId] || '0');

        if (unitsUsed <= 0) continue; // ข้ามคนที่ไม่ได้กรอกหน่วย

        const payload = {
          numberId: user.numberId,
          collectionOfficerId: parseInt(officerId),
          billDate: today,
          unitsUsed: unitsUsed,
          amountDue: unitsUsed * 14 + 20,
          paymentStatus: 'Gray',
          zone: parseInt(zone)
        };

        console.log('📤 ส่งข้อมูลบิล:', payload);
        await createBill(payload);
      }

      Alert.alert('สำเร็จ', 'สร้างบิลให้ลูกบ้านที่เลือกเรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถสร้างบิลได้');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>สร้างบิลสำหรับลูกบ้านทุกคน</Text>

      <Text style={styles.label}>Zone</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={zone}
        onChangeText={setZone}
      />

      {users.map((user: any) => (
        <View key={user.numberId} style={styles.userBlock}>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <TextInput
            placeholder="หน่วยค่าน้ำ"
            keyboardType="numeric"
            style={styles.input}
            value={unitsMap[user.numberId] || ''}
            onChangeText={(val) => handleUnitChange(user.numberId, val)}
          />
        </View>
      ))}

      <Button title="สร้างบิลทั้งหมด" onPress={handleSubmitAll} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  userBlock: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10
  },
  userName: {
    fontSize: 16,
    marginBottom: 5,
  }
});

export default CreateBills;
