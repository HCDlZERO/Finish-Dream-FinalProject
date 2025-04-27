import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, ScrollView, StyleSheet,
} from 'react-native';
import { addUser } from '../services/apiService'; // ✅ เรียกใช้ API จาก service

const AddMemberPage = () => {
  const [form, setForm] = useState({
    numberId: '',
    firstName: '',
    lastName: '',
    houseNumber: '',
    street: '',
    district: '',
    city: '',
    postalCode: '',
    role: 'Member',
    registrationDate: new Date().toISOString().split('T')[0],
    zone: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        zone: parseInt(form.zone),
      };
      await addUser(payload); // ✅ เรียกผ่าน service
      Alert.alert('สำเร็จ', 'เพิ่มสมาชิกเรียบร้อยแล้ว');
      setForm({ ...form, numberId: '', firstName: '', lastName: '', houseNumber: '', street: '', district: '', city: '', postalCode: '', zone: '' });
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มสมาชิกได้');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>เพิ่มสมาชิกใหม่</Text>

      {[
        { label: 'เลขสมาชิก (numberId)', key: 'numberId' },
        { label: 'ชื่อ', key: 'firstName' },
        { label: 'นามสกุล', key: 'lastName' },
        { label: 'บ้านเลขที่', key: 'houseNumber' },
        { label: 'ถนน', key: 'street' },
        { label: 'เขต/อำเภอ', key: 'district' },
        { label: 'จังหวัด', key: 'city' },
        { label: 'รหัสไปรษณีย์', key: 'postalCode' },
        { label: 'โซน (zone)', key: 'zone' },
      ].map(({ label, key }) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={form[key as keyof typeof form]}
            onChangeText={(value) => handleChange(key, value)}
          />
        </View>
      ))}

      <Button title="เพิ่มสมาชิก" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
});

export default AddMemberPage;
