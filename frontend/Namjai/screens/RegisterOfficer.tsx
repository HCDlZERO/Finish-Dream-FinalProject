import React, { useState } from 'react';
import {
  TextInput,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/apiService';

const RegisterOfficer = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    numberId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Officer',
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      const response = await registerUser(formData);
      if (response.message === 'ลงทะเบียนสำเร็จ') {
        Alert.alert('สำเร็จ', response.message, [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create new{'\n'}Account</Text>
        <Text style={styles.subtext}>Already Registered? Log in here.</Text>

        {[
          { key: 'numberId', label: 'ID CARD NUMBER' },
          { key: 'firstName', label: 'NAME' },
          { key: 'lastName', label: 'SURNAME' },
          { key: 'phoneNumber', label: 'NUMBER PHONE' },
          { key: 'email', label: 'EMAIL' },
          { key: 'password', label: 'PASSWORD' },
          { key: 'confirmPassword', label: 'CONFIRM PASSWORD' },
        ].map(({ key, label }) => (
          <TextInput
            key={key}
            placeholder={label}
            placeholderTextColor="#ffffff"
            style={styles.input}
            secureTextEntry={key.includes('password')}
            onChangeText={(value) => handleChange(key, value)}
          />
        ))}

        <Text style={styles.label}>ROLE</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.role}
            onValueChange={(value) => handleChange('role', value)}
            style={styles.picker}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Officer" value="Officer" />
            <Picker.Item label="Technician" value="Technician" />
            <Picker.Item label="HeadOfficer" value="HeadOfficer" />
          </Picker>
        </View>

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#2193b0',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 12,
    color: '#e0f7fa',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#b3e5fc',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#b3e5fc',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#000',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#b0bec5',
    borderRadius: 30,
    marginTop: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

export default RegisterOfficer;
