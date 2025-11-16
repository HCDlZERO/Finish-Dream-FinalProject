import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { fetchBillInfo, cancelService } from '../services/apiService';

const UserBillsInfo = ({ route, navigation }: any) => {
  const { numberId } = route.params;
  const [billInfo, setBillInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{visible:boolean; title?:string; message?:string}>({ visible:false });

  useEffect(() => { numberId ? getBillInfo() : setNotif({ visible:true, title:'Error', message:'Invalid number ID received.' }); }, []);

  const getBillInfo = async () => {
    setLoading(true);
    try {
      const data = await fetchBillInfo(numberId);
      setBillInfo(Array.isArray(data) && data.length ? data[0] : null);
    } catch {
      setNotif({ visible:true, title:'Error', message:'Failed to fetch bill information.' });
    } finally { setLoading(false); }
  };

  const handleInfoPayment = () => billInfo && navigation.navigate('InfoPayment', { firstName: billInfo.firstName, lastName: billInfo.lastName });

  const handleCancelService = async () => {
    try { await cancelService(numberId); setNotif({ visible:true, title:'สำเร็จ', message:'บริการถูกยกเลิกแล้ว' }); }
    catch { setNotif({ visible:true, title:'Error', message:'ไม่สามารถยกเลิกบริการได้' }); }
  };

  const renderConditionalButton = () => {
    if (!billInfo) return null;
    const s = billInfo.paymentStatus;
    if (['Gray', 'Green', 'Yellow', 'Orange'].includes(s))
      return <TouchableOpacity style={styles.primaryButton} onPress={handleInfoPayment}><Text style={styles.buttonText}>ดูรายละเอียดการชำระเงิน</Text></TouchableOpacity>;
    if (s === 'Red')
      return <TouchableOpacity style={styles.dangerButton} onPress={handleCancelService}><Text style={styles.buttonText}>ยกเลิกบริการ</Text></TouchableOpacity>;
    return null;
  };

  const renderStatusTag = () => {
    if (!billInfo) return null;
    const s = billInfo.paymentStatus;
    const map: Record<string, {msg:string; color:string}> = {
      Gray:{ msg:'รอการชำระ', color:'#9e9e9e' },
      Green:{ msg:'ชำระเสร็จสิ้น', color:'#4caf50' },
      Yellow:{ msg:'ชำระเป็นเงินสด', color:'#fdd835' },
      Orange:{ msg:'ค้างชำระ', color:'#fb8c00' },
      Red:{ msg:'เกินเวลาชำระ', color:'#e53935' },
    };
    const { msg, color } = map[s] || { msg:'-', color:'#9e9e9e' };
    return <View style={[styles.statusTag, { backgroundColor: color }]}><Text style={[styles.statusText, s==='Yellow' && { color:'#000' }]}>{msg}</Text></View>;
  };

  const renderCashTimeBox = () => {
    if (!billInfo || billInfo.paymentStatus !== 'Yellow') return null;
    const ct = String(billInfo.cashTime);
    const timeMsg = ct === '1' ? '11.00 น.' : ct === '2' ? '17.00 น.' : '-';
    return <View style={[styles.statusTag, { backgroundColor:'#ffeb3b', marginTop:10 }]}><Text style={[styles.statusText, { color:'#000' }]}>เวลานัดชำระ: {timeMsg}</Text></View>;
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#2196f3" /> : billInfo ? (
        <>
          <View style={styles.statusContainer}>{renderStatusTag()}{renderCashTimeBox()}</View>
          <Text style={styles.header}>ข้อมูลบิลค่าน้ำ</Text>
          <View style={styles.card}>
            <Text style={styles.label}>ชื่อ-สกุล:</Text><Text style={styles.value}>{billInfo.firstName} {billInfo.lastName}</Text>
            <Text style={styles.label}>หมายเลขผู้ใช้:</Text><Text style={styles.value}>{billInfo.numberId}</Text>
            <Text style={styles.label}>ปริมาณน้ำที่ใช้:</Text><Text style={styles.value}>{billInfo.unitsUsed}</Text>
            <Text style={styles.label}>วันที่ออกบิล:</Text><Text style={styles.value}>{billInfo.billDate}</Text>
            <Text style={styles.label}>ยอดค้างชำระ:</Text><Text style={styles.value}>{billInfo.amountDue} บาท</Text>
            {billInfo.cash ? (<><Text style={styles.label}>ค่าปรับ:</Text><Text style={[styles.value, { color:'#d32f2f' }]}>{billInfo.cash} บาท</Text></>) : null}
            <Text style={styles.label}>สถานะการชำระ:</Text><Text style={styles.value}>{billInfo.paymentStatus}</Text>
          </View>
          {renderConditionalButton()}
        </>
      ) : <Text style={styles.errorText}>ไม่พบข้อมูลบิลสำหรับผู้ใช้นี้</Text>}

      {/* Pretty Notification Modal (แทน Alert) */}
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

export default UserBillsInfo;

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:'#f0f8ff' },
  header:{ fontSize:24, fontWeight:'bold', marginBottom:20, textAlign:'center', color:'#0d47a1' },
  card:{ backgroundColor:'#fff', padding:20, borderRadius:12, shadowColor:'#000', shadowOffset:{ width:0, height:2 }, shadowOpacity:0.2, shadowRadius:4, elevation:3, marginBottom:25 },
  label:{ fontSize:16, fontWeight:'600', color:'#455a64' }, value:{ fontSize:16, marginBottom:12, color:'#263238' },
  errorText:{ fontSize:18, color:'red', textAlign:'center' },
  statusContainer:{ alignItems:'flex-end', marginBottom:10 },
  statusTag:{ paddingHorizontal:14, paddingVertical:6, borderRadius:14, alignSelf:'flex-end' },
  statusText:{ fontWeight:'bold', color:'#fff' },
  primaryButton:{ backgroundColor:'#2196f3', borderRadius:25, paddingVertical:12, alignItems:'center' },
  dangerButton:{ backgroundColor:'#e53935', borderRadius:25, paddingVertical:12, alignItems:'center' },
  buttonText:{ color:'#fff', fontWeight:'bold', fontSize:16, textTransform:'uppercase' },
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'82%', backgroundColor:'#fff', borderRadius:16, padding:18 },
  toastTitle:{ fontSize:18, fontWeight:'700', marginBottom:6 },
  toastMsg:{ fontSize:15, color:'#333', marginBottom:14 },
  toastBtn:{ alignSelf:'flex-end', paddingVertical:8, paddingHorizontal:14, backgroundColor:'#2196f3', borderRadius:10 },
  toastBtnText:{ color:'#fff', fontWeight:'600' },
});
