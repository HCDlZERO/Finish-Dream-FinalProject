import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchUserDetail, updateUserInfo } from '../services/apiService';

const EDIT_FIELDS = [
  { key: 'house_number', label: 'HOUSE NUMBER' },
  { key: 'street', label: 'STREET' },
  { key: 'district', label: 'DISTRICT' },
  { key: 'city', label: 'CITY' },
  { key: 'postal_code', label: 'POSTAL CODE' },
  { key: 'email', label: 'EMAIL' },
  { key: 'phone_number', label: 'PHONE NUMBER' },
] as const;

/** ---------- Helpers: Thai initials ---------- */
const THAI_LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);
const THAI_COMBINING_MARKS = new Set([
  'ะ', 'ั', 'า', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู',
  '็', '่', '้', '๊', '๋', '์', 'ฺ', 'ํ', '๎'
]);
const NON_LETTER = new Set([' ', '-', '_', '.', ',', '(', ')', '[', ']', '{', '}', '/', '\\', 'ฯ', 'ๆ', '฿', '"', '\'', '・']);
const isThaiConsonant = (ch: string) => {
  if (ch < 'ก' || ch > 'ฮ') return false;
  if (THAI_COMBINING_MARKS.has(ch)) return false;
  if (THAI_LEADING_VOWELS.has(ch)) return false;
  return true;
};
const isAsciiLetterOrDigit = (ch: string) => /[A-Za-z0-9]/.test(ch);
const getInitialFromName = (name?: string) => {
  if (!name) return '';
  const s = name.normalize('NFC');
  for (const ch of s) {
    if (NON_LETTER.has(ch)) continue;
    if (THAI_COMBINING_MARKS.has(ch)) continue;
    if (THAI_LEADING_VOWELS.has(ch)) continue;
    if (isThaiConsonant(ch)) return ch;
    if (isAsciiLetterOrDigit(ch)) return ch.toUpperCase();
  }
  return '';
};
const makeInitials = (firstName?: string, lastName?: string) => {
  const a = getInitialFromName(firstName);
  const b = getInitialFromName(lastName);
  const initials = `${a}${b}`.trim();
  return initials.length ? initials : '??';
};
/** ---------- End Helpers ---------- */

const Row = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '-'}</Text>
  </View>
);

const UserProfilePage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { numberId } = route.params as { numberId: string };

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [notif, setNotif] = useState<{ visible: boolean; title?: string; message?: string }>({ visible: false });

  const loadUser = async () => {
    try {
      setLoading(true);
      const result = await fetchUserDetail(numberId);
      setUserData(result);
    } catch (e:any) {
      setNotif({ visible:true, title:'เกิดข้อผิดพลาด', message:'ไม่สามารถโหลดข้อมูลผู้ใช้ได้' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, [numberId]);

  const initials = useMemo(() => makeInitials(userData?.first_name, userData?.last_name), [userData?.first_name, userData?.last_name]);

  const handleOpenEdit = () => {
    setEditData({
      house_number: userData?.house_number || '',
      street: userData?.street || '',
      district: userData?.district || '',
      city: userData?.city || '',
      postal_code: userData?.postal_code || '',
      email: userData?.email || '',
      phone_number: userData?.phone_number || '',
    });
    setEditModalVisible(true);
  };

  const validateEdit = () => {
    const { email, phone_number, postal_code } = editData;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (phone_number && !/^0\d{8,9}$/.test(phone_number)) return 'เบอร์โทรต้องขึ้นต้น 0 และยาว 9–10 หลัก';
    if (postal_code && !/^\d{5}$/.test(postal_code)) return 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    return '';
  };

  const handleSaveEdit = async () => {
    const msg = validateEdit(); if (msg) return setNotif({ visible:true, title:'ข้อมูลไม่ถูกต้อง', message:msg });
    try {
      const payload = {
        numberId,
        houseNumber: editData.house_number,
        street: editData.street,
        district: editData.district,
        city: editData.city,
        postalCode: editData.postal_code,
        email: editData.email,
        phoneNumber: editData.phone_number,
      };
      await updateUserInfo(payload);
      setEditModalVisible(false);
      setNotif({ visible:true, title:'สำเร็จ', message:'อัปเดตข้อมูลเรียบร้อยแล้ว' });
      loadUser();
    } catch (e:any) {
      setNotif({ visible:true, title:'เกิดข้อผิดพลาด', message:'ไม่สามารถอัปเดตข้อมูลได้' });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={{ marginTop:10, color:'#4E6E90' }}>กำลังโหลดข้อมูลผู้ใช้...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <Text style={{ color:'#0D2A4A', fontWeight:'700' }}>ไม่พบข้อมูลผู้ใช้</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backChip}>
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>
          Nam<Text style={styles.brandAccent}>Jai</Text>
        </Text>
        <TouchableOpacity onPress={loadUser} activeOpacity={0.85} style={styles.refreshChip}>
          <Text style={styles.refreshText}>รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Title + meta */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>โปรไฟล์ผู้ใช้งาน</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaKey}>หมายเลข</Text>
            <Text style={styles.metaValue}>{numberId}</Text>
          </View>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={styles.nameText}>{userData.first_name} {userData.last_name}</Text>
            <Text style={styles.subNote}>ผู้ใช้งานในระบบ NamJai</Text>
          </View>
          <TouchableOpacity onPress={handleOpenEdit} style={styles.editBtn} activeOpacity={0.9}>
            <Text style={styles.editBtnText}>แก้ไข</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>ข้อมูลติดต่อ & ที่อยู่</Text>
        <View style={styles.section}>
          <Row label="บ้านเลขที่" value={userData.house_number} />
          <Row label="ถนน" value={userData.street} />
          <Row label="เขต/อำเภอ" value={userData.district} />
          <Row label="จังหวัด" value={userData.city} />
          <Row label="รหัสไปรษณีย์" value={userData.postal_code} />
          <Row label="อีเมล" value={userData.email} />
          <Row label="เบอร์โทรศัพท์" value={userData.phone_number} />
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
          <ScrollView contentContainerStyle={styles.modalContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} activeOpacity={0.85} style={styles.backChip}>
                <Text style={styles.backText}>ปิด</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>แก้ไขข้อมูลผู้ใช้งาน</Text>
              <View style={{ width:64 }} />
            </View>

            {EDIT_FIELDS.map(({ key, label }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={editData[key] ?? ''}
                  onChangeText={(t) => setEditData({ ...editData, [key]: t })}
                  keyboardType={
                    key === 'postal_code' ? 'number-pad' :
                    key === 'phone_number' ? 'phone-pad' :
                    key === 'email' ? 'email-address' : 'default'
                  }
                  autoCapitalize={key === 'email' ? 'none' : 'sentences'}
                  maxLength={key === 'postal_code' ? 5 : undefined}
                />
                {key === 'postal_code' && <Text style={styles.helper}>ตัวเลข 5 หลัก</Text>}
                {key === 'phone_number' && <Text style={styles.helper}>ขึ้นต้น 0 ความยาว 9–10 หลัก</Text>}
              </View>
            ))}

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveEdit} activeOpacity={0.9}>
                <Text style={styles.primaryText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditModalVisible(false)} activeOpacity={0.9}>
                <Text style={styles.secondaryText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Pretty Notification Modal */}
      <Modal transparent animationType="fade" visible={notif.visible} onRequestClose={() => setNotif({ visible:false })}>
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>{notif.title || 'แจ้งเตือน'}</Text>
            {!!notif.message && <Text style={styles.toastMsg}>{notif.message}</Text>}
            <TouchableOpacity onPress={() => setNotif({ visible:false })} style={styles.toastBtn}>
              <Text style={styles.toastBtnText}>เข้าใจแล้ว</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserProfilePage;

const styles = StyleSheet.create({
  container:{ flexGrow:1, backgroundColor:'#E9F4FF', paddingVertical:16, paddingHorizontal:16 },

  // Header
  headerRow:{ width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  brand:{ fontSize:28, fontWeight:'900', letterSpacing:1, color:'#0D2A4A' },
  brandAccent:{ color:'#FF4081' },
  backChip:{
    backgroundColor:'#E1EEF7', paddingVertical:8, paddingHorizontal:14,
    borderRadius:999, minWidth:64, alignItems:'center'
  },
  backText:{ color:'#0D2A4A', fontWeight:'700' },
  refreshChip:{
    backgroundColor:'#0288D1', paddingVertical:8, paddingHorizontal:14, borderRadius:999,
    shadowColor:'#0288D1', shadowOpacity:0.25, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:4
  },
  refreshText:{ color:'#fff', fontWeight:'700' },

  // Title & meta
  titleWrap:{ width:'100%', marginTop:6, marginBottom:12 },
  title:{ fontSize:18, fontWeight:'800', color:'#0D2A4A' },
  metaRow:{ flexDirection:'row', gap:10, marginTop:8, alignItems:'center' },
  metaChip:{
    backgroundColor:'#F4FAFF', borderWidth:1, borderColor:'#C7DFEF',
    paddingVertical:8, paddingHorizontal:12, borderRadius:12, flexDirection:'row', gap:8, alignItems:'baseline'
  },
  metaKey:{ color:'#4E6E90', fontWeight:'700', fontSize:12 },
  metaValue:{ color:'#0D2A4A', fontWeight:'900', fontSize:14 },

  // Card
  card:{
    width:'100%', backgroundColor:'#ffffff', borderRadius:18, padding:16,
    shadowColor:'#0D2A4A', shadowOpacity:0.1, shadowOffset:{ width:0, height:10 },
    shadowRadius:14, elevation:3, borderWidth:1, borderColor:'#E1EEF7'
  },
  cardHeader:{ flexDirection:'row', gap:12, alignItems:'center', marginBottom:6 },
  avatar:{
    width:56, height:56, borderRadius:16, backgroundColor:'#F0F7FF',
    justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#CDE2F2'
  },
  avatarText:{ fontWeight:'900', fontSize:20, color:'#0D2A4A' },
  nameText:{ fontSize:18, fontWeight:'900', color:'#0D2A4A' },
  subNote:{ fontSize:12, color:'#4E6E90', marginTop:2 },
  editBtn:{
    backgroundColor:'#0288D1', paddingVertical:8, paddingHorizontal:12, borderRadius:999,
    shadowColor:'#0288D1', shadowOpacity:0.25, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:3
  },
  editBtnText:{ color:'#fff', fontWeight:'900', fontSize:12 },

  divider:{ height:1, backgroundColor:'#E6F1FA', marginVertical:12 },

  section:{ gap:8 },
  sectionTitle:{ fontSize:14, fontWeight:'900', color:'#0D2A4A', marginBottom:4 },

  // Readonly rows
  row:{ flexDirection:'row', justifyContent:'space-between', gap:12, paddingVertical:6 },
  rowLabel:{ color:'#4E6E90', fontWeight:'700', fontSize:12, minWidth:100 },
  rowValue:{ color:'#0D2A4A', fontWeight:'700', fontSize:14, flex:1, textAlign:'right' },

  // Modal
  modalContainer:{ flexGrow:1, backgroundColor:'#f2f9ff', padding:16 },
  modalHeader:{ width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  modalTitle:{ fontSize:18, fontWeight:'900', color:'#0D2A4A' },

  inputLabel:{ fontSize:12, color:'#4E6E90', fontWeight:'700', marginBottom:6, marginTop:6 },
  input:{
    borderWidth:1, borderColor:'#C7DFEF', backgroundColor:'#fff',
    paddingVertical:12, paddingHorizontal:14, borderRadius:12, fontSize:14, color:'#0D2A4A',
    shadowColor:'#000', shadowOpacity:0.04, shadowOffset:{ width:0, height:2 }, shadowRadius:4, elevation:2
  },
  helper:{ fontSize:11, color:'#7FA3C1', marginTop:6 },

  actionsRow:{ width:'100%', flexDirection:'row', gap:10, marginTop:14 },
  primaryBtn:{
    flex:1, backgroundColor:'#0288D1', paddingVertical:14, borderRadius:999, alignItems:'center',
    shadowColor:'#0288D1', shadowOpacity:0.25, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:4
  },
  primaryText:{ color:'#fff', fontWeight:'900', fontSize:14, letterSpacing:0.3 },
  secondaryBtn:{
    paddingVertical:14, paddingHorizontal:18, borderRadius:999, borderWidth:1, borderColor:'#9BC6E3', backgroundColor:'#F4FAFF'
  },
  secondaryText:{ color:'#0D2A4A', fontWeight:'800', fontSize:14 },

  // Toast
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'86%', backgroundColor:'#fff', borderRadius:18, padding:18, borderWidth:1, borderColor:'#E1EEF7' },
  toastTitle:{ fontSize:18, fontWeight:'900', color:'#0D2A4A', marginBottom:6 },
  toastMsg:{ fontSize:14, color:'#4E6E90', marginBottom:14 },
  toastBtn:{ alignSelf:'flex-end', paddingVertical:10, paddingHorizontal:16, borderRadius:12, backgroundColor:'#0288D1' },
  toastBtnText:{ color:'#fff', fontWeight:'800' },
});
