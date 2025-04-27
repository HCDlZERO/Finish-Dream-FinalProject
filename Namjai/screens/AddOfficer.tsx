import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet
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
      Alert.alert('รหัสผิด', 'Number ID ต้องมี 13 หลัก');
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
      Alert.alert('สำเร็จ', 'เพิ่มเจ้าหน้าที่เรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเพิ่มเจ้าหน้าที่ได้');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ เพิ่มเจ้าหน้าที่</Text>

      <TextInput
        style={styles.input}
        placeholder="Number ID (13 หลัก)"
        value={numberId}
        onChangeText={setNumberId}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={{ marginTop: 10 }}>เลือก Role</Text>
      <Picker selectedValue={role} onValueChange={(value) => setRole(value)}>
        <Picker.Item label="Officer" value="Officer" />
        <Picker.Item label="Technician" value="Technician" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Zone ID (ถ้าไม่ใส่ = 0)"
        value={zoneId}
        onChangeText={setZoneId}
        keyboardType="number-pad"
      />

      <Button title="บันทึก" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  }
});

export default AddOfficer;
