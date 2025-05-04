import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, ScrollView,
  StyleSheet, TouchableOpacity
} from 'react-native';
import { addUser } from '../services/apiService';

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
      await addUser(payload);
      Alert.alert('สำเร็จ', 'เพิ่มสมาชิกเรียบร้อยแล้ว');
      setForm({ ...form, numberId: '', firstName: '', lastName: '', houseNumber: '', street: '', district: '', city: '', postalCode: '', zone: '' });
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มสมาชิกได้');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>➕ เพิ่มสมาชิกใหม่</Text>

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
            placeholder={`กรอก ${label}`}
            placeholderTextColor="#aaa"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>✅ เพิ่มสมาชิก</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddMemberPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#01579b',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#455a64',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    color: '#263238',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
