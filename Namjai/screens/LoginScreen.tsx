import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { loginUser } from '../services/apiService';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' });
  const [userData, setUserData] = useState<any>(null); // เก็บข้อมูลผู้ใช้ที่ล็อกอินแล้ว

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    try {
      const response = await loginUser(formData);
      console.log('API Response:', response);

      // ตรวจสอบว่า response มี id หรือไม่
      if (response.token && response.username && response.role && response.id) {
        // เปลี่ยนชื่อจาก id เป็น officerId
        const userWithOfficerId = {
          username: response.username,
          role: response.role,
          token: response.token,
          officerId: response.id, // เปลี่ยน id เป็น officerId
        };

        // เก็บข้อมูลใน state
        setUserData(userWithOfficerId);

        // เก็บข้อมูลใน AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userWithOfficerId));

        Alert.alert('Login Successful', `Welcome, ${response.username}`);
        navigation.navigate(`Home${response.role}Page`);
      } else {
        Alert.alert('Error', 'Invalid credentials or missing information');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(value) => handleChange('username', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={(value) => handleChange('password', value)}
      />
      <Picker
        selectedValue={formData.role}
        style={styles.picker}
        onValueChange={(value) => handleChange('role', value)}
      >
        <Picker.Item label="Select Role" value="" />
        <Picker.Item label="HeadOfficer" value="HeadOfficer" />
        <Picker.Item label="Member" value="Member" />
        <Picker.Item label="Officer" value="Officer" />
        <Picker.Item label="Technician" value="Technician" />
      </Picker>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5, borderColor: '#ccc' },
  picker: { height: 50, marginBottom: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
});

export default LoginScreen;
