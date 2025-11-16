import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchOfficerContact } from '../services/apiService';

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

const Row = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '-'}</Text>
  </View>
);

const ContactOfficerPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { officerId } = route.params as { officerId: number };

  const [officerData, setOfficerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOfficerContact(officerId);
      setOfficerData(data || null);
    } catch (error) {
      console.error('Failed to fetch officer contact', error);
    } finally {
      setLoading(false);
    }
  }, [officerId]);

  useEffect(() => {
    if (officerId != null) load();
  }, [officerId, load]);

  const initials = useMemo(
    () => makeInitials(officerData?.first_name, officerData?.last_name),
    [officerData?.first_name, officerData?.last_name]
  );

  const handleCallPress = () => {
    const phone = officerData?.phone_number;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleOpenLine = async () => {
    const lineId = officerData?.line_id;
    if (!lineId) return;
    // พยายามเปิดในแอป LINE ก่อน ถ้าไม่ได้ค่อยลองผ่านเว็บ
    const urlApp = `line://ti/p/~${lineId}`;
    const urlWeb = `https://line.me/ti/p/~${lineId}`;
    const canOpen = await Linking.canOpenURL(urlApp);
    Linking.openURL(canOpen ? urlApp : urlWeb);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={{ marginTop: 10, color: '#4E6E90' }}>กำลังโหลดข้อมูลเจ้าหน้าที่...</Text>
      </View>
    );
  }

  if (!officerData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#0D2A4A', fontWeight: '700' }}>ไม่พบข้อมูลเจ้าหน้าที่</Text>
        <TouchableOpacity onPress={load} style={[styles.refreshChip, { marginTop: 12 }]} activeOpacity={0.85}>
          <Text style={styles.refreshText}>ลองใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName = `${officerData.first_name ?? ''} ${officerData.last_name ?? ''}`.trim();

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backChip}>
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>Nam<Text style={styles.brandAccent}>Jai</Text></Text>
        <TouchableOpacity onPress={load} activeOpacity={0.85} style={styles.refreshChip}>
          <Text style={styles.refreshText}>รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      {/* Title + meta */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ติดต่อเจ้าหน้าที่</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaKey}>Officer ID</Text>
            <Text style={styles.metaValue}>{String(officerId)}</Text>
          </View>
          {!!officerData?.line_id && (
            <View style={[styles.metaChip, { backgroundColor: '#0D2A4A', borderColor: '#0D2A4A' }]}>
              <Text style={[styles.metaValue, { color: '#fff' }]}>LINE: {officerData.line_id}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nameText}>{fullName || '-'}</Text>
            <Text style={styles.subNote}>เจ้าหน้าที่ประจำพื้นที่</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>ข้อมูลติดต่อ</Text>
        <View style={styles.section}>
          <Row label="ชื่อ" value={fullName} />
          <Row label="LINE ID" value={officerData.line_id} />
          <Row label="เบอร์โทรศัพท์" value={officerData.phone_number} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleCallPress} activeOpacity={0.9} disabled={!officerData?.phone_number}>
          <Text style={styles.primaryText}>โทรออก</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, !officerData?.line_id && { opacity: 0.6 }]}
          onPress={handleOpenLine}
          activeOpacity={0.9}
          disabled={!officerData?.line_id}
        >
          <Text style={styles.secondaryText}>เปิด LINE</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />
    </ScrollView>
  );
};

export default ContactOfficerPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E9F4FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  brand: { fontSize: 28, fontWeight: '900', letterSpacing: 1, color: '#0D2A4A' },
  brandAccent: { color: '#FF4081' },
  backChip: {
    backgroundColor: '#E1EEF7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    minWidth: 64,
    alignItems: 'center',
  },
  backText: { color: '#0D2A4A', fontWeight: '700' },
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

  // Title & meta
  titleWrap: { width: '100%', marginTop: 6, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0D2A4A' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' },
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
  metaKey: { color: '#4E6E90', fontWeight: '700', fontSize: 12 },
  metaValue: { color: '#0D2A4A', fontWeight: '900', fontSize: 14 },

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
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 6 },
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
  avatarText: { fontWeight: '900', fontSize: 20, color: '#0D2A4A' },
  nameText: { fontSize: 18, fontWeight: '900', color: '#0D2A4A' },
  subNote: { fontSize: 12, color: '#4E6E90', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#E6F1FA', marginVertical: 12 },

  // Section
  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0D2A4A', marginBottom: 4 },

  // Rows
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  rowLabel: { color: '#4E6E90', fontWeight: '700', fontSize: 12, minWidth: 110 },
  rowValue: { color: '#0D2A4A', fontWeight: '700', fontSize: 14, flex: 1, textAlign: 'right' },

  // Actions
  actionsRow: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#0288D1',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#0288D1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.3 },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9BC6E3',
    backgroundColor: '#F4FAFF',
  },
  secondaryText: { color: '#0D2A4A', fontWeight: '800', fontSize: 14 },
});
