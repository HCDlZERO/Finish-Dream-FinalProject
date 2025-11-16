import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert,
  ScrollView, RefreshControl, TouchableOpacity
} from 'react-native';
import { fetchMemberInfoByNumberId } from '../services/apiService';

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
  return initials.length > 0 ? initials : '??';
};
/** ---------- End Helpers ---------- */

type MemberInfo = {
  firstName?: string;
  lastName?: string;
  houseNumber?: string;
  street?: string;
  district?: string;
  city?: string;
  status?: 'Red' | 'Cancel'; // ถ้ามีมากับ API จะขึ้นสีตามจริง
};

const InfoRedUsers = ({ route, navigation }: any) => {
  const { numberId } = route.params;
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const status = memberInfo?.status ?? 'Red';
  const statusColor = status === 'Red' ? '#D32F2F' : '#7B1FA2';

  const loadMemberInfo = async () => {
    try {
      const data = await fetchMemberInfoByNumberId(numberId);
      setMemberInfo(data || null);
      console.log('✅ ข้อมูลลูกบ้าน:', data);
    } catch (error) {
      console.error('❌ ดึงข้อมูลลูกบ้านล้มเหลว:', error);
      Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลลูกบ้านได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberInfo();
  }, [numberId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMemberInfo();
    } finally {
      setRefreshing(false);
    }
  }, [numberId]);

  const initials = useMemo(
    () => makeInitials(memberInfo?.firstName, memberInfo?.lastName),
    [memberInfo?.firstName, memberInfo?.lastName]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลลูกบ้าน...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
          style={styles.backChip}
        >
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>

        <Text style={styles.brand}>
          Nam<Text style={styles.brandAccent}>Jai</Text>
        </Text>

        <View style={{ width: 64 }} />{/* spacer ให้แบรนด์กึ่งกลาง */}
      </View>

      {/* Title & numberId */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ข้อมูลลูกบ้าน (รายละเอียด)</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaKey}>หมายเลข</Text>
            <Text style={styles.metaValue}>{numberId}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </View>

      {/* Profile Card */}
      {memberInfo ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>
                {memberInfo.firstName} {memberInfo.lastName}
              </Text>
              <Text style={styles.subNote}>ลูกบ้านในระบบ NamJai</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ที่อยู่</Text>

            <View style={styles.row}>
              <Text style={styles.label}>เลขที่บ้าน</Text>
              <Text style={styles.value}>{memberInfo.houseNumber || '-'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>ถนน</Text>
              <Text style={styles.value}>{memberInfo.street || '-'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>เขต/อำเภอ</Text>
              <Text style={styles.value}>{memberInfo.district || '-'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>จังหวัด</Text>
              <Text style={styles.value}>{memberInfo.city || '-'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🧐</Text>
          <Text style={styles.emptyTitle}>ไม่พบข้อมูลลูกบ้าน</Text>
          <Text style={styles.emptyDesc}>ตรวจสอบหมายเลขอีกครั้ง หรือดึงข้อมูลใหม่</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshChipWide} activeOpacity={0.85}>
            <Text style={styles.refreshText}>ดึงข้อมูลอีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default InfoRedUsers;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E9F4FF',
    flexGrow: 1,
    alignItems: 'center',
  },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  backChip: {
    backgroundColor: '#E1EEF7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    minWidth: 64,
    alignItems: 'center',
  },
  backText: {
    color: '#0D2A4A',
    fontWeight: '700',
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

  // Title & meta
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D2A4A',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  metaChip: {
    backgroundColor: '#F4FAFF',
    borderWidth: 1,
    borderColor: '#C7DFEF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
  },
  metaKey: {
    color: '#4E6E90',
    fontWeight: '700',
    fontSize: 12,
  },
  metaValue: {
    color: '#0D2A4A',
    fontWeight: '900',
    fontSize: 14,
  },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0D2A4A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1EEF7',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE2F2',
  },
  avatarText: {
    fontWeight: '900',
    fontSize: 20,
    color: '#0D2A4A',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0D2A4A',
  },
  subNote: {
    fontSize: 12,
    color: '#4E6E90',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6F1FA',
    marginVertical: 12,
  },

  // Section
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D2A4A',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: '#4E6E90',
    fontWeight: '700',
    fontSize: 12,
    minWidth: 100,
  },
  value: {
    color: '#0D2A4A',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },

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
  emptyDesc: { fontSize: 12, color: '#4E6E90', marginTop: 4, textAlign: 'center', marginBottom: 10 },

  // Loading
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

  // Extra
  refreshChipWide: {
    marginTop: 12,
    backgroundColor: '#0288D1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  refreshText: { color: '#fff', fontWeight: '800' },
});
