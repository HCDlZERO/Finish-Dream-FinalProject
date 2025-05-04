import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Modal } from 'react-native';
import { requestOtp, verifyOtp, resetPassword } from '../services/apiService';

const ResetPasswordPage = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestOtp = async () => {
    try {
      await requestOtp(email);
      setShowOtpInput(true);
      Alert.alert('✅ Success', 'OTP has been sent to your email');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(email, otp);
      setShowResetModal(true);
    } catch (error) {
      Alert.alert('❌ Error', 'OTP is invalid or expired');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('❌ Error', 'Passwords do not match');
      return;
    }
    try {
      await resetPassword(email, newPassword);
      Alert.alert('✅ Success', 'Password has been reset');
      setShowResetModal(false);
      navigation.navigate('LoginScreen');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <Button title="Send OTP" onPress={handleRequestOtp} />

      {showOtpInput && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </View>
      )}

      <Modal visible={showResetModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />
            <TextInput
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <Button title="Reset Password" onPress={handleResetPassword} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#e0f7fa',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
});

export default ResetPasswordPage;
