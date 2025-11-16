import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, Modal, TextInput, RefreshControl
} from 'react-native';
import { fetchAllHeadOfficers, deleteHeadOfficer } from '../services/apiService';

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

type Officer = {
  numberId: string | number;
  firstName?: string;
  lastName?: string;
  role?: 'Officer' | 'Technician' | 'HeadOfficer' | string;
  zoneId?: number | string;
};

const ROLE_FILTERS = ['ทั้งหมด', 'Officer', 'Technician', 'HeadOfficer'] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const roleColor = (role?: string) => {
  switch (role) {
    case 'HeadOfficer': return '#0D47A1';
    case 'Technician':  return '#7B1FA2';
    case 'Officer':     return '#0288D1';
    default:            return '#607D8B';
  }
};

const DeleteOfficer = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [notif, setNotif] = useState<{visible:boolean; title?:string; message?:string}>({ visible:false });
  const [confirm, setConfirm] = useState<{visible:boolean; numberId?:string; name?:string}>({ visible:false });

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<RoleFilter>('ทั้งหมด');

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllHeadOfficers();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (e:any) {
      setNotif({ visible:true, title:'โหลดข้อมูลล้มเหลว', message: e?.message?.toString?.() || 'ไม่สามารถดึงรายชื่อเจ้าหน้าที่ได้' });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOfficers(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadOfficers(); }
    finally { setRefreshing(false); }
  }, []);

  const askDelete = (numberId: string, name: string) => setConfirm({ visible:true, numberId, name });

  const handleDelete = async () => {
    const { numberId } = confirm; if (!numberId) return setConfirm({ visible:false });
    try {
      setLoading(true);
      await deleteHeadOfficer(numberId);
      setNotif({ visible:true, title:'สำเร็จ', message:`ลบ ${numberId} แล้ว` });
      setConfirm({ visible:false });
      await loadOfficers();
    } catch (e:any) {
      setNotif({ visible:true, title:'ลบไม่สำเร็จ', message: e?.message?.toString?.() || 'ไม่สามารถลบเจ้าหน้าที่ได้' });
      setConfirm({ visible:false });
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return officers
      .filter(o => {
        const byRole = filter === 'ทั้งหมด' ? true : (o.role ?? '') === filter;
        if (!byRole) return false;
        if (!kw) return true;
        const full = `${o.firstName ?? ''} ${o.lastName ?? ''}`.toLowerCase();
        return (
          full.includes(kw) ||
          String(o.numberId ?? '').toLowerCase().includes(kw) ||
          String(o.zoneId ?? '').toLowerCase().includes(kw) ||
          String(o.role ?? '').toLowerCase().includes(kw)
        );
      })
      .sort((a, b) =>
        `${a.firstName ?? ''}${a.lastName ?? ''}`.localeCompare(
          `${b.firstName ?? ''}${b.lastName ?? ''}`,
          'th'
        )
      );
  }, [officers, keyword, filter]);

  const renderItem = ({ item }: { item: Officer }) => {
    const initials = makeInitials(item.firstName, item.lastName);
    const color = roleColor(item.role);
    return (
      <View style={styles.card}>
        <View style={[styles.leftAccent, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={[styles.avatar, { borderColor: color + '55' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={styles.nameText}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.subText}>หมายเลข: {item.numberId}</Text>
            <Text style={styles.subText}>Zone: {item.zoneId ?? '-'}</Text>
          </View>
          <View style={styles.rightCol}>
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{item.role ?? 'Unknown'}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => askDelete(String(item.numberId), `${item.firstName} ${item.lastName}`)}
              activeOpacity={0.9}
            >
              <Text style={styles.deleteButtonText}>ลบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading && officers.length === 0) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={{ marginTop:10, color:'#4E6E90' }}>กำลังโหลดรายชื่อ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Nam<Text style={styles.brandAccent}>Jai</Text></Text>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.85} style={styles.refreshChip}>
          <Text style={styles.refreshText}>รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ลบรายชื่อเจ้าหน้าที่</Text>
        <Text style={styles.subtitle}>ลบผู้ใช้งานที่ไม่ใช้งานแล้วออกจากระบบ</Text>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="ค้นหาชื่อ, หมายเลข, Zone, หรือบทบาท..."
            placeholderTextColor="#7FA3C1"
            value={keyword}
            onChangeText={setKeyword}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <View style={styles.filterRow}>
          {ROLE_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.numberId)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyTitle}>ยังไม่มีข้อมูล</Text>
              <Text style={styles.emptyDesc}>ลองเปลี่ยนตัวกรองหรือค้นหาใหม่อีกครั้ง</Text>
            </View>
          ) : null
        }
      />

      {/* Notif Modal */}
      <Modal transparent animationType="fade" visible={notif.visible} onRequestClose={() => setNotif({ visible:false })}>
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>{notif.title || 'แจ้งเตือน'}</Text>
            {!!notif.message && <Text style={styles.toastMsg}>{notif.message}</Text>}
            <TouchableOpacity onPress={() => setNotif({ visible:false })} style={[styles.toastBtn, { backgroundColor:'#0288D1' }]}>
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
            <Text style={styles.toastMsg}>ต้องการลบ {confirm.name || confirm.numberId} หรือไม่?</Text>
            <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10 }}>
              <TouchableOpacity onPress={() => setConfirm({ visible:false })} style={[styles.toastBtn, { backgroundColor:'#9e9e9e' }]}>
                <Text style={styles.toastBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={[styles.toastBtn, { backgroundColor:'#e53935' }]}>
                <Text style={styles.toastBtnText}>ลบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeleteOfficer;

const styles = StyleSheet.create({
  container:{ paddingVertical:16, paddingHorizontal:16, flex:1, backgroundColor:'#E9F4FF' },

  // Header
  headerRow:{ width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  brand:{ fontSize:28, fontWeight:'900', letterSpacing:1, color:'#0D2A4A' },
  brandAccent:{ color:'#FF4081' },
  refreshChip:{
    backgroundColor:'#0288D1', paddingVertical:8, paddingHorizontal:14, borderRadius:999,
    shadowColor:'#0288D1', shadowOpacity:0.25, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:4,
  },
  refreshText:{ color:'#fff', fontWeight:'700' },

  // Title
  titleWrap:{ width:'100%', marginTop:6, marginBottom:12 },
  title:{ fontSize:18, fontWeight:'800', color:'#0D2A4A' },
  subtitle:{ fontSize:12, color:'#4E6E90', marginTop:4 },

  // Search + Filters
  searchRow:{ width:'100%', marginTop:4, marginBottom:12 },
  searchBox:{
    backgroundColor:'#ffffff', borderRadius:14, borderWidth:1, borderColor:'#C7DFEF',
    paddingHorizontal:14, paddingVertical:10, shadowColor:'#000', shadowOpacity:0.05,
    shadowOffset:{ width:0, height:4 }, shadowRadius:6, elevation:2,
  },
  searchInput:{ fontSize:14, color:'#0D2A4A' },
  filterRow:{ flexDirection:'row', gap:8, marginTop:10 },
  filterChip:{
    paddingVertical:8, paddingHorizontal:14, borderRadius:999, borderWidth:1,
    borderColor:'#9BC6E3', backgroundColor:'#F4FAFF',
  },
  filterChipActive:{
    backgroundColor:'#0288D1', borderColor:'#0288D1',
    shadowColor:'#0288D1', shadowOpacity:0.25, shadowOffset:{ width:0, height:6 },
    shadowRadius:10, elevation:3,
  },
  filterText:{ color:'#0D2A4A', fontWeight:'700', fontSize:12 },
  filterTextActive:{ color:'#ffffff' },

  // Card (list item)
  card:{
    width:'100%', backgroundColor:'#ffffff', borderRadius:16, padding:14,
    shadowColor:'#0D2A4A', shadowOpacity:0.1, shadowOffset:{ width:0, height:10 },
    shadowRadius:14, elevation:3, borderWidth:1, borderColor:'#E1EEF7', position:'relative', marginBottom:12,
  },
  leftAccent:{ position:'absolute', left:0, top:0, bottom:0, width:6, borderTopLeftRadius:16, borderBottomLeftRadius:16 },
  cardContent:{ flexDirection:'row', alignItems:'center', gap:12 },
  avatar:{
    width:44, height:44, borderRadius:12, backgroundColor:'#F0F7FF',
    justifyContent:'center', alignItems:'center', borderWidth:1,
  },
  avatarText:{ fontWeight:'900', fontSize:16, color:'#0D2A4A' },
  nameText:{ fontSize:16, fontWeight:'800', color:'#0D2A4A', marginBottom:2 },
  subText:{ fontSize:12, color:'#4E6E90' },
  rightCol:{ alignItems:'flex-end', gap:8 },
  badge:{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, alignSelf:'flex-start' },
  badgeText:{ color:'#fff', fontWeight:'900', fontSize:11 },
  deleteButton:{
    backgroundColor:'#e53935', paddingVertical:8, paddingHorizontal:12, borderRadius:999,
    shadowColor:'#e53935', shadowOpacity:0.2, shadowOffset:{ width:0, height:6 }, shadowRadius:10, elevation:4,
  },
  deleteButtonText:{ color:'#fff', fontWeight:'900', fontSize:12, letterSpacing:0.2 },

  // Empty
  emptyWrap:{
    width:'100%', backgroundColor:'#F7FBFF', borderWidth:1, borderColor:'#D7E8F5',
    borderRadius:16, paddingVertical:24, paddingHorizontal:16, alignItems:'center',
  },
  emptyEmoji:{ fontSize:28, marginBottom:6 },
  emptyTitle:{ fontSize:16, fontWeight:'800', color:'#0D2A4A' },
  emptyDesc:{ fontSize:12, color:'#4E6E90', marginTop:4, textAlign:'center' },

  // Toast / Modal
  toastBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard:{ width:'86%', backgroundColor:'#fff', borderRadius:18, padding:18, borderWidth:1, borderColor:'#E1EEF7' },
  toastTitle:{ fontSize:18, fontWeight:'900', color:'#0D2A4A', marginBottom:6 },
  toastMsg:{ fontSize:14, color:'#4E6E90', marginBottom:14 },
  toastBtn:{ paddingVertical:10, paddingHorizontal:16, borderRadius:12 },
  toastBtnText:{ color:'#fff', fontWeight:'800' },
});
