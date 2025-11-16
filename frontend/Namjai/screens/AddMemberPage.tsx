import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { addUser } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

type KB = 'default' | 'numeric';

const FIELDS = [
  { key: 'numberId',   label: 'เลขสมาชิก (numberId)', required: true, kb: 'numeric' as KB, max: 20 },
  { key: 'firstName',  label: 'ชื่อ',                  required: true, kb: 'default' as KB },
  { key: 'lastName',   label: 'นามสกุล',              required: true, kb: 'default' as KB },
  { key: 'houseNumber',label: 'บ้านเลขที่',            required: true, kb: 'default' as KB },
  { key: 'street',     label: 'ถนน',                  required: true, kb: 'default' as KB },
  { key: 'district',   label: 'เขต/อำเภอ',            required: true, kb: 'default' as KB },
  { key: 'city',       label: 'จังหวัด',              required: true, kb: 'default' as KB },
  { key: 'postalCode', label: 'รหัสไปรษณีย์',         required: true, kb: 'numeric' as KB, max: 5 },
] as const;

type FormState = {
  numberId: string; firstName: string; lastName: string; houseNumber: string;
  street: string; district: string; city: string; postalCode: string; zone: string;
  role: 'Member'; registrationDate: string;
};

const todayStr = new Date().toISOString().split('T')[0];

const AddMemberPage = () => {
  const [form, setForm] = useState<FormState>({
    numberId: '', firstName: '', lastName: '', houseNumber: '',
    street: '', district: '', city: '', postalCode: '', zone: '',
    role: 'Member', registrationDate: todayStr,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{visible:boolean; message?:string; title?:string}>({ visible:false });

  // ---------- Helpers ----------
  const setField = (name: keyof FormState, rawValue: string) => {
    // คุมรูปแบบเฉพาะบางช่อง
    let value = rawValue;
    if (name === 'numberId' || name === 'postalCode' || name === 'zone') {
      value = rawValue.replace(/\D+/g, ''); // เก็บเฉพาะตัวเลข
    }
    // จำกัด length
    const rule = (FIELDS as any).find((f: any) => f.key === name);
    if (rule?.max) value = value.slice(0, rule.max);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const markTouched = (name: keyof FormState) =>
    setTouched(prev => ({ ...prev, [name]: true }));

  // ---------- Validation ----------
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const f = form;

    // required
    for (const field of FIELDS) {
      const val = (f as any)[field.key];
      if (field.required && !String(val).trim()) e[field.key] = 'กรุณากรอกข้อมูล';
    }

    if (f.numberId && !/^\d+$/.test(f.numberId)) e.numberId = 'ต้องเป็นตัวเลขเท่านั้น';
    if (f.postalCode && !/^\d{5}$/.test(f.postalCode)) e.postalCode = 'ต้องเป็นเลข 5 หลัก';
    if (!f.zone.trim()) {
      e.zone = 'กรุณาระบุโซน';
    } else if (!/^\d+$/.test(f.zone) || parseInt(f.zone, 10) <= 0) {
      e.zone = 'โซนต้องเป็นจำนวนเต็มบวก';
    }
    return e;
  }, [form]);

  const isValid = useMemo(() => Object.keys(errors).length === 0
    && FIELDS.every(f => String((form as any)[f.key]).trim())
    && String(form.zone).trim() !== ''
  , [errors, form]);

  const handleSubmit = async () => {
    // ให้ฟอร์มโชว์ error ทุกช่องถ้ายังไม่เคยแตะ
    const allTouched: Record<string, boolean> = {};
    [...FIELDS.map(f => f.key), 'zone'].forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    if (!isValid) {
      return setPopup({
        visible: true,
        title: 'กรอกข้อมูลไม่ถูกต้อง',
        message: 'โปรดตรวจสอบข้อมูลที่มีขอบสีแดงและกรอกให้ครบถ้วน',
      });
    }

    try {
      setLoading(true);
      const payload = { ...form, zone: parseInt(form.zone, 10) };
      await addUser(payload);
      setPopup({ visible:true, title:'สำเร็จ', message:'เพิ่มสมาชิกเรียบร้อยแล้ว' });
      setForm({
        numberId: '', firstName: '', lastName: '', houseNumber: '',
        street: '', district: '', city: '', postalCode: '', zone: '',
        role: 'Member', registrationDate: todayStr,
      });
      setTouched({});
    } catch (e: any) {
      setPopup({ visible:true, title:'เกิดข้อผิดพลาด', message: e?.message?.toString?.() || 'ไม่สามารถเพิ่มสมาชิกได้' });
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  const requiredMark = <Text style={styles.required}>*</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex:1, backgroundColor:'#E9F4FF' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Nam</Text>
          <Text style={[styles.brand, styles.brandAccent]}>Jai</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>เพิ่มสมาชิก</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* แผงสรุปเล็ก ๆ */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor:'#0288D1'}]}>
            <Text style={styles.summaryNum}>{(form.firstName+form.lastName).trim() ? 1 : 0}</Text>
            <Text style={styles.summaryLabel}>ผู้สมัคร</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor:'#26A69A'}]}>
            <Text style={styles.summaryNum}>{form.zone ? form.zone : '-'}</Text>
            <Text style={styles.summaryLabel}>โซน</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor:'#7E57C2'}]}>
            <Text style={styles.summaryNum}>{isValid ? 'พร้อม' : 'ไม่พร้อม'}</Text>
            <Text style={styles.summaryLabel}>สถานะฟอร์ม</Text>
          </View>
        </View>

        {/* การ์ดข้อมูลสมาชิก */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลสมาชิก</Text>

          {FIELDS.map(({ key, label, kb, max }) => {
            const hasError = touched[key] && !!errors[key];
            return (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {label} {requiredMark}
                </Text>
                <TextInput
                  style={[styles.input, hasError && styles.inputError]}
                  value={(form as any)[key]}
                  onChangeText={(v) => setField(key as keyof FormState, v)}
                  onBlur={() => markTouched(key as keyof FormState)}
                  placeholder={`กรอก ${label}`}
                  placeholderTextColor="#9FB3C8"
                  keyboardType={kb === 'numeric' ? 'numeric' : 'default'}
                  maxLength={max}
                  autoCapitalize="none"
                  editable={!loading}
                />
                {hasError && <Text style={styles.errorText}>{errors[key]}</Text>}
              </View>
            );
          })}

          {/* โซน + Stepper */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>โซน (zone) {requiredMark}</Text>
            <View style={styles.zoneRow}>
              <TouchableOpacity
                disabled={loading}
                style={[styles.zoneBtn, {opacity: loading ? 0.6 : 1}]}
                onPress={() => {
                  const val = parseInt(form.zone || '0', 10) || 0;
                  const next = Math.max(val - 1, 1);
                  setField('zone', String(next));
                  markTouched('zone');
                }}
              >
                <Text style={styles.zoneBtnText}>−</Text>
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.zoneInput,
                  touched.zone && errors.zone ? styles.inputError : null,
                ]}
                value={form.zone}
                onChangeText={(v) => setField('zone', v)}
                onBlur={() => markTouched('zone')}
                placeholder="เช่น 1"
                placeholderTextColor="#9FB3C8"
                keyboardType="numeric"
                editable={!loading}
                maxLength={3}
                textAlign="center"
              />

              <TouchableOpacity
                disabled={loading}
                style={[styles.zoneBtn, {opacity: loading ? 0.6 : 1}]}
                onPress={() => {
                  const val = parseInt(form.zone || '0', 10) || 0;
                  const next = Math.min(val + 1, 999);
                  setField('zone', String(next));
                  markTouched('zone');
                }}
              >
                <Text style={styles.zoneBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {touched.zone && errors.zone && (
              <Text style={styles.errorText}>{errors.zone}</Text>
            )}
          </View>

          {/* วันที่ลงทะเบียน (แสดงเฉย ๆ) */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>วันที่ลงทะเบียน</Text>
            <Text style={styles.metaValue}>{form.registrationDate}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* แถบล่าง Sticky */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyLeft}>
          <Text style={styles.stickyTitle}>
            {(form.firstName || form.lastName) ? `${form.firstName} ${form.lastName}`.trim() : 'ผู้สมัครใหม่'}
          </Text>
          <Text style={styles.stickySub}>
            numberId: {form.numberId || '-'} • โซน: {form.zone || '-'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, (!isValid || loading) && { opacity: 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>✅ เพิ่มสมาชิก</Text>
          )}
        </TouchableOpacity>
      </View>

      <ErrorPopup
        visible={popup.visible}
        title={popup.title || 'แจ้งเตือน'}
        message={popup.message}
        onClose={() => setPopup({ visible:false })}
      />
    </KeyboardAvoidingView>
  );
};

export default AddMemberPage;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#0D2A4A',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },

  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandAccent: { color: '#FF4081' },
  brand: { fontSize: 22, fontWeight: '900', color: '#EAF6FF', letterSpacing: 0.5 },
  badge: { backgroundColor:'#0288D1', paddingVertical:6, paddingHorizontal:12, borderRadius:999 },
  badgeText: { color:'#EAF6FF', fontWeight:'800', fontSize:12 },

  container: {
    padding: 16,
    paddingTop: 12,
    backgroundColor:'#E9F4FF',
  },

  // Summary chips
  summaryRow:{ flexDirection:'row', gap:10, marginBottom:14 },
  summaryCard:{
    flex:1, borderRadius:16, paddingVertical:14, alignItems:'center',
    shadowColor:'#000', shadowOpacity:.12, shadowOffset:{width:0, height:3}, shadowRadius:6, elevation:3
  },
  summaryNum:{ fontSize:22, fontWeight:'900', color:'#fff' },
  summaryLabel:{ fontSize:12, fontWeight:'700', color:'#EAF6FF', marginTop:2 },

  // Card
  card: {
    backgroundColor:'#FFFFFF',
    borderRadius:18,
    padding:14,
    shadowColor:'#000',
    shadowOpacity:.08,
    shadowOffset:{ width:0, height:6 },
    shadowRadius:10,
    elevation:3,
  },
  cardTitle:{ fontSize:18, fontWeight:'800', color:'#0D2A4A', marginBottom:6 },

  // Inputs
  inputGroup:{ marginBottom:12 },
  label:{ fontSize:14, fontWeight:'700', color:'#35506B', marginBottom:6 },
  required:{ color:'#FF4081', fontWeight:'900' },
  input:{
    backgroundColor:'#F7FBFF',
    borderWidth:1.5,
    borderColor:'#C9DBEA',
    paddingHorizontal:12,
    paddingVertical:12,
    borderRadius:12,
    fontSize:16,
    color:'#0D2A4A',
  },
  inputError:{ borderColor:'#E53935', backgroundColor:'#FFF6F6' },
  errorText:{ color:'#D32F2F', fontSize:12, marginTop:6, fontWeight:'600' },

  // Zone stepper
  zoneRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  zoneBtn:{
    backgroundColor:'#0288D1',
    width:44, height:44, borderRadius:12,
    alignItems:'center', justifyContent:'center',
    shadowColor:'#000', shadowOpacity:.12, shadowOffset:{width:0, height:3}, shadowRadius:6, elevation:2
  },
  zoneBtnText:{ color:'#fff', fontSize:22, fontWeight:'900', marginTop:-2 },
  zoneInput:{
    flex:1,
    backgroundColor:'#F7FBFF',
    borderWidth:1.5,
    borderColor:'#C9DBEA',
    paddingVertical:12,
    borderRadius:12,
    fontSize:18,
    color:'#0D2A4A',
  },

  // Meta row
  metaRow:{ marginTop:6, flexDirection:'row', justifyContent:'space-between' },
  metaLabel:{ color:'#6C89A3', fontWeight:'700' },
  metaValue:{ color:'#2E4B66', fontWeight:'800' },

  // Sticky bar
  stickyBar:{
    position:'absolute', left:0, right:0, bottom:0,
    backgroundColor:'#FFFFFF',
    borderTopLeftRadius:18, borderTopRightRadius:18,
    paddingHorizontal:14, paddingVertical:12,
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    shadowColor:'#000', shadowOpacity:.12, shadowOffset:{width:0, height:-4}, shadowRadius:10, elevation:16
  },
  stickyLeft:{ flexShrink:1, paddingRight:10 },
  stickyTitle:{ color:'#0D2A4A', fontWeight:'900', fontSize:16 },
  stickySub:{ color:'#6C89A3', fontWeight:'600', marginTop:2 },

  submitBtn:{
    backgroundColor:'#1976D2',
    paddingHorizontal:18,
    paddingVertical:12,
    borderRadius:14,
    alignItems:'center', justifyContent:'center',
    minWidth:140,
  },
  submitText:{ color:'#fff', fontWeight:'900', fontSize:15, letterSpacing:0.3 },
});
