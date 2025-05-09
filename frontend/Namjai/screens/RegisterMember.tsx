import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { registerUser } from '../services/apiService';

const RegisterMember = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    numberId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      const response = await registerUser({ ...formData, role: 'Member' });
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
          <View key={key} style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              placeholder={label}
              placeholderTextColor="#ffffff"
              style={styles.input}
              secureTextEntry={key.includes('password')}
              onChangeText={(value) => handleChange(key, value)}
            />
          </View>
        ))}

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
    backgroundColor: '#42b8d3',
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 5,
  },
  subtext: {
    fontSize: 12,
    color: '#e0f7fa',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 6,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#81d4fa',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#b0bec5',
    borderRadius: 30,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

export default RegisterMember;
