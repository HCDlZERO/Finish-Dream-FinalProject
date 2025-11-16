import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Alert,
  TouchableOpacity, TextInput, RefreshControl, Modal, ActivityIndicator
} from 'react-native';
import {
  fetchPendingUsers,
  approveRequestAPI,
  processDeleteAPI
} from '../services/apiService';

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

type PendingItem = {
  numberId: string;
  firstName?: string;
  lastName?: string;
  tag: 'Approve' | 'delete';
};

const TABS = ['Approve', 'delete'] as const;
type TabKey = typeof TABS[number];

const ApproveRequest = () => {
  const [approveList, setApproveList] = useState<PendingItem[]>([]);
  const [deleteList, setDeleteList] = useState<PendingItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('Approve');

  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [notif, setNotif] = useState<{visible:boolean; title?:string; message?:string}>({ visible:false });
  const [confirm, setConfirm] = useState<{visible:boolean; type?:TabKey; numberId?:string; name?:string; action?:'Yes'|'No'}>({ visible:false });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingUsers();
      const approve = (data || []).filter((item: any) => item.tag === 'Approve');
      const toDelete = (data || []).filter((item: any) => item.tag === 'delete');
      setApproveList(approve);
      setDeleteList(toDelete);
    } catch (error:any) {
      setNotif({ visible:true, title:'โหลดข้อมูลล้มเหลว', message: error?.message?.toString?.() || 'ไม่สามารถโหลดรายการคำขอได้' });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadData(); }
    finally { setRefreshing(false); }
  }, []);

  const handleApproveAction = async (numberId: string, tag: 'Yes' | 'No') => {
    try {
      await approveRequestAPI(numberId, tag);
      setNotif({ visible:true, title:'สำเร็จ', message:`ส่งคำสั่ง Approve (${tag}) แล้ว` });
      await loadData();
    } catch (error:any) {
      setNotif({ visible:true, title:'ผิดพลาด', message: error?.message?.toString?.() || 'ส่งคำสั่งล้มเหลว' });
    }
  };

  const handleDeleteAction = async (numberId: string, tag: 'Yes' | 'No') => {
    try {
      await processDeleteAPI(numberId, tag);
      setNotif({ visible:true, title:'สำเร็จ', message:`ส่งคำสั่ง Delete (${tag}) แล้ว` });
      await loadData();
    } catch (error:any) {
      setNotif({ visible:true, title:'ผิดพลาด', message: error?.message?.toString?.() || 'ส่งคำสั่งล้มเหลว' });
    }
  };

  const askConfirm = (type: TabKey, item: PendingItem, action: 'Yes'|'No') =>
    setConfirm({ visible:true, type, numberId:item.numberId, name:`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(), action });

  const onConfirm = async () => {
    const { type, numberId, action } = confirm;
    if (!type || !numberId || !action) return setConfirm({ visible:false });
    setConfirm({ visible:false });
    if (type === 'Approve') return handleApproveAction(numberId, action);
    return handleDeleteAction(numberId, action);
  };

  const currentList = activeTab === 'Approve' ? approveList : deleteList;
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return currentList
      .filter(i => {
        if (!kw) return true;
        const full = `${i.firstName ?? ''} ${i.lastName ?? ''}`.toLowerCase();
        return full.includes(kw) || (i.numberId ?? '').toString().toLowerCase().includes(kw);
      })
      .sort((a,b) => `${a.firstName ?? ''}${a.lastName ?? ''}`.localeCompare(`${b.firstName ?? ''}${b.lastName ?? ''}`, 'th'));
  }, [currentList, keyword]);

  const renderItem = ({ item }: { item: PendingItem }) => {
    const initials = makeInitials(item.firstName, item.lastName);
    const statusColor = activeTab === 'Approve' ? '#0288D1' : '#D32F2F';
    return (
      <View style={styles.card}>
        <View style={[styles.leftAccent, { backgroundColor: statusColor }]} />
        <View style={styles.cardContent}>
          <View style={[styles.avatar, { borderColor: statusColor + '55' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={{ flex:1 }}>
            <Text style={styles.nameText}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.subText}>หมายเลข: {item.numberId}</Text>
          </View>

          <View style={styles.rightCol}>
            <View style={[styles.badge, { backgroundColor: statusColor }]}>
              <Text style={styles.badgeText}>{activeTab === 'Approve' ? 'รออนุมัติ' : 'รอลบ'}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                activeOpacity={0.9}
                onPress={() => askConfirm(activeTab, item, 'Yes')}
              >
                <Text style={styles.actionText}>อนุมัติ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                activeOpacity={0.9}
                onPress={() => askConfirm(activeTab, item, 'No')}
              >
                <Text style={styles.actionText}>ไม่อนุมัติ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={{ marginTop:10, color:'#4E6E90' }}>กำลังโหลดรายการ...</Text>
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
        <Text style={styles.title}>คำขอจัดการผู้ใช้</Text>
        <Text style={styles.subtitle}>อนุมัติผู้สมัคร / ลบผู้ใช้ที่ร้องขอ</Text>
      </View>

      {/* Tabs with counters */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'Approve' && styles.tabActive]}
          onPress={() => setActiveTab('Approve')}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === 'Approve' && styles.tabTextActive]}>
            รออนุมัติ ({approveList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'delete' && styles.tabActiveDanger]}
          onPress={() => setActiveTab('delete')}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === 'delete' && styles.tabTextActive]}>
            รอลบ ({deleteList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="ค้นหาชื่อหรือหมายเลข..."
          placeholderTextColor="#7FA3C1"
          value={keyword}
          onChangeText={setKeyword}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.numberId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>ไม่มีรายการในแท็บนี้</Text>
            <Text style={styles.emptyDesc}>ลองค้นหาคำอื่น หรือเปลี่ยนแท็บด้านบน</Text>
          </View>
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
            <Text style={styles.toastTitle}>ยืนยันการดำเนินการ</Text>
            <Text style={styles.toastMsg}>
              {confirm.type === 'Approve' ? 'ดำเนินการ Approve' : 'ดำเนินการ Delete'} ({confirm.action}) กับ {confirm.name || confirm.numberId} ?
            </Text>
            <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10 }}>
              <TouchableOpacity onPress={() => setConfirm({ visible:false })} style={[styles.toastBtn, { backgroundColor:'#9e9e9e' }]}>
                <Text style={styles.toastBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirm} style={[styles.toastBtn, { backgroundColor: confirm.type === 'Approve' ? '#0288D1' : '#D32F2F' }]}>
                <Text style={styles.toastBtnText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ApproveRequest;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E9F4FF',
    flex: 1,
  },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  brand: { fontSize: 28, fontWeight: '900', letterSpacing: 1, color: '#0D2A4A' },
  brandAccent: { color: '#FF4081' },
  refreshChip: {
    backgroundColor: '#0288D1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    shadowColor: '#0288D1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  refreshText: { color: '#fff', fontWeight: '700' },

  // Title
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A' },
  subtitle: { fontSize: 12, color: '#4E6E90', marginTop: 4 },

  // Tabs
  tabsRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 12 },
  tabChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9BC6E3',
    backgroundColor: '#F4FAFF',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#0288D1', borderColor: '#0288D1' },
  tabActiveDanger: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  tabText: { color: '#0D2A4A', fontWeight: '800', fontSize: 12 },
  tabTextActive: { color: '#fff' },

  // Search
  searchBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7DFEF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  searchInput: { fontSize: 14, color: '#0D2A4A' },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1EEF7',
    position: 'relative',
    marginBottom: 12,
  },
  leftAccent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: { fontWeight: '900', fontSize: 16, color: '#0D2A4A' },
  nameText: { fontSize: 16, fontWeight: '800', color: '#0D2A4A', marginBottom: 2 },
  subText: { fontSize: 12, color: '#4E6E90' },
  rightCol: { alignItems: 'flex-end', gap: 8 },

  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 11 },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999,
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 2,
  },
  approveBtn: { backgroundColor: '#00C853' },
  rejectBtn: { backgroundColor: '#EF5350' },
  actionText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.2 },

  // Empty
  emptyWrap: {
    width: '100%', backgroundColor: '#F7FBFF', borderWidth: 1, borderColor: '#D7E8F5',
    borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center',
  },
  emptyEmoji: { fontSize: 28, marginBottom: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0D2A4A' },
  emptyDesc: { fontSize: 12, color: '#4E6E90', marginTop: 4, textAlign: 'center' },

  // Modal / Toast
  toastBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  toastCard: { width:'86%', backgroundColor:'#fff', borderRadius:18, padding:18, borderWidth:1, borderColor:'#E1EEF7' },
  toastTitle: { fontSize:18, fontWeight:'900', color:'#0D2A4A', marginBottom:6 },
  toastMsg: { fontSize:14, color:'#4E6E90', marginBottom:14 },
  toastBtn: { paddingVertical:10, paddingHorizontal:16, borderRadius:12 },
  toastBtnText: { color:'#fff', fontWeight:'800' },
});
