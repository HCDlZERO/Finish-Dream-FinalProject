import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

const LoginScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ visible: boolean; message?: string }>({ visible: false });
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ กันพลาดก่อนยิง API
  const validate = () => {
    const { username, password, role } = formData;
    if (!username.trim() || !password.trim() || !role.trim()) {
      return 'กรุณากรอก Username/Password และเลือก Role ให้ครบถ้วน';
    }
    if (username.includes('@')) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim());
      if (!emailOk) return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (password.length < 6) {
      return 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร';
    }
    return '';
  };

  const handleLogin = async () => {
    const msg = validate();
    if (msg) return setPopup({ visible: true, message: msg });

    try {
      setLoading(true);
      const response = await loginUser(formData);

      if (response?.token && response?.username && response?.role && response?.id) {
        const userWithOfficerId = {
          username: response.username,
          role: response.role,
          token: response.token,
          officerId: response.id,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userWithOfficerId));
        navigation.navigate(`Home${response.role}Page`);
      } else {
        setPopup({
          visible: true,
          message: 'ไม่สามารถเข้าสู่ระบบได้: ข้อมูลโต้ตอบจากเซิร์ฟเวอร์ไม่ครบถ้วน',
        });
      }
    } catch (error: any) {
      const friendly = error?.message?.toString?.() || 'เข้าสู่ระบบไม่สำเร็จ โปรดลองใหม่อีกครั้ง';
      setPopup({ visible: true, message: friendly });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header / Brand */}
        <View style={styles.headerRow}>
          <View style={{ width: 64 }} />
          <Text style={styles.brand}>
            Nam<Text style={styles.brandAccent}>Jai</Text>
          </Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please login to your account</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {/* Username */}
          <Text style={styles.inputLabel}>Username / Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@domain.com หรือ username"
            placeholderTextColor="#7FA3C1"
            autoCapitalize="none"
            keyboardType="email-address"
            value={formData.username}
            onChangeText={(v) => handleChange('username', v)}
            editable={!loading}
          />

          {/* Password */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#7FA3C1"
              secureTextEntry={!showPwd}
              value={formData.password}
              onChangeText={(v) => handleChange('password', v)}
              editable={!loading}
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPwd(s => !s)}
              android_ripple={{ color: '#e0eef9' }}
            >
              <Text style={styles.eyeText}>{showPwd ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          {/* Role */}
          <Text style={styles.inputLabel}>Role</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              enabled={!loading}
            >
              <Picker.Item label="Select Role" value="" />
              <Picker.Item label="HeadOfficer" value="HeadOfficer" />
              <Picker.Item label="Member" value="Member" />
              <Picker.Item label="Officer" value="Officer" />
              <Picker.Item label="Technician" value="Technician" />
            </Picker>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>{loading ? 'Signing in...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ResetPasswordPage')}
            disabled={loading}
            style={{ alignSelf: 'center', marginTop: 10 }}
          >
            <Text style={styles.forgotPassword}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>

        {/* Register Row */}
        <View style={styles.registerRow}>
          <Text style={styles.registerLabel}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterOfficer')} disabled={loading}>
            <Text style={styles.registerLink}> Register as Officer </Text>
          </TouchableOpacity>
          <Text style={styles.registerLabel}>or</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterMember')} disabled={loading}>
            <Text style={styles.registerLink}> Member</Text>
          </TouchableOpacity>
        </View>

        {/* Popup */}
        <ErrorPopup
          visible={popup.visible}
          message={popup.message}
          onClose={() => setPopup({ visible: false, message: '' })}
          title="เข้าสู่ระบบไม่สำเร็จ"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  brand: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0D2A4A',
  },
  brandAccent: { color: '#FF4081' },

  // Title
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12, alignItems: 'flex-start' },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A' },
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
  inputWrap: { position: 'relative' },
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
    marginBottom: 8,
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

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#C7DFEF',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    overflow: 'hidden',
  },

  // Buttons
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
    marginTop: 6,
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },

  forgotPassword: { color: '#4E6E90', fontSize: 12, marginTop: 6 },

  // Register
  registerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
  },
  registerLabel: { color: '#4E6E90', fontSize: 12 },
  registerLink: { color: '#0288D1', fontWeight: '800', fontSize: 12 },

});
