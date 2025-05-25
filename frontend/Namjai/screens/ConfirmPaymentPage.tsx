import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { submitConfirmPayment } from '../services/apiService';

const ConfirmPaymentPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { officerId, firstName, lastName, amountDue } = route.params as {
    officerId: number;
    firstName: string;
    lastName: string;
    amountDue: number;
  };

  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('');
  const [imageBase64Raw, setImageBase64Raw] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    setConfirmDate(`${year}-${month}-${day}`);
    setConfirmTime(`${hours}:${minutes}`);
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission, {
          title: 'Permission Request',
          message: 'แอปนี้ต้องการเข้าถึงคลังรูปภาพของคุณ',
          buttonNeutral: 'Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('ต้องอนุญาตเข้าถึงรูปภาพ');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.error('ImagePicker Error: ', response.errorMessage);
          Alert.alert('เกิดข้อผิดพลาด', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.base64) {
            setImageBase64Raw(asset.base64);
          }
        }
      },
    );
  };

  const handleSubmit = async () => {
    if (!imageBase64Raw) {
      Alert.alert('กรุณาอัปโหลดรูปภาพยืนยันการชำระเงิน');
      return;
    }

    const payload = {
      firstName,
      lastName,
      amountDue,
      confirmDate,
      confirmTime,
      officerName: String(officerId),
      confirmImage: `data:image/jpeg;base64,${imageBase64Raw}`,
    };

    console.log('🚀 payload:', JSON.stringify(payload, null, 2));
    try {
      await submitConfirmPayment(payload);
      Alert.alert('ยืนยันสำเร็จ', 'ส่งข้อมูลเรียบร้อยแล้ว');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting payment confirmation:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถส่งข้อมูลได้');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.logo}>
          NAM<Text style={styles.logoHighlight}>JAI</Text>
        </Text>
        <Text style={styles.menuIcon}>☰</Text>
      </SafeAreaView>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
        {imageBase64Raw ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageBase64Raw}` }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.imageText}>เพิ่มไฟล์</Text>
        )}
      </TouchableOpacity>

      {/* Form */}
      <Text style={styles.label}>NAME</Text>
      <TextInput style={styles.input} value={`${firstName} ${lastName}`} editable={false} />

      <Text style={styles.label}>DATE</Text>
      <TextInput style={styles.input} value={confirmDate.split('-').reverse().join('/')} editable={false} />

      <Text style={styles.label}>TIME</Text>
      <TextInput style={styles.input} value={`${confirmTime} น.`} editable={false} />

      <Text style={styles.label}>AMOUNT OF MONEY</Text>
      <TextInput style={styles.input} value={`${amountDue} บาท`} editable={false} />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>ยืนยัน</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E1F5FE',
    padding: 20,
  },
  header: {
    backgroundColor: '#0288D1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoHighlight: {
    color: '#FF4081',
  },
  menuIcon: {
    fontSize: 24,
    color: 'white',
  },
  imageBox: {
    height: 250,
    borderWidth: 2,
    borderColor: '#0288D1',
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  imageText: {
    color: '#0288D1',
    fontSize: 18,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  label: {
    marginTop: 15,
    color: '#0288D1',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#0288D1',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#0288D1',
    marginTop: 30,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmPaymentPage;
