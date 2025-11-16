import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform, ScrollView, Pressable
} from 'react-native';
import { requestOtp, verifyOtp, resetPassword } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

const OTP_LENGTH = 6;

const ResetPasswordPage = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [cooldown, setCooldown] = useState(0); // วินาทีสำหรับส่ง OTP ซ้ำ
  const [popup, setPopup] = useState<{visible:boolean; title?:string; message?:string}>({ visible:false });

  const otpHiddenRef = useRef<TextInput>(null);

  /** ---------- Validators ---------- */
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const passwordStrength = useMemo(() => {
    const p = newPassword;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-4
  }, [newPassword]);

  const strengthLabel = ['อ่อนมาก', 'อ่อน', 'ปานกลาง', 'ดี', 'แข็งแรง'][passwordStrength];

  /** ---------- Cooldown Timer ---------- */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /** ---------- Handlers ---------- */
  const handleRequestOtp = async () => {
    if (!emailValid) {
      return setPopup({ visible:true, title:'อีเมลไม่ถูกต้อง', message:'กรุณากรอกอีเมลให้ถูกต้องก่อนขอ OTP' });
    }
    try {
      setLoadingReq(true);
      await requestOtp(email.trim());
      setShowOtpInput(true);
      setCooldown(60); // 60 วิ
      setTimeout(() => otpHiddenRef.current?.focus(), 250);
      setPopup({ visible:true, title:'ส่ง OTP แล้ว', message:'เราได้ส่งรหัส OTP ไปยังอีเมลของคุณ' });
    } catch (error:any) {
      setPopup({ visible:true, title:'ส่ง OTP ไม่สำเร็จ', message:error?.message?.toString?.() || 'โปรดลองใหม่อีกครั้ง' });
    } finally {
      setLoadingReq(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      return setPopup({ visible:true, title:'OTP ไม่ครบ', message:`กรุณากรอก OTP ${OTP_LENGTH} หลัก` });
    }
    try {
      setLoadingVerify(true);
      await verifyOtp(email.trim(), otp);
      setShowResetModal(true);
    } catch (error:any) {
      setPopup({ visible:true, title:'ยืนยัน OTP ไม่สำเร็จ', message:error?.message?.toString?.() || 'OTP ไม่ถูกต้องหรือหมดอายุ' });
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      return setPopup({ visible:true, title:'รหัสผ่านสั้นเกินไป', message:'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' });
    }
    if (newPassword !== confirmPassword) {
      return setPopup({ visible:true, title:'รหัสผ่านไม่ตรงกัน', message:'กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่าน' });
    }
    try {
      setLoadingReset(true);
      await resetPassword(email.trim(), newPassword);
      setShowResetModal(false);
      setPopup({ visible:true, title:'สำเร็จ', message:'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว' });
      navigation.navigate('LoginScreen');
    } catch (error:any) {
      setPopup({ visible:true, title:'รีเซ็ตไม่สำเร็จ', message:error?.message?.toString?.() || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้' });
    } finally {
      setLoadingReset(false);
    }
  };

  /** ---------- OTP Visual Boxes ---------- */
  const setOtpSafe = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(clean);
  };

  const renderOtpBoxes = () => {
    const chars = otp.padEnd(OTP_LENGTH, ' ').split('');
    return (
      <Pressable onPress={() => otpHiddenRef.current?.focus()} style={styles.otpBoxes}>
        {chars.map((c, i) => (
          <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}>
            <Text style={styles.otpChar}>{c.trim() ? c : '•'}</Text>
          </View>
        ))}
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>ยืนยันตัวตนด้วยอีเมล + OTP แล้วตั้งรหัสผ่านใหม่</Text>
        </View>

        {/* Card: Email & Request OTP */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="example@domain.com"
            placeholderTextColor="#7FA3C1"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loadingReq && !loadingVerify && !loadingReset}
          />
          {!emailValid && email.length > 0 && (
            <Text style={styles.helper}>กรุณากรอกอีเมลให้ถูกต้อง</Text>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, (loadingReq || !emailValid) && { opacity: .6 }]}
            onPress={handleRequestOtp}
            disabled={loadingReq || !emailValid}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>{loadingReq ? 'Sending OTP...' : 'Send OTP'}</Text>
          </TouchableOpacity>

          {/* OTP Section */}
          {showOtpInput && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.inputLabel}>OTP</Text>
              {renderOtpBoxes()}

              {/* hidden input */}
              <TextInput
                ref={otpHiddenRef}
                value={otp}
                onChangeText={setOtpSafe}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                style={{ position:'absolute', opacity:0, height:0, width:0 }}
              />

              <View style={styles.otpActions}>
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  style={[styles.verifyBtn, loadingVerify && { opacity:.6 }]}
                  disabled={loadingVerify}
                >
                  <Text style={styles.verifyText}>{loadingVerify ? 'Verifying...' : 'Verify OTP'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRequestOtp}
                  disabled={cooldown > 0 || loadingReq}
                  style={[styles.resendBtn, (cooldown > 0 || loadingReq) && { opacity:.6 }]}
                >
                  <Text style={styles.resendText}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helper}>กรุณาตรวจอีเมล (รวมถึงโฟลเดอร์สแปม) เพื่อรับรหัส OTP</Text>
            </View>
          )}
        </View>

        {/* Modal: New Password */}
        <Modal visible={showResetModal} transparent animationType="fade" onRequestClose={() => setShowResetModal(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>ตั้งรหัสผ่านใหม่</Text>

              <Text style={styles.inputLabel}>NEW PASSWORD</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#7FA3C1"
                  style={styles.input}
                  secureTextEntry={!showPwd}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <Pressable onPress={() => setShowPwd(s=>!s)} style={styles.eyeBtn} android_ripple={{ color:'#e0eef9' }}>
                  <Text style={styles.eyeText}>{showPwd ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              <Text style={styles.helper}>ความแข็งแรงรหัสผ่าน: {strengthLabel}</Text>

              <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#7FA3C1"
                  style={styles.input}
                  secureTextEntry={!showPwd2}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable onPress={() => setShowPwd2(s=>!s)} style={styles.eyeBtn} android_ripple={{ color:'#e0eef9' }}>
                  <Text style={styles.eyeText}>{showPwd2 ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowResetModal(false)} style={[styles.secondaryBtn, { flex:1 }]}>
                  <Text style={styles.secondaryText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={[styles.primaryBtn, { flex:1 }, loadingReset && { opacity:.6 }]}
                  disabled={loadingReset}
                >
                  <Text style={styles.primaryText}>{loadingReset ? 'Saving...' : 'Reset Password'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Popup */}
        <ErrorPopup
          visible={popup.visible}
          title={popup.title || 'แจ้งเตือน'}
          message={popup.message}
          onClose={() => setPopup({ visible:false })}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordPage;

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

  // Inputs
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
  },
  helper: { fontSize: 11, color: '#7FA3C1', marginTop: 6 },

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
    marginTop: 10,
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

  // OTP
  otpBoxes: { flexDirection:'row', gap:10, marginBottom: 10 },
  otpBox: {
    width: 44, height: 52, borderRadius: 12,
    borderWidth: 1, borderColor: '#C7DFEF',
    backgroundColor: '#F7FBFF',
    justifyContent:'center', alignItems:'center',
    shadowColor:'#000', shadowOpacity:.03, shadowOffset:{ width:0, height:2 }, shadowRadius:4,
  },
  otpBoxActive: { borderColor:'#0288D1' },
  otpChar: { fontSize: 18, fontWeight:'800', color:'#0D2A4A' },
  otpActions: { flexDirection:'row', gap:8, marginTop: 6 },
  verifyBtn: {
    flex:1, backgroundColor:'#00C853', paddingVertical:12, borderRadius:999, alignItems:'center',
    shadowColor:'#00C853', shadowOpacity:.2, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:3
  },
  verifyText: { color:'#fff', fontWeight:'900', fontSize:12 },
  resendBtn: {
    paddingVertical:12, paddingHorizontal:16, borderRadius:999, borderWidth:1, borderColor:'#9BC6E3', backgroundColor:'#F4FAFF',
    alignItems:'center', justifyContent:'center'
  },
  resendText: { color:'#0D2A4A', fontWeight:'800', fontSize:12 },

  // Modal
  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center', padding:16 },
  modalCard: {
    width:'100%', backgroundColor:'#fff', borderRadius:18, padding:16,
    borderWidth:1, borderColor:'#E1EEF7', shadowColor:'#0D2A4A', shadowOpacity:.12, shadowOffset:{ width:0, height:10 }, shadowRadius:14, elevation:4
  },
  modalTitle: { fontSize:16, fontWeight:'900', color:'#0D2A4A', marginBottom:8 },
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
  modalActions: { flexDirection:'row', gap:10, marginTop: 12 },
});
