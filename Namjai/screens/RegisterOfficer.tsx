import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';
import { registerUser } from '../services/apiService';
import { Picker } from '@react-native-picker/picker';


const RegisterOfficer = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    numberId: '',
    role: '', // Default role
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      const response = await registerUser(formData); // ส่งข้อมูลไปยัง API
      console.log('API Response:', response);

      if (response.message === 'ลงทะเบียนสำเร็จ') {
        Alert.alert('สำเร็จ', response.message, [
          { text: 'OK', onPress: () => navigation.navigate('Login') }, // Navigate to Login
        ]);
      } else {
        Alert.alert('Error', response.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Officer</Text>
      {Object.keys(formData).map((key) =>
        key === 'role' ? (
          <Picker
            key={key}
            selectedValue={formData.role}
            style={styles.input}
            onValueChange={(itemValue) => handleChange('role', itemValue)}
          >
            <Picker.Item label="Officer" value="Officer" />
            <Picker.Item label="Technician" value="Technician" />
            <Picker.Item label="HeadOfficer" value="HeadOfficer" />
          </Picker>
        ) : (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={key}
            secureTextEntry={key.includes('password')}
            onChangeText={(value) => handleChange(key, value)}
          />
        )
      )}
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5, borderColor: '#ccc' },
});

export default RegisterOfficer;
