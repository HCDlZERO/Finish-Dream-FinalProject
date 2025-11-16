import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { fetchRedAndCancelledBills } from '../services/apiService';

type RedUser = {
  numberId: string;
  firstName: string;
  lastName: string;
  // optional for future proof
  status?: 'Red' | 'Cancel';
};

const FILTERS = ['ทั้งหมด', 'Red', 'Cancel'] as const;
type FilterType = typeof FILTERS[number];

/** ---------- Helpers: Thai initials ---------- */
// สระ “นำ” ภาษาไทย (เขียนก่อนพยัญชนะ): เ แ โ ใ ไ
const THAI_LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);

// เครื่องหมายสระ/วรรณยุกต์/ตัวประกอบที่ควรข้าม
const THAI_COMBINING_MARKS = new Set([
  'ะ', 'ั', 'า', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู',
  '็', '่', '้', '๊', '๋', '์', 'ฺ', 'ํ', '๎'
]);

// อักขระที่ไม่ใช่ตัวอักษร (ช่องว่าง/ขีด/จุด/ฯลฯ) ให้ข้าม
const NON_LETTER = new Set([' ', '-', '_', '.', ',', '(', ')', '[', ']', '{', '}', '/', '\\', 'ฯ', 'ๆ', '฿', '"', '\'', '・']);

// เช็คว่าเป็นพยัญชนะไทย (ก-ฮ) — รวม อ ร ล ฤ ฦ ไว้ด้วย (ถือเป็นพยัญชนะ)
const isThaiConsonant = (ch: string) => {
  if (ch < 'ก' || ch > 'ฮ') return false;
  // ถ้าเป็นสระ/วรรณยุกต์ที่อยู่ในช่วงนี้ ให้ไม่ถือเป็นพยัญชนะ
  if (THAI_COMBINING_MARKS.has(ch)) return false;
  // เแโใไ ถือเป็นสระนำ ไม่ใช่พยัญชนะ
  if (THAI_LEADING_VOWELS.has(ch)) return false;
  return true;
};

// ตัวอักษรอังกฤษ/ตัวเลข: ใช้เป็น initial ได้
const isAsciiLetterOrDigit = (ch: string) =>
  /[A-Za-z0-9]/.test(ch);

// คืนตัวอักษรย่อจากชื่อ: ข้ามสระนำ/วรรณยุกต์ จนเจอพยัญชนะไทย หรืออักษรอังกฤษ/ตัวเลข
const getInitialFromName = (name?: string) => {
  if (!name) return '';
  const s = name.normalize('NFC'); // กันเคสสระประกอบ
  for (const ch of s) {
    if (NON_LETTER.has(ch)) continue;
    if (THAI_COMBINING_MARKS.has(ch)) continue;
    if (THAI_LEADING_VOWELS.has(ch)) continue; // ข้ามสระนำ แล้วไปหาตัวถัดไป
    if (isThaiConsonant(ch)) return ch;        // พยัญชนะไทยตัวแรก
    if (isAsciiLetterOrDigit(ch)) return ch.toUpperCase(); // อังกฤษ/ตัวเลข
    // อื่นๆ ที่ไม่รู้จัก: ข้ามไป
  }
  return ''; // ไม่เจออะไรที่ใช้ได้
};

// รวมชื่อย่อจากชื่อ-นามสกุล (เช่น อ + ช)
const makeInitials = (firstName?: string, lastName?: string) => {
  const a = getInitialFromName(firstName);
  const b = getInitialFromName(lastName);
  const initials = `${a}${b}`.trim();
  return initials.length > 0 ? initials : '??';
};
/** ---------- End Helpers ---------- */

const HomeTechnicianPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<RedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<FilterType>('ทั้งหมด');

  const loadUsers = async () => {
    try {
      const data = await fetchRedAndCancelledBills();
      setUsers(Array.isArray(data) ? data : []);
      console.log('✅ ดึงข้อมูลลูกบ้าน Red & Cancel แล้ว:', data);
    } catch (error) {
      console.error('❌ ดึงข้อมูลล้มเหลว:', error);
      Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลลูกบ้านที่ถูกยกเลิกได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadUsers();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handlePressUser = (numberId: string) => {
    navigation.navigate('InfoRedUsers', { numberId });
  };

  const filteredUsers = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return users
      .filter(u => {
        const byFilter =
          filter === 'ทั้งหมด' ? true : (u.status || 'Red') === filter;
        if (!byFilter) return false;

        if (!kw) return true;
        const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
        return (
          full.includes(kw) ||
          (u.numberId ?? '').toString().toLowerCase().includes(kw)
        );
      })
      .sort((a, b) =>
        `${a.firstName}${a.lastName}`.localeCompare(
          `${b.firstName}${b.lastName}`,
          'th'
        )
      );
  }, [users, keyword, filter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  const countAll = users.length;
  const countRed = users.filter(u => (u.status || 'Red') === 'Red').length;
  const countCancel = users.filter(u => (u.status || 'Cancel') === 'Cancel').length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.brand}>
          Nam<Text style={styles.brandAccent}>Jai</Text>
        </Text>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.8} style={styles.refreshChip}>
          <Text style={styles.refreshText}>รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>รายชื่อลูกบ้านที่ถูกยกเลิก / ค้างชำระหนัก</Text>
        <Text style={styles.subtitle}>สำหรับช่างเทคนิค • อัปเดตงานภาคสนาม</Text>
      </View>

      {/* Summary chips */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#0D2A4A' }]}>
          <Text style={styles.summaryNum}>{countAll}</Text>
          <Text style={styles.summaryLabel}>ทั้งหมด</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#D32F2F' }]}>
          <Text style={styles.summaryNum}>{countRed}</Text>
          <Text style={styles.summaryLabel}>Red</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#7B1FA2' }]}>
          <Text style={styles.summaryNum}>{countCancel}</Text>
          <Text style={styles.summaryLabel}>Cancel</Text>
        </View>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="ค้นหาชื่อหรือหมายเลขผู้ใช้..."
            placeholderTextColor="#7FA3C1"
            value={keyword}
            onChangeText={setKeyword}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                filter === f && styles.filterChipActive,
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>ไม่พบรายการ</Text>
          <Text style={styles.emptyDesc}>
            ลองเปลี่ยนตัวกรองหรือพิมพ์คำค้นหาให้น้อยลง
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12, width: '100%' }}>
          {filteredUsers.map((user, idx) => {
            const initials = makeInitials(user.firstName, user.lastName);
            const status = user.status || 'Red';
            const statusColor = status === 'Red' ? '#D32F2F' : '#7B1FA2';
            return (
              <TouchableOpacity
                key={`${user.numberId}-${idx}`}
                style={styles.userCard}
                activeOpacity={0.9}
                onPress={() => handlePressUser(user.numberId)}
              >
                <View style={[styles.leftAccent, { backgroundColor: statusColor }]} />
                <View style={styles.cardContent}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nameText}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.subText}>หมายเลข: {user.numberId}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusColor }]}>
                    <Text style={styles.badgeText}>{status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

export default HomeTechnicianPage;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E9F4FF', // โทนเดียวกับหน้าก่อนๆ
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
  brand: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0D2A4A',
  },
  brandAccent: {
    color: '#FF4081',
  },
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
  refreshText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Title
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 8 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D2A4A',
  },
  subtitle: {
    fontSize: 12,
    color: '#4E6E90',
    marginTop: 4,
  },

  // Summary
  summaryRow: {
    width: '100%',
    marginTop: 6,
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
  searchInput: {
    fontSize: 14,
    color: '#0D2A4A',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
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

  // List
  userCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 3,

    // subtle border to look premium
    borderWidth: 1,
    borderColor: '#E1EEF7',
    position: 'relative',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE2F2',
  },
  avatarText: {
    fontWeight: '900',
    fontSize: 16,
    color: '#0D2A4A',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D2A4A',
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: '#4E6E90',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 11 },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9F4FF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4E6E90',
  },
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
