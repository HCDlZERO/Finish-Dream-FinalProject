import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Image, Alert
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateOfficerInfo } from '../services/apiService';

const SettingOfficerInfo = ({ route }: any) => {
  const { officerId } = route.params; // ✅ ใช้ officerId แทน numberId

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
      quality: 0.8
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
    <View style={styles.container}>
      <Text style={styles.title}>ตั้งค่าข้อมูลเจ้าหน้าที่</Text>

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

      <Button title="เลือกรูป QR Code" onPress={handlePickImage} />
      {qrImageUri !== '' && (
        <Image source={{ uri: qrImageUri }} style={{ width: 200, height: 200, marginVertical: 10 }} />
      )}

      <Button title="💾 บันทึกข้อมูล" onPress={handleSubmit} color="#2196F3" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15
  }
});

export default SettingOfficerInfo;
