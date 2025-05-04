import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet,
  Image, TouchableOpacity, ScrollView
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateOfficerInfo } from '../services/apiService';

const SettingOfficerInfo = ({ route }: any) => {
  const { officerId } = route.params;

  const [lineId, setLineId] = useState('');
  const [bank, setBank] = useState('');
  const [bankId, setBankId] = useState('');
  const [qrImageUri, setQrImageUri] = useState('');
  const [qrBase64, setQrBase64] = useState('');

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 800,
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setQrImageUri(asset.uri || '');
      setQrBase64(asset.base64 || '');
    } else {
      Alert.alert('การเลือกรูปล้มเหลว');
    }
  };

  const handleSubmit = async () => {
    if (!officerId) {
      Alert.alert('ขาดข้อมูล officerId');
      return;
    }

    const payload: any = { officerId };
    if (lineId) payload.lineId = lineId;
    if (bank) payload.bank = bank;
    if (bankId) payload.bankId = bankId;
    if (qrBase64) payload.qrCode = `data:image/png;base64,${qrBase64}`;

    try {
      const result = await updateOfficerInfo(payload);
      Alert.alert('✅ อัปเดตสำเร็จ', result);
    } catch (error: any) {
      console.error('❌ Update Error:', error);
      Alert.alert('❌ อัปเดตไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>⚙️ ตั้งค่าข้อมูลเจ้าหน้าที่</Text>

      <TextInput
        style={styles.input}
        placeholder="Line ID"
        value={lineId}
        onChangeText={setLineId}
      />
      <TextInput
        style={styles.input}
        placeholder="Bank"
        value={bank}
        onChangeText={setBank}
      />
      <TextInput
        style={styles.input}
        placeholder="Bank ID"
        value={bankId}
        onChangeText={setBankId}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        <Text style={styles.imagePickerText}>📷 เลือกรูป QR Code</Text>
      </TouchableOpacity>

      {qrImageUri !== '' && (
        <Image
          source={{ uri: qrImageUri }}
          style={styles.qrImage}
          resizeMode="contain"
        />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>💾 บันทึกข้อมูล</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingOfficerInfo;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#01579b',
    marginBottom: 25,
    textAlign: 'center',
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
    marginBottom: 15,
  },
  imagePicker: {
    backgroundColor: '#4fc3f7',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
