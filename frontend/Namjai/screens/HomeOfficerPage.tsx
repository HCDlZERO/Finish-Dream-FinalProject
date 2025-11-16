import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { fetchOfficerData } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUS_COLORS: Record<string, string> = {
  Red: '#EF5350', Orange: '#FB8C00', Yellow: '#FFEB3B',
  Green: '#66BB6A', Gray: '#BDBDBD', Default: '#0288D1',
};

const STATUS_LABELS: Record<string, string> = {
  Gray: 'รอชำระ', Green: 'จ่ายแล้ว', Yellow: 'เงินสด',
  Orange: 'ค้าง', Red: 'เกินกำหนด',
};

const HomeOfficerPage = ({ navigation }: any) => {
  const [officerData, setOfficerData] = useState<any[]>([]);
  const [officerId, setOfficerId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Gray' | 'Green' | 'Yellow' | 'Orange' | 'Red'>('ALL');

  useEffect(() => {
    (async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        const userData = storedUserData ? JSON.parse(storedUserData) : null;
        if (userData?.officerId) setOfficerId(String(userData.officerId));
      } catch (e) {
        console.error('Error getting stored data:', e);
      }
    })();
  }, []);

  const fetchData = useCallback(async () => {
    if (!officerId) return;
    try {
      const data = await fetchOfficerData(officerId);
      setOfficerData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching officer data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [officerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return officerData.filter((u) => {
      const okStatus = statusFilter === 'ALL' ? true : u.paymentStatus === statusFilter;
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return okStatus && (s ? name.includes(s) : true);
    });
  }, [officerData, search, statusFilter]);

  const summary = useMemo(() => {
    const base = { Gray:0, Green:0, Yellow:0, Orange:0, Red:0 };
    officerData.forEach(u => { base[u.paymentStatus as keyof typeof base] = (base[u.paymentStatus as keyof typeof base] || 0) + 1; });
    const total = officerData.length;
    return { ...base, total };
  }, [officerData]);

  const goBills = (officer: any) => navigation.navigate('UserBillsInfo', {
    officerId, paymentStatus: officer.paymentStatus, numberId: officer.numberId, cashTime: officer.cashTime,
  });
  const goCreateBills = () => navigation.navigate('CreateBills', { officerId, users: officerData });
  const goSetting = () => navigation.navigate('SettingOfficerInfo', { officerId });
  const goAddMember = () => navigation.navigate('AddMemberPage');
  const goDeleteMember = () => navigation.navigate('DeleteMemberPage');

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>
          NAM<Text style={styles.brandAccent}>JAI</Text>
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshChip}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>⟳ รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor:'#0288D1' }]}>
          <Text style={styles.summaryNum}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>ทั้งหมด</Text>
        </View>
        {(['Green','Gray','Yellow','Orange','Red'] as const).map(k => (
          <View key={k} style={[styles.summaryChip, { backgroundColor: STATUS_COLORS[k] }]}>
            <Text style={styles.summaryChipLabel}>{STATUS_LABELS[k]}</Text>
            <Text style={styles.summaryChipNum}>{(summary as any)[k] || 0}</Text>
          </View>
        ))}
      </View>

      {/* Search + Filter chips */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="ค้นหาชื่อ-สกุล..."
          placeholderTextColor="#8aa4b8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.filterRow}>
        {(['ALL','Green','Gray','Yellow','Orange','Red'] as const).map(s => {
          const active = statusFilter === s;
          const bg = s === 'ALL' ? '#90CAF9' : STATUS_COLORS[s] || STATUS_COLORS.Default;
          return (
            <TouchableOpacity key={s} onPress={()=>setStatusFilter(s)} style={[styles.filterChip, { backgroundColor: active ? bg : '#E3F2FD', borderColor: bg }]}>
              <Text style={{ color: active ? (s==='Yellow'?'#333':'#fff') : '#4F6B88', fontWeight:'700' }}>
                {s==='ALL' ? 'ทั้งหมด' : STATUS_LABELS[s]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <View style={{ width:'92%', gap:12, marginTop:6 }}>
        {filtered.map((u:any, idx:number) => (
          <TouchableOpacity key={`${u.numberId}-${idx}`} onPress={()=>goBills(u)} activeOpacity={0.85}>
            <View style={styles.card}>
              <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[u.paymentStatus] || STATUS_COLORS.Default }]} />
              <View style={styles.cardRow}>
                <View style={{ flex:1 }}>
                  <Text style={styles.name}>{u.firstName} {u.lastName}</Text>
                  <Text style={styles.subtle}>หมายเลขผู้ใช้: {u.numberId}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, u.paymentStatus==='Yellow' && { color:'#333' }]}>
                    {STATUS_LABELS[u.paymentStatus] || u.paymentStatus}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={{ textAlign:'center', color:'#6B7C8F', marginTop:16 }}>ไม่พบรายการที่ตรงเงื่อนไข</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor:'#0288D1' }]} onPress={goAddMember}>
          <Text style={styles.actionEmoji}>＋</Text>
          <Text style={styles.actionLabel}>เพิ่มลูกบ้าน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor:'#546E7A' }]} onPress={goDeleteMember}>
          <Text style={styles.actionEmoji}>－</Text>
          <Text style={styles.actionLabel}>ลดลูกบ้าน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor:'#43A047' }]} onPress={goCreateBills}>
          <Text style={styles.actionEmoji}>🧾</Text>
          <Text style={styles.actionLabel}>สร้างบิล</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor:'#FB8C00' }]} onPress={goSetting}>
          <Text style={styles.actionEmoji}>⚙️</Text>
          <Text style={styles.actionLabel}>ตั้งค่า</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeOfficerPage;

const styles = StyleSheet.create({
  container:{ flexGrow:1, backgroundColor:'#E9F4FF', alignItems:'center', paddingVertical:16 },
  header:{ flexDirection:'row', justifyContent:'space-between', width:'92%', alignItems:'center', marginBottom:10 },
  brand:{ fontSize:28, fontWeight:'900', letterSpacing:1, color:'#0D2A4A' },
  brandAccent:{ color:'#FF4081' },
  refreshChip:{ backgroundColor:'#0288D1', paddingVertical:8, paddingHorizontal:14, borderRadius:999 },

  summaryRow:{ width:'92%', marginTop:6, marginBottom:8, flexDirection:'row', flexWrap:'wrap', gap:10, alignItems:'stretch' },
  summaryCard:{ flexGrow:1, minWidth:'22%', borderRadius:14, padding:12, justifyContent:'center', alignItems:'center' },
  summaryNum:{ fontSize:22, fontWeight:'900', color:'#fff' },
  summaryLabel:{ fontSize:12, fontWeight:'700', color:'#EAF6FF' },
  summaryChip:{ borderRadius:12, paddingVertical:8, paddingHorizontal:12, flexDirection:'row', alignItems:'center', gap:8 },
  summaryChipLabel:{ fontSize:12, fontWeight:'800', color:'#fff' },
  summaryChipNum:{ fontSize:14, fontWeight:'900', color:'#fff' },

  searchBox:{ width:'92%', backgroundColor:'#fff', borderRadius:12, borderWidth:1, borderColor:'#CFE3F7', paddingHorizontal:12, paddingVertical:8, marginTop:6 },
  searchInput:{ fontSize:16, color:'#123', paddingVertical:4 },

  filterRow:{ width:'92%', flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10 },
  filterChip:{ borderWidth:1.5, paddingVertical:6, paddingHorizontal:10, borderRadius:999 },

  card:{ backgroundColor:'#fff', borderRadius:16, shadowColor:'#000', shadowOpacity:0.08, shadowOffset:{ width:0, height:2 }, shadowRadius:8, elevation:3, overflow:'hidden' },
  statusBar:{ height:6, width:'100%' },
  cardRow:{ flexDirection:'row', alignItems:'center', padding:14, gap:10 },
  name:{ fontSize:16, fontWeight:'800', color:'#1C3557' },
  subtle:{ fontSize:12, color:'#6B7C8F', marginTop:2 },
  badge:{ backgroundColor:'#EEF5FF', paddingVertical:6, paddingHorizontal:10, borderRadius:999 },
  badgeText:{ fontWeight:'900', color:'#1C3557', fontSize:12 },

  actionsGrid:{ width:'92%', marginTop:16, marginBottom:22, flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'space-between' },
  actionBtn:{ flexBasis:'48%', borderRadius:16, paddingVertical:16, alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.08, shadowOffset:{ width:0, height:2 }, shadowRadius:6, elevation:3 },
  actionEmoji:{ fontSize:22, color:'#fff', marginBottom:4, fontWeight:'900' },
  actionLabel:{ fontSize:14, color:'#fff', fontWeight:'800' },
});
