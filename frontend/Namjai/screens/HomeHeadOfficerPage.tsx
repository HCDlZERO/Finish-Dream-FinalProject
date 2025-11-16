import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Alert, TouchableOpacity,
  TextInput, FlatList, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchAllHeadOfficers } from '../services/apiService';

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

const HomeHeadOfficerPage = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<RoleFilter>('ทั้งหมด');

  const navigation = useNavigation<any>();

  const loadOfficers = async () => {
    try {
      const data = await fetchAllHeadOfficers();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลเจ้าหน้าที่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOfficers();
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  const countAll = officers.length;
  const countOfficer = officers.filter(o => o.role === 'Officer').length;
  const countTechnician = officers.filter(o => o.role === 'Technician').length;
  const countHead = officers.filter(o => o.role === 'HeadOfficer').length;

  const renderItem = ({ item }: { item: Officer }) => {
    const initials = makeInitials(item.firstName, item.lastName);
    const color = roleColor(item.role);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          // ถ้าต้องการหน้า detail แยก ค่อยเชื่อมต่อที่นี่
          // navigation.navigate('OfficerDetail', { numberId: item.numberId });
        }}
      >
        <View style={[styles.leftAccent, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={[styles.avatar, { borderColor: color + '55' }]}>
            <Text style={[styles.avatarText, { color: '#0D2A4A' }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nameText}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.subText}>หมายเลข: {item.numberId}</Text>
            <Text style={styles.subText}>Zone: {item.zoneId ?? '-'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{item.role ?? 'Unknown'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => String(item.numberId)}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.brand}>
              Nam<Text style={styles.brandAccent}>Jai</Text>
            </Text>
            <TouchableOpacity onPress={onRefresh} activeOpacity={0.85} style={styles.refreshChip}>
              <Text style={styles.refreshText}>รีเฟรช</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleWrap}>
            <Text style={styles.title}>รายชื่อเจ้าหน้าที่ทั้งหมด</Text>
            <Text style={styles.subtitle}>จัดการบุคลากรและสิทธิ์การทำงาน</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#0288D1' }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('AddOfficer')}
            >
              <Text style={styles.quickTitle}>เพิ่มพนักงาน</Text>
              <Text style={styles.quickHint}>สร้างบัญชีและกำหนดบทบาท</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#7B1FA2' }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('DeleteOfficer')}
            >
              <Text style={styles.quickTitle}>ลบพนักงาน</Text>
              <Text style={styles.quickHint}>จัดการรายชื่อออกจากระบบ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#0D47A1' }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ApproveRequest')}
            >
              <Text style={styles.quickTitle}>Approve</Text>
              <Text style={styles.quickHint}>อนุมัติคำขอสิทธิ์งาน</Text>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#0D2A4A' }]}>
              <Text style={styles.summaryNum}>{countAll}</Text>
              <Text style={styles.summaryLabel}>ทั้งหมด</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#0288D1' }]}>
              <Text style={styles.summaryNum}>{countOfficer}</Text>
              <Text style={styles.summaryLabel}>Officer</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#7B1FA2' }]}>
              <Text style={styles.summaryNum}>{countTechnician}</Text>
              <Text style={styles.summaryLabel}>Technician</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#0D47A1' }]}>
              <Text style={styles.summaryNum}>{countHead}</Text>
              <Text style={styles.summaryLabel}>Head</Text>
            </View>
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

          <Text style={styles.sectionTitle}>รายชื่อเจ้าหน้าที่</Text>
        </View>
      }
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>ยังไม่มีข้อมูล</Text>
            <Text style={styles.emptyDesc}>ลองรีเฟรชหรือปรับตัวกรองการค้นหา</Text>
          </View>
        ) : null
      }
    />
  );
};

export default HomeHeadOfficerPage;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E9F4FF',
    flexGrow: 1,
  },

  headerWrap: { width: '100%' },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0D2A4A',
  },
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

  // Quick Actions
  quickRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
  },
  quickTitle: { color: '#fff', fontWeight: '900', fontSize: 14 },
  quickHint: { color: '#EAF6FF', fontWeight: '600', fontSize: 11, marginTop: 4 },

  // Summary
  summaryRow: {
    width: '100%',
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
  },
  summaryNum: { fontSize: 20, fontWeight: '900', color: '#fff' },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#EAF6FF', marginTop: 2 },

  // Search + Filters
  searchRow: { width: '100%', marginTop: 4, marginBottom: 12 },
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
  },
  searchInput: { fontSize: 14, color: '#0D2A4A' },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9BC6E3',
    backgroundColor: '#F4FAFF',
  },
  filterChipActive: {
    backgroundColor: '#0288D1',
    borderColor: '#0288D1',
    shadowColor: '#0288D1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  filterText: { color: '#0D2A4A', fontWeight: '700', fontSize: 12 },
  filterTextActive: { color: '#ffffff' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0D2A4A',
    marginBottom: 8,
  },

  // List item
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
  avatarText: { fontWeight: '900', fontSize: 16 },
  nameText: { fontSize: 16, fontWeight: '800', color: '#0D2A4A', marginBottom: 2 },
  subText: { fontSize: 12, color: '#4E6E90' },
  badge: {
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 999, alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 11 },

  // Empty
  emptyWrap: {
    width: '100%',
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: '#D7E8F5',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 28, marginBottom: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0D2A4A' },
  emptyDesc: { fontSize: 12, color: '#4E6E90', marginTop: 4, textAlign: 'center' },
});
