import React, { useState } from 'react';
import {
  View, TextInput, Text, StyleSheet, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { registerUser } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

const FIELDS = [
  { key: 'numberId', label: 'ID CARD NUMBER' },
  { key: 'firstName', label: 'NAME' },
  { key: 'lastName', label: 'SURNAME' },
  { key: 'phoneNumber', label: 'NUMBER PHONE' },
  { key: 'email', label: 'EMAIL' },
  { key: 'password', label: 'PASSWORD' },
  { key: 'confirmPassword', label: 'CONFIRM PASSWORD' },
] as const;

const RegisterMember = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    numberId: '', firstName: '', lastName: '', phoneNumber: '',
    email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const handleChange = (name: string, value: string) => {
    // กรองตัวเลขให้ numberId / phoneNumber
    if (name === 'numberId') value = value.replace(/[^0-9]/g, '').slice(0, 13);
    if (name === 'phoneNumber') value = value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { numberId, firstName, lastName, phoneNumber, email, password, confirmPassword } = formData;
    if (!numberId.trim() || !firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim() || !confirmPassword.trim())
      return 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง';
    if (!/^\d{13}$/.test(numberId)) return 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    if (!/^0\d{8,9}$/.test(phoneNumber)) return 'เบอร์โทรต้องขึ้นต้นด้วย 0 และยาว 9–10 หลัก';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (password.length < 8) return 'รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร';
    if (password !== confirmPassword) return 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
    return '';
  };

  const handleRegister = async () => {
    const msg = validate();
    if (msg) return setPopup({ visible: true, message: msg });

    try {
      setLoading(true);
      const res = await registerUser({ ...formData, role: 'Member' });
      if (res?.message === 'ลงทะเบียนสำเร็จ') {
        navigation.navigate('Login');
      } else {
        setPopup({ visible: true, message: res?.message || 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่' });
      }
    } catch (e: any) {
      setPopup({ visible: true, message: e?.message?.toString?.() || 'เกิดข้อผิดพลาดระหว่างลงทะเบียน' });
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (key: string) => ({
    secureTextEntry:
      key === 'password' ? !showPwd :
      key === 'confirmPassword' ? !showPwd2 :
      false,
    keyboardType:
      key === 'email' ? 'email-address' :
      key === 'numberId' || key === 'phoneNumber' ? 'numeric' : 'default',
    maxLength: key === 'numberId' ? 13 : key === 'phoneNumber' ? 10 : undefined,
    autoCapitalize: key === 'email' ? 'none' : 'words',
    editable: !loading,
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.85}
            style={styles.backChip}
          >
            <Text style={styles.backText}>กลับ</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>
            Nam<Text style={styles.brandAccent}>Jai</Text>
          </Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Create new Account</Text>
          <Text style={styles.subtitle}>ลงทะเบียนสมาชิกใหม่ • ใช้เวลาเพียงไม่กี่นาที</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {FIELDS.map(({ key, label }) => {
            const isPwd = key === 'password';
            const isPwd2 = key === 'confirmPassword';
            return (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>{label}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    placeholder={label}
                    placeholderTextColor="#7FA3C1"
                    style={styles.input}
                    value={(formData as any)[key]}
                    onChangeText={(v) => handleChange(key, v)}
                    {...inputProps(key)}
                  />
                  {(isPwd || isPwd2) && (
                    <Pressable
                      onPress={() => (isPwd ? setShowPwd(s => !s) : setShowPwd2(s => !s))}
                      style={styles.eyeBtn}
                      android_ripple={{ color: '#e0eef9' }}
                    >
                      <Text style={styles.eyeText}>{(isPwd ? showPwd : showPwd2) ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  )}
                </View>
                {key === 'numberId' && <Text style={styles.helper}>กรอกตัวเลข 13 หลัก (เช่น 1103701234567)</Text>}
                {key === 'phoneNumber' && <Text style={styles.helper}>ขึ้นต้นด้วย 0 ความยาว 9–10 หลัก</Text>}
                {key === 'password' && <Text style={styles.helper}>อย่างน้อย 8 ตัวอักษร • แนะนำให้มีตัวเลขและอักษรผสม</Text>}
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.primaryText}>{loading ? 'Submitting...' : 'SIGN UP'}</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('LoginScreen')}
            disabled={loading}
          >
            <Text style={styles.secondaryText}>Already Registered? Log in</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ErrorPopup
        visible={popup.visible}
        message={popup.message}
        onClose={() => setPopup({ visible: false, message: '' })}
        title="ลงทะเบียนไม่สำเร็จ"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E9F4FF', // โทนเดียวกับหน้าอื่นๆ
    flexGrow: 1,
    alignItems: 'center',
  },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  backChip: {
    backgroundColor: '#E1EEF7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    minWidth: 64,
    alignItems: 'center',
  },
  backText: { color: '#0D2A4A', fontWeight: '700' },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0D2A4A',
  },
  brandAccent: { color: '#FF4081' },

  // Title
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A', textAlign: 'left' },
  subtitle: { fontSize: 12, color: '#4E6E90', marginTop: 4 },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1EEF7',
  },

  inputLabel: {
    fontSize: 12,
    color: '#4E6E90',
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C7DFEF',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 14,
    color: '#0D2A4A',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F4FAFF',
    borderWidth: 1,
    borderColor: '#C7DFEF',
  },
  eyeText: { color: '#0D2A4A', fontWeight: '800', fontSize: 11 },

  helper: { fontSize: 11, color: '#7FA3C1', marginTop: 6 },

  // Actions
  actionsRow: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
    marginTop: 14,
  },
  primaryBtn: {
    backgroundColor: '#0288D1',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#0288D1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },

  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9BC6E3',
    backgroundColor: '#F4FAFF',
    alignItems: 'center',
  },
  secondaryText: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },
});

export default RegisterMember;
