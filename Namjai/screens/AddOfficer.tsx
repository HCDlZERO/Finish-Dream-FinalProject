import React, { useState } from 'react';
import {
  View, Text, TextInput, Button,
  Alert, StyleSheet, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addHeadOfficer } from '../services/apiService';

const AddOfficer = ({ navigation }: any) => {
  const [numberId, setNumberId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('Officer');
  const [zoneId, setZoneId] = useState('');

  const handleSubmit = async () => {
    if (numberId.length !== 13) {
      Alert.alert('⚠️ ข้อผิดพลาด', 'Number ID ต้องมีความยาว 13 หลัก');
      return;
    }

    try {
      const payload = {
        numberId,
        firstName,
        lastName,
        role,
        zoneId: zoneId ? parseInt(zoneId) : 0
      };

      await addHeadOfficer(payload);
      Alert.alert('✅ สำเร็จ', 'เพิ่มเจ้าหน้าที่เรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      console.error('❌ เพิ่มเจ้าหน้าที่ล้มเหลว:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มเจ้าหน้าที่ได้');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>➕ เพิ่มเจ้าหน้าที่ใหม่</Text>

      <TextInput
        style={styles.input}
        placeholder="🆔 Number ID (13 หลัก)"
        value={numberId}
        onChangeText={setNumberId}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="👤 First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="👥 Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>🎖 เลือก Role</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={role}
          onValueChange={(value) => setRole(value)}
        >
          <Picker.Item label="Officer" value="Officer" />
          <Picker.Item label="Technician" value="Technician" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="📍 Zone ID (ไม่ใส่ = 0)"
        value={zoneId}
        onChangeText={setZoneId}
        keyboardType="number-pad"
      />

      <View style={styles.buttonContainer}>
        <Button title="💾 บันทึกข้อมูล" color="#1976d2" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

export default AddOfficer;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#90caf9',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#90caf9',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});
