import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addHeadOfficer } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

const ROLES = ['Officer', 'Technician'] as const;

const AddOfficer = ({ navigation }: any) => {
  const [numberId, setNumberId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<typeof ROLES[number] | 'Officer'>('Officer');
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{visible:boolean; title?:string; message?:string; afterClose?:()=>void}>({ visible:false });

  const validate = () => {
    if (!/^\d{13}$/.test(numberId)) return 'Number ID ต้องเป็นตัวเลข 13 หลัก';
    if (!firstName.trim() || !lastName.trim()) return 'กรุณากรอกชื่อและนามสกุล';
    if (!ROLES.includes(role as any)) return 'กรุณาเลือก Role ให้ถูกต้อง';
    if (zoneId.trim() && (!/^\d+$/.test(zoneId) || parseInt(zoneId,10) < 0)) return 'Zone ID ต้องเป็นจำนวนเต็มไม่ติดลบ หรือเว้นว่าง';
    return '';
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) return setPopup({ visible:true, title:'ข้อมูลไม่ถูกต้อง', message:msg });

    try {
      setLoading(true);
      const payload = {
        numberId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        zoneId: zoneId ? parseInt(zoneId,10) : 0
      };
      await addHeadOfficer(payload);
      setPopup({
        visible:true,
        title:'✅ สำเร็จ',
        message:'เพิ่มเจ้าหน้าที่เรียบร้อยแล้ว',
        afterClose: () => navigation.goBack()
      });
    } catch (e:any) {
      setPopup({ visible:true, title:'เกิดข้อผิดพลาด', message:e?.message?.toString?.() || 'ไม่สามารถเพิ่มเจ้าหน้าที่ได้' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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
          <Text style={styles.title}>เพิ่มเจ้าหน้าที่ใหม่</Text>
          <Text style={styles.subtitle}>สร้างบัญชี / กำหนดบทบาท / ระบุโซนงาน</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Number ID */}
          <Text style={styles.inputLabel}>Number ID</Text>
          <TextInput
            style={styles.input}
            placeholder="ใส่หมายเลข 13 หลัก"
            placeholderTextColor="#7FA3C1"
            value={numberId}
            onChangeText={(t)=>setNumberId(t.replace(/[^0-9]/g,'').slice(0,13))}
            keyboardType="number-pad"
            maxLength={13}
            editable={!loading}
          />
          <Text style={styles.helper}>ต้องเป็นตัวเลข 13 หลัก (เช่น 1103701234567)</Text>

          {/* First Name */}
          <Text style={styles.inputLabel}>ชื่อ</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น กิตติ / John"
            placeholderTextColor="#7FA3C1"
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
            autoCapitalize="words"
          />

          {/* Last Name */}
          <Text style={styles.inputLabel}>นามสกุล</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น ศิริวงศ์ / Doe"
            placeholderTextColor="#7FA3C1"
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
            autoCapitalize="words"
          />

          {/* Role */}
          <Text style={styles.inputLabel}>บทบาท (Role)</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={role} onValueChange={(v)=>setRole(v)} enabled={!loading}>
              {ROLES.map(r => <Picker.Item key={r} label={r} value={r} />)}
            </Picker>
          </View>

          {/* Zone */}
          <Text style={styles.inputLabel}>Zone ID</Text>
          <TextInput
            style={styles.input}
            placeholder="เว้นว่าง = 0"
            placeholderTextColor="#7FA3C1"
            value={zoneId}
            onChangeText={(t)=>setZoneId(t.replace(/[^0-9]/g,''))}
            keyboardType="number-pad"
            editable={!loading}
          />
          <Text style={styles.helper}>ถ้าไม่ระบุ ระบบจะตั้งค่าเป็น 0 อัตโนมัติ</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: .6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
            disabled={loading}
          >
            <Text style={styles.secondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>

        <ErrorPopup
          visible={popup.visible}
          title={popup.title || 'แจ้งเตือน'}
          message={popup.message}
          onClose={() => { const cb = popup.afterClose; setPopup({ visible:false }); cb?.(); }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddOfficer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E9F4FF',
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
    marginTop: 4,
  },

  inputLabel: {
    fontSize: 12,
    color: '#4E6E90',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
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
  helper: { fontSize: 11, color: '#7FA3C1', marginTop: 6 },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#C7DFEF',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 6,
    overflow: 'hidden',
  },

  // Actions
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryBtn: {
    flex: 1,
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9BC6E3',
    backgroundColor: '#F4FAFF',
  },
  secondaryText: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },
});
