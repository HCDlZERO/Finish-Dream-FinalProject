import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateOfficerInfo } from '../services/apiService';
import ErrorPopup from '../services/ErrorPopup';

type Props = { route: { params?: { officerId?: number | string } } };

const SettingOfficerInfo: React.FC<Props> = ({ route }) => {
  const { officerId } = route.params || {};
  const [lineId, setLineId] = useState('');
  const [bank, setBank] = useState('');
  const [bankId, setBankId] = useState('');
  const [qrImageUri, setQrImageUri] = useState('');
  const [qrBase64, setQrBase64] = useState('');

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{visible:boolean; title?:string; message?:string}>({ visible:false });
  const [confirm, setConfirm] = useState<{visible:boolean}>({ visible:false });

  // ----------- Validation helpers -----------
  const bankIdSafe = (v: string) => {
    const digits = v.replace(/\D+/g, '').slice(0, 20);
    setBankId(digits);
  };

  const hasLine  = lineId.trim().length > 0;
  const hasBank  = bank.trim().length > 0;
  const hasBankId = bankId.trim().length > 0;
  const hasQr    = qrBase64.length > 0;

  const bankIdError = useMemo(() => {
    if (!hasBankId) return '';
    if (!/^\d{8,20}$/.test(bankId)) return 'เลขบัญชีต้องเป็นตัวเลข 8–20 หลัก';
    return '';
  }, [bankId, hasBankId]);

  const formError = useMemo(() => {
    if (!officerId) return 'ขาดข้อมูล officerId';
    if (!hasLine && !hasBank && !hasBankId && !hasQr) return 'กรุณากรอกอย่างน้อย 1 รายการ (Line ID / ธนาคาร / เลขบัญชี / QR Code)';
    if (hasBank !== hasBankId) return 'กรุณากรอกชื่อธนาคารและเลขบัญชีให้ครบคู่กัน';
    if (bankIdError) return bankIdError;
    return '';
  }, [officerId, hasLine, hasBank, hasBankId, hasQr, bankIdError]);

  const isValid = !formError;

  // ----------- Image picker -----------
  const handlePickImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType:'photo',
        includeBase64:true,
        maxWidth: 1200,
        quality: 0.9,
      });
      const asset = res?.assets?.[0];
      if (!asset) {
        return setPopup({ visible:true, title:'เลือกรูปไม่สำเร็จ', message:'กรุณาลองเลือกรูปใหม่อีกครั้ง' });
      }
      setQrImageUri(asset.uri || '');
      setQrBase64(asset.base64 || '');
    } catch (e:any) {
      setPopup({ visible:true, title:'เลือกรูปไม่สำเร็จ', message: e?.message?.toString?.() || 'ไม่สามารถเปิดคลังรูปภาพได้' });
    }
  };

  const clearImage = () => {
    setQrImageUri('');
    setQrBase64('');
  };

  // ----------- Submit -----------
  const handleSubmit = () => {
    if (!isValid) {
      return setPopup({ visible:true, title:'ข้อมูลไม่ถูกต้อง', message: formError });
    }
    setConfirm({ visible:true });
  };

  const reallyUpdate = async () => {
    const payload: any = { officerId };
    if (hasLine) payload.lineId = lineId.trim();
    if (hasBank) payload.bank = bank.trim();
    if (hasBankId) payload.bankId = bankId.trim();
    if (hasQr) payload.qrCode = `data:image/png;base64,${qrBase64}`;

    try {
      setLoading(true);
      const result = await updateOfficerInfo(payload);
      setPopup({
        visible:true,
        title:'✅ อัปเดตสำเร็จ',
        message: String(result || 'บันทึกข้อมูลเรียบร้อยแล้ว'),
      });
    } catch (e:any) {
      setPopup({
        visible:true,
        title:'❌ อัปเดตไม่สำเร็จ',
        message: e?.message?.toString?.() || 'เกิดข้อผิดพลาด',
      });
    } finally {
      setLoading(false);
      setConfirm({ visible:false });
    }
  };

  // ----------- UI -----------
  return (
    <KeyboardAvoidingView
      style={{ flex:1, backgroundColor:'#E9F4FF' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Nam</Text>
          <Text style={[styles.brand, styles.brandAccent]}>Jai</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ตั้งค่าข้อมูลเจ้าหน้าที่</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor:'#0288D1'}]}>
            <Text style={styles.summaryNum}>{String(officerId || '-')}</Text>
            <Text style={styles.summaryLabel}>Officer ID</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor:'#26A69A'}]}>
            <Text style={styles.summaryNum}>
              {hasLine ? '✓' : '–'}
            </Text>
            <Text style={styles.summaryLabel}>Line ID</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor:'#7E57C2'}]}>
            <Text style={styles.summaryNum}>
              {hasBank && hasBankId ? '✓' : '–'}
            </Text>
            <Text style={styles.summaryLabel}>บัญชีธนาคาร</Text>
          </View>
        </View>

        {/* Card: Contact / Bank */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลติดต่อ & บัญชี</Text>

          <Text style={styles.label}>Line ID</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น line.me/..."
            placeholderTextColor="#9FB3C8"
            value={lineId}
            onChangeText={setLineId}
            editable={!loading}
            autoCapitalize="none"
          />

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>ธนาคาร (Bank)</Text>
              <TextInput
                style={styles.input}
                placeholder="ชื่อธนาคาร"
                placeholderTextColor="#9FB3C8"
                value={bank}
                onChangeText={setBank}
                editable={!loading}
                autoCapitalize="none"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>เลขบัญชี (Bank ID)</Text>
              <TextInput
                style={[styles.input, !!bankIdError && styles.inputError]}
                placeholder="เฉพาะตัวเลข 8–20 หลัก"
                placeholderTextColor="#9FB3C8"
                value={bankId}
                onChangeText={bankIdSafe}
                keyboardType="numeric"
                editable={!loading}
              />
              {!!bankIdError && <Text style={styles.errorText}>{bankIdError}</Text>}
            </View>
          </View>

          <Text style={styles.hint}>* ถ้ากรอกธนาคาร ต้องกรอกเลขบัญชีคู่กัน (และกลับกัน)</Text>
        </View>

        {/* Card: QR Code */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>QR Code รับชำระ</Text>

          <View style={styles.qrRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handlePickImage}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>📷 เลือกรูป QR Code</Text>
            </TouchableOpacity>

            {qrImageUri ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={clearImage} disabled={loading}>
                <Text style={styles.secondaryBtnText}>ลบรูป</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {!!qrImageUri && (
            <Image
              source={{ uri: qrImageUri }}
              style={styles.qrImage}
              resizeMode="cover"
            />
          )}

          <Text style={styles.hint}>* รองรับ JPG/PNG, ระบบจะบันทึกเป็น Base64 พร้อม mime type</Text>
        </View>
      </ScrollView>

      {/* Sticky submit bar */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyLeft}>
          <Text style={styles.stickyTitle}>อัปเดตข้อมูล</Text>
          <Text style={styles.stickySub}>
            {hasLine ? 'Line ✓ • ' : 'Line – • '}
            {hasBank && hasBankId ? 'บัญชี ✓ • ' : 'บัญชี – • '}
            {hasQr ? 'QR ✓' : 'QR –'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, (!isValid || loading) && { opacity: 0.7 }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>💾 บันทึกข้อมูล</Text>}
        </TouchableOpacity>
      </View>

      {/* Confirm Modal */}
      <Modal transparent animationType="fade" visible={confirm.visible} onRequestClose={() => setConfirm({ visible:false })}>
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>ยืนยันการอัปเดต</Text>
            <Text style={styles.toastMsg}>
              ต้องการบันทึกการเปลี่ยนแปลงสำหรับ Officer #{String(officerId || '-')} ใช่หรือไม่?
            </Text>
            <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10 }}>
              <TouchableOpacity onPress={() => setConfirm({ visible:false })} style={[styles.toastBtn, { backgroundColor:'#9e9e9e' }]}>
                <Text style={styles.toastBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={reallyUpdate} style={[styles.toastBtn, { backgroundColor:'#1976D2' }]}>
                <Text style={styles.toastBtnText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Popup */}
      <ErrorPopup
        visible={popup.visible}
        title={popup.title || 'แจ้งเตือน'}
        message={popup.message}
        onClose={() => setPopup({ visible:false })}
      />
    </KeyboardAvoidingView>
  );
};

export default SettingOfficerInfo;

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
  brand: { fontSize: 22, fontWeight: '900', color: '#EAF6FF', letterSpacing: 0.5 },
  brandAccent: { color: '#FF4081' },
  headerRight:{ flexDirection:'row', alignItems:'center', gap:8 },
  badge: { backgroundColor:'#0288D1', paddingVertical:6, paddingHorizontal:12, borderRadius:999 },
  badgeText: { color:'#EAF6FF', fontWeight:'800', fontSize:12 },

  // Summary chips
  summaryRow:{
    flexDirection:'row',
    gap:10,
    paddingHorizontal:16,
    paddingTop:12,
    paddingBottom:10,
    backgroundColor:'#E9F4FF',
  },
  summaryCard:{
    flex:1,
    borderRadius:16,
    paddingVertical:14,
    alignItems:'center',
    shadowColor:'#000',
    shadowOpacity:.12,
    shadowOffset:{width:0, height:3},
    shadowRadius:6,
    elevation:3
  },
  summaryNum:{ fontSize:18, fontWeight:'900', color:'#fff' },
  summaryLabel:{ fontSize:12, fontWeight:'700', color:'#EAF6FF', marginTop:2 },

  // Card
  card:{
    backgroundColor:'#FFFFFF',
    borderRadius:18,
    marginHorizontal:16,
    padding:14,
    shadowColor:'#000',
    shadowOpacity:.08,
    shadowOffset:{ width:0, height:6 },
    shadowRadius:10,
    elevation:3,
    marginBottom:12,
  },
  cardTitle:{ fontSize:18, fontWeight:'800', color:'#0D2A4A', marginBottom:8 },

  // Inputs
  label:{ fontSize:13, fontWeight:'700', color:'#35506B', marginBottom:6 },
  input:{
    backgroundColor:'#F7FBFF',
    borderWidth:1.5,
    borderColor:'#C9DBEA',
    paddingHorizontal:12,
    paddingVertical:10,
    borderRadius:12,
    fontSize:15,
    color:'#0D2A4A',
    marginBottom:10,
  },
  inputError:{ borderColor:'#E53935', backgroundColor:'#FFF6F6' },
  errorText:{ color:'#D32F2F', fontSize:12, marginTop:4, fontWeight:'600' },
  hint:{ color:'#6C89A3', marginTop:6 },

  row2:{ flexDirection:'row', alignItems:'flex-start' },

  // QR
  qrRow:{
    flexDirection:'row',
    gap:10,
    alignItems:'center',
    marginBottom:10,
  },
  qrImage:{
    width:'100%',
    height:240,
    borderRadius:14,
    marginTop:8,
    backgroundColor:'#F7FBFF',
  },

  // Buttons
  primaryBtn:{
    backgroundColor:'#1976D2',
    paddingHorizontal:14, paddingVertical:10,
    borderRadius:12, alignItems:'center', justifyContent:'center',
    shadowColor:'#000', shadowOpacity:.08, shadowOffset:{width:0, height:4}, shadowRadius:8, elevation:2
  },
  primaryBtnText:{ color:'#fff', fontWeight:'800' },
  secondaryBtn:{
    backgroundColor:'#E3EDF6',
    paddingHorizontal:14, paddingVertical:10,
    borderRadius:12, alignItems:'center', justifyContent:'center',
  },
  secondaryBtnText:{ color:'#0D2A4A', fontWeight:'800' },

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
    paddingHorizontal:18, paddingVertical:12,
    borderRadius:14, alignItems:'center', justifyContent:'center',
    minWidth:160,
  },
  submitText:{ color:'#fff', fontWeight:'900', fontSize:15, letterSpacing:0.3 },

  // Toast / Modal
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'86%', backgroundColor:'#fff', borderRadius:16, padding:18 },
  toastTitle:{ fontSize:18, fontWeight:'700', marginBottom:6, color:'#0D2A4A' },
  toastMsg:{ fontSize:15, color:'#2E4B66', marginBottom:14 },
  toastBtn:{ paddingVertical:10, paddingHorizontal:16, borderRadius:12, backgroundColor:'#1976D2' },
  toastBtnText:{ color:'#fff', fontWeight:'800' },
});
