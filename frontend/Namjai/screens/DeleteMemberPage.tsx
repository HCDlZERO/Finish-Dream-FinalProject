import React, { useCallback, useEffect, useMemo, useState } from 'react';
 import {
   View,
   Text,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   ActivityIndicator,
   Modal,
   TextInput,
   RefreshControl,
   KeyboardAvoidingView,
   Platform,
 } from 'react-native';
 import { useNavigation } from '@react-navigation/native';
 import { fetchOfficerData, deleteUser } from '../services/apiService';
 import AsyncStorage from '@react-native-async-storage/async-storage';

 type Member = {
   numberId: string;
   firstName: string;
   lastName: string;
   zone?: number | string;
 };

 /** ---------- Utils: Thai initials ---------- */
 // พยัญชนะไทย (เฉพาะตัวที่เป็นพยัญชนะจริง ๆ)
 const TH_CONSONANTS = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤฦลวศษสหฬอฮ';

 // true ถ้าเป็นพยัญชนะไทย
 const isThaiConsonant = (ch: string) => TH_CONSONANTS.includes(ch);

 // true ถ้าเป็นตัวอักษรอังกฤษ A-Z
 const isLatinLetter = (ch: string) => /[A-Za-z]/.test(ch);

 // คืน “ตัวอักษรย่อ” ตัวแรก โดย
 // - ข้ามสระนำ/วรรณยุกต์/สัญลักษณ์ จนกว่าจะเจอพยัญชนะไทย
 // - ถ้าไม่เจอ ให้ลองตัวอักษรอังกฤษ
 // - ถ้าไม่เจออีก คืนตัวแรกที่เป็นตัวอักษร (fallback)
 const firstMeaningfulInitial = (nameRaw: string): string => {
   const name = (nameRaw || '').trim();

   // 1) หา “พยัญชนะไทย” ตัวแรก
   for (const ch of name) {
     if (isThaiConsonant(ch)) return ch;
   }
   // 2) หา “ตัวอักษรอังกฤษ” ตัวแรก
   for (const ch of name) {
     if (isLatinLetter(ch)) return ch.toUpperCase();
   }
   // 3) fallback: ตัวแรกที่เป็นตัวอักษร/ตัวเลข
   const m = name.match(/[A-Za-z0-9ก-๙]/);
   return m ? (/[A-Za-z]/.test(m[0]) ? m[0].toUpperCase() : m[0]) : 'U';
 };

 const DeleteMemberPage = () => {
   const navigation = useNavigation();
   const [members, setMembers] = useState<Member[]>([]);
   const [officerId, setOfficerId] = useState<string>('');
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);

   const [notif, setNotif] = useState<{visible:boolean; title?:string; message?:string}>({ visible:false });
   const [confirm, setConfirm] = useState<{visible:boolean; member?:Member}>({ visible:false });

   const [q, setQ] = useState('');
   const [sortAsc, setSortAsc] = useState(true);
   const [zoneFilter, setZoneFilter] = useState<string>('');

   useEffect(() => { loadMembers(); }, []);

   const loadMembers = async () => {
     try {
       setLoading(true);
       const stored = await AsyncStorage.getItem('userData');
       const u = stored ? JSON.parse(stored) : null;
       if (!u?.officerId) {
         setNotif({ visible:true, title:'แจ้งเตือน', message:'ไม่พบบัญชีเจ้าหน้าที่' });
         setMembers([]);
         return;
       }
       setOfficerId(String(u.officerId));
       const data = await fetchOfficerData(u.officerId);
       setMembers(Array.isArray(data) ? data : []);
     } catch (e:any) {
       setNotif({ visible:true, title:'เกิดข้อผิดพลาด', message: e?.message?.toString?.() || 'โหลดรายชื่อลูกบ้านไม่สำเร็จ' });
     } finally {
       setLoading(false);
     }
   };

   const onRefresh = useCallback(async () => {
     setRefreshing(true);
     await loadMembers();
     setRefreshing(false);
   }, []);

   const askDelete = (member: Member) => setConfirm({ visible:true, member });

   const doDelete = async () => {
     const m = confirm.member; if (!m) return setConfirm({visible:false});
     try {
       // optimistic update
       setMembers(prev => prev.filter(x => !(x.numberId === m.numberId && x.firstName === m.firstName && x.lastName === m.lastName)));
       setConfirm({ visible:false });
       await deleteUser({ numberId: m.numberId, firstName: m.firstName, lastName: m.lastName });
       setNotif({ visible:true, title:'ลบสำเร็จ', message:`${m.firstName} ${m.lastName} ถูกลบออกเรียบร้อย` });
     } catch (e:any) {
       await loadMembers(); // rollback
       setNotif({ visible:true, title:'เกิดข้อผิดพลาด', message: e?.message?.toString?.() || 'ไม่สามารถลบลูกบ้านได้' });
     }
   };

   // ---------- filter/sort ----------
   const filtered = useMemo(() => {
     const query = q.trim().toLowerCase();
     const z = zoneFilter.trim();

     let list = members.filter(m => {
       const full = `${m.firstName} ${m.lastName}`.toLowerCase();
       const hitQ = !query || full.includes(query) || String(m.numberId || '').toLowerCase().includes(query);
       const hitZ = !z || String(m.zone ?? '').toString() === z;
       return hitQ && hitZ;
     });

     list.sort((a, b) => {
       const A = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
       const B = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
       if (A < B) return sortAsc ? -1 : 1;
       if (A > B) return sortAsc ? 1 : -1;
       return 0;
     });

     return list;
   }, [members, q, zoneFilter, sortAsc]);

   // ---------- UI ----------
   const renderItem = ({ item }: { item: Member }) => {
     const init1 = firstMeaningfulInitial(item.firstName);
     const init2 = firstMeaningfulInitial(item.lastName);
     const initials = `${init1}${init2}`;

     return (
       <View style={styles.memberCard}>
         <View style={styles.rowLeft}>
           <View style={styles.avatar}>
             <Text style={styles.avatarText}>{initials}</Text>
           </View>
           <View style={{ flexShrink:1 }}>
             <Text style={styles.memberName} numberOfLines={1}>
               {item.firstName} {item.lastName}
             </Text>
             <Text style={styles.memberMeta} numberOfLines={1}>
               #{item.numberId} • โซน {item.zone ?? '-'}
             </Text>
           </View>
         </View>

         <TouchableOpacity style={styles.deleteButton} onPress={() => askDelete(item)}>
           <Text style={styles.deleteButtonText}>ลบ</Text>
         </TouchableOpacity>
       </View>
     );
   };

   if (loading) {
     return (
       <View style={[styles.screen, { justifyContent:'center' }]}>
         <ActivityIndicator size="large" color="#0288D1" />
       </View>
     );
   }

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
             <Text style={styles.badgeText}>ลบรายชื่อลูกบ้าน</Text>
           </View>
         </View>
       </View>

       {/* Summary Row */}
       <View style={styles.summaryRow}>
         <View style={[styles.summaryCard, { backgroundColor:'#0288D1'}]}>
           <Text style={styles.summaryNum}>{members.length}</Text>
           <Text style={styles.summaryLabel}>ทั้งหมด</Text>
         </View>
         <View style={[styles.summaryCard, { backgroundColor:'#26A69A'}]}>
           <Text style={styles.summaryNum}>{filtered.length}</Text>
           <Text style={styles.summaryLabel}>หลังกรอง</Text>
         </View>
         <View style={[styles.summaryCard, { backgroundColor:'#7E57C2'}]}>
           <Text style={styles.summaryNum}>{sortAsc ? 'A→Z' : 'Z→A'}</Text>
           <Text style={styles.summaryLabel}>เรียงชื่อ</Text>
         </View>
       </View>

       {/* Filters Card */}
       <View style={styles.card}>
         <Text style={styles.cardTitle}>ค้นหา & กรอง</Text>

         <View style={styles.filterRow}>
           <View style={{ flex:1 }}>
             <Text style={styles.label}>ค้นหาชื่อ / numberId</Text>
             <TextInput
               value={q}
               onChangeText={setQ}
               placeholder="พิมพ์เพื่อค้นหา…"
               placeholderTextColor="#9FB3C8"
               style={styles.input}
               autoCapitalize="none"
             />
           </View>

           <View style={{ width:110 }}>
             <Text style={styles.label}>โซน</Text>
             <TextInput
               value={zoneFilter}
               onChangeText={(v) => setZoneFilter(v.replace(/\D+/g, '').slice(0,3))}
               placeholder="เช่น 1"
               placeholderTextColor="#9FB3C8"
               keyboardType="numeric"
               style={styles.input}
             />
           </View>
         </View>

         <View style={styles.filterActions}>
           <TouchableOpacity
             style={[styles.secondaryBtn]}
             onPress={() => { setQ(''); setZoneFilter(''); }}
           >
             <Text style={styles.secondaryBtnText}>ล้างตัวกรอง</Text>
           </TouchableOpacity>

           <TouchableOpacity
             style={[styles.primaryBtn]}
             onPress={() => setSortAsc(s => !s)}
           >
             <Text style={styles.primaryBtnText}>{sortAsc ? 'เรียง Z→A' : 'เรียง A→Z'}</Text>
           </TouchableOpacity>
         </View>
       </View>

       {/* List */}
       <FlatList
         data={filtered}
         keyExtractor={(item, idx) => `${item.numberId}-${idx}`}
         renderItem={renderItem}
         contentContainerStyle={{ paddingHorizontal:16, paddingBottom:120 }}
         refreshControl={
           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0288D1" />
         }
         ListEmptyComponent={
           <View style={styles.emptyBox}>
             <Text style={styles.emptyTitle}>ไม่พบรายการ</Text>
             <Text style={styles.emptyText}>
               ลองปรับเงื่อนไขค้นหาหรือดึงข้อมูลใหม่อีกครั้ง
             </Text>
             <TouchableOpacity style={styles.primaryBtn} onPress={loadMembers}>
               <Text style={styles.primaryBtnText}>โหลดใหม่</Text>
             </TouchableOpacity>
           </View>
         }
       />

       {/* Notif Modal */}
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

       {/* Confirm Modal */}
       <Modal transparent animationType="fade" visible={confirm.visible} onRequestClose={() => setConfirm({ visible:false })}>
         <View style={styles.toastBackdrop}>
           <View style={styles.toastCard}>
             <Text style={styles.toastTitle}>ยืนยันการลบ</Text>
             <Text style={styles.toastMsg}>
               ต้องการลบ {confirm.member?.firstName} {confirm.member?.lastName} หรือไม่?
             </Text>
             <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10 }}>
               <TouchableOpacity onPress={() => setConfirm({ visible:false })} style={[styles.toastBtn, { backgroundColor:'#9e9e9e' }]}>
                 <Text style={styles.toastBtnText}>ยกเลิก</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={doDelete} style={[styles.toastBtn, { backgroundColor:'#e53935' }]}>
                 <Text style={styles.toastBtnText}>ลบ</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
     </KeyboardAvoidingView>
   );
 };

 export default DeleteMemberPage;

 const styles = StyleSheet.create({
   screen:{ flex:1, backgroundColor:'#E9F4FF', alignItems:'center', padding:16 },

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
   summaryNum:{ fontSize:22, fontWeight:'900', color:'#fff' },
   summaryLabel:{ fontSize:12, fontWeight:'700', color:'#EAF6FF', marginTop:2 },

   // Card
   card: {
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

   // Filters
   filterRow:{ flexDirection:'row', gap:10 },
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
   },
   filterActions:{
     marginTop:12,
     flexDirection:'row',
     justifyContent:'flex-end',
     gap:10,
   },
   primaryBtn:{
     backgroundColor:'#1976D2',
     paddingHorizontal:14, paddingVertical:10,
     borderRadius:12, alignItems:'center', justifyContent:'center', minWidth:110,
     shadowColor:'#000', shadowOpacity:.08, shadowOffset:{width:0, height:4}, shadowRadius:8, elevation:2
   },
   primaryBtnText:{ color:'#fff', fontWeight:'800' },
   secondaryBtn:{
     backgroundColor:'#E3EDF6',
     paddingHorizontal:14, paddingVertical:10,
     borderRadius:12, alignItems:'center', justifyContent:'center', minWidth:110,
   },
   secondaryBtnText:{ color:'#0D2A4A', fontWeight:'800' },

   // Member item
   memberCard:{
     backgroundColor:'#FFFFFF',
     borderRadius:16,
     marginHorizontal:16,
     marginTop:10,
     padding:12,
     flexDirection:'row',
     alignItems:'center',
     justifyContent:'space-between',
     shadowColor:'#000',
     shadowOpacity:.08,
     shadowOffset:{ width:0, height:6 },
     shadowRadius:10,
     elevation:3,
   },
   rowLeft:{ flexDirection:'row', alignItems:'center', gap:12, flex:1 },
   avatar:{
     minWidth:44, height:44, borderRadius:12,
     backgroundColor:'#0288D1',
     alignItems:'center', justifyContent:'center', paddingHorizontal:8
   },
   avatarText:{ color:'#fff', fontWeight:'900', fontSize:16 },
   memberName:{ color:'#0D2A4A', fontWeight:'900', fontSize:16, maxWidth:210 },
   memberMeta:{ color:'#6C89A3', fontWeight:'600', marginTop:2 },

   deleteButton:{ backgroundColor:'#e53935', paddingVertical:8, paddingHorizontal:14, borderRadius:12, minWidth:64, alignItems:'center' },
   deleteButtonText:{ color:'#fff', fontWeight:'800' },

   // Empty
   emptyBox:{
     backgroundColor:'#FFFFFF',
     borderRadius:18,
     padding:20,
     marginHorizontal:16,
     marginTop:18,
     alignItems:'center',
     shadowColor:'#000',
     shadowOpacity:.06,
     shadowOffset:{width:0, height:4},
     shadowRadius:8,
     elevation:2
   },
   emptyTitle:{ fontSize:18, fontWeight:'900', color:'#0D2A4A', marginBottom:6 },
   emptyText:{ color:'#6C89A3', textAlign:'center', marginBottom:12 },

   // Toast / Modal
   toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
   toastCard:{ width:'86%', backgroundColor:'#fff', borderRadius:16, padding:18 },
   toastTitle:{ fontSize:18, fontWeight:'700', marginBottom:6, color:'#0D2A4A' },
   toastMsg:{ fontSize:15, color:'#2E4B66', marginBottom:14 },
   toastBtn:{ paddingVertical:10, paddingHorizontal:16, borderRadius:12, backgroundColor:'#1976D2', alignSelf:'flex-end' },
   toastBtnText:{ color:'#fff', fontWeight:'800' },
 });
