import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/apiService';

const LoginScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    try {
      const response = await loginUser(formData);
      if (response.token && response.username && response.role && response.id) {
        const userWithOfficerId = {
          username: response.username,
          role: response.role,
          token: response.token,
          officerId: response.id,
        };
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
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Please login to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#555"
        onChangeText={(value) => handleChange('username', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        secureTextEntry
        onChangeText={(value) => handleChange('password', value)}
      />
      <View style={styles.pickerContainer}>
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
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordPage')}>
        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      </TouchableOpacity>

      <View style={styles.registerRow}>
        <Text style={styles.registerLabel}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterOfficer')}>
          <Text style={styles.registerLink}> Register as Officer </Text>
        </TouchableOpacity>
        <Text style={styles.registerLabel}>or</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterMember')}>
          <Text style={styles.registerLink}> Member</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0077b6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#d0e8ff',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#caf0f8',
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#caf0f8',
    borderRadius: 10,
    width: '100%',
    marginBottom: 25,
  },
  picker: {
    height: 50,
    color: '#000',
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#023e8a',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#d0e8ff',
    fontSize: 13,
    marginBottom: 20,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  registerLabel: {
    color: '#e0f2ff',
    fontSize: 13,
  },
  registerLink: {
    color: '#90e0ef',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default LoginScreen;
