import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { fetchConfirmInfo, confirmPayment } from '../services/apiService';

const InfoPayment = ({ route, navigation }: any) => {
  const { firstName, lastName } = route.params;
  const [confirmData, setConfirmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{visible:boolean; title?:string; message?:string; onOk?:()=>void}>({ visible:false });

  useEffect(() => { if (firstName && lastName) getConfirmInfo(); }, []);

  const getConfirmInfo = async () => {
    setLoading(true);
    try {
      const result = await fetchConfirmInfo(firstName, lastName);
      setConfirmData(Array.isArray(result) && result.length ? result[0] : null);
    } catch {
      setNotif({ visible:true, title:'Error', message:'ไม่สามารถดึงข้อมูลยืนยันได้' });
    } finally { setLoading(false); }
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment({ firstName, lastName });
      setNotif({ visible:true, title:'สำเร็จ', message:'ยืนยันการชำระเงินเรียบร้อยแล้ว', onOk: () => navigation.goBack() });
    } catch {
      setNotif({ visible:true, title:'Error', message:'ยืนยันการชำระเงินไม่สำเร็จ' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#0288D1" /> : confirmData ? (
        <>
          <Text style={styles.title}>📄 ข้อมูลการยืนยันชำระเงิน</Text>
          <View style={styles.card}>
            <Text style={styles.label}>👤 ชื่อ:</Text><Text style={styles.value}>{confirmData.firstName} {confirmData.lastName}</Text>
            <Text style={styles.label}>💰 จำนวนเงิน:</Text><Text style={styles.value}>{confirmData.amountDue} บาท</Text>
            <Text style={styles.label}>📅 วันที่ยืนยัน:</Text><Text style={styles.value}>{confirmData.confirmDate}</Text>
            <Text style={styles.label}>🕒 เวลายืนยัน:</Text><Text style={styles.value}>{confirmData.confirmTime}</Text>
            <Text style={styles.label}>👮 เจ้าหน้าที่:</Text><Text style={styles.value}>{confirmData.officerName}</Text>
            <Text style={styles.label}>🖼️ รูปภาพยืนยัน:</Text>
            {confirmData.confirmImage
              ? <Image source={{ uri: confirmData.confirmImage }} style={styles.image} resizeMode="contain" />
              : <Text style={styles.value}>ไม่มีรูปภาพ</Text>}
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
            <Text style={styles.buttonText}>✅ ยืนยันการชำระเงิน</Text>
          </TouchableOpacity>
        </>
      ) : <Text style={styles.errorText}>❌ ไม่พบข้อมูลการยืนยัน</Text>}

      {/* Pretty Notification Modal */}
      <Modal transparent animationType="fade" visible={notif.visible} onRequestClose={() => setNotif({ visible:false })}>
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>{notif.title || 'แจ้งเตือน'}</Text>
            {!!notif.message && <Text style={styles.toastMsg}>{notif.message}</Text>}
            <TouchableOpacity
              onPress={() => { const cb = notif.onOk; setNotif({ visible:false }); cb?.(); }}
              style={styles.toastBtn}
            >
              <Text style={styles.toastBtnText}>เข้าใจแล้ว</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default InfoPayment;

const styles = StyleSheet.create({
  container:{ padding:20, backgroundColor:'#e3f2fd', flexGrow:1 },
  title:{ fontSize:22, fontWeight:'bold', marginBottom:20, textAlign:'center', color:'#01579b' },
  card:{ backgroundColor:'#fff', borderRadius:12, padding:20, marginBottom:25, shadowColor:'#000', shadowOpacity:0.1, shadowOffset:{ width:0, height:2 }, shadowRadius:4, elevation:4 },
  label:{ fontSize:16, fontWeight:'600', color:'#455a64', marginTop:10 },
  value:{ fontSize:16, marginBottom:6, color:'#263238' },
  image:{ width:'100%', height:200, borderRadius:10, marginTop:10, borderWidth:1, borderColor:'#ccc' },
  confirmButton:{ backgroundColor:'#388e3c', paddingVertical:14, borderRadius:30, alignItems:'center', marginBottom:20 },
  buttonText:{ color:'#fff', fontWeight:'bold', fontSize:16 },
  errorText:{ fontSize:16, color:'red', textAlign:'center', marginTop:40 },
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'82%', backgroundColor:'#fff', borderRadius:16, padding:18 },
  toastTitle:{ fontSize:18, fontWeight:'700', marginBottom:6 },
  toastMsg:{ fontSize:15, color:'#333', marginBottom:14 },
  toastBtn:{ alignSelf:'flex-end', paddingVertical:8, paddingHorizontal:14, backgroundColor:'#0288D1', borderRadius:10 },
  toastBtnText:{ color:'#fff', fontWeight:'600' },
});
