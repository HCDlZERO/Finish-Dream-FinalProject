import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import ErrorPopup from '../services/ErrorPopup';
import { createBill } from '../services/apiService';

type User = {
  numberId: string;
  firstName: string;
  lastName: string;
  zone?: number | string;
};

type Props = {
  route: { params?: { officerId: number | string; users?: User[] } };
  navigation: any;
};

/* ==================== Thai Initials Utils ==================== */
// รายชื่อพยัญชนะไทย (ตัวที่ทำหน้าที่เป็น consonant)
const TH_CONSONANTS =
  'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤฦลวศษสหฬอฮ';

const isThaiConsonant = (ch: string) => TH_CONSONANTS.includes(ch);
const isLatinLetter = (ch: string) => /[A-Za-z]/.test(ch);

/** คืนอักษรย่อ “ตัวแรกที่มีความหมาย” ของคำ (ชื่อ/นามสกุล)
 *  - เดินหน้าไปเรื่อย ๆ จนเจอ "พยัญชนะไทย" → return
 *  - ถ้าไม่เจอ → ใช้อักษรอังกฤษตัวแรก (upper)
 *  - ถ้าไม่เจออีก → เอาตัวแรกที่เป็น [A-Za-z0-9ก-๙] → fallback 'U'
 */
const firstMeaningfulInitial = (raw: string): string => {
  const name = (raw || '').trim();
  for (const ch of name) if (isThaiConsonant(ch)) return ch;
  for (const ch of name) if (isLatinLetter(ch)) return ch.toUpperCase();
  const m = name.match(/[A-Za-z0-9ก-๙]/);
  return m ? (/[A-Za-z]/.test(m[0]) ? m[0].toUpperCase() : m[0]) : 'U';
};

const moneyFormat = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 2 });

/* ==================== Page ==================== */
const CreateBills: React.FC<Props> = ({ route, navigation }) => {
  const { officerId, users = [] } = route.params || {};
  const [zone, setZone] = useState('');
  const [unitsMap, setUnitsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ visible: boolean; title?: string; message?: string }>({
    visible: false,
  });
  const [confirm, setConfirm] = useState<{ visible: boolean }>({ visible: false });

  const setZoneSafe = (v: string) => setZone(v.replace(/\D+/g, '').slice(0, 3));
  const stepZone = (delta: number) => {
    const cur = parseInt(zone || '0', 10) || 0;
    const next = Math.max(1, Math.min(999, cur + delta));
    setZone(String(next));
  };

  const handleUnitChange = (numberId: string, value: string) => {
    // อนุญาตเฉพาะตัวเลขและจุดทศนิยม 1 จุด
    let v = value.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    setUnitsMap((prev) => ({ ...prev, [numberId]: v }));
  };

  // คำนวณสรุป
  const stats = useMemo(() => {
    let count = 0;
    let unitsTotal = 0;
    let amountTotal = 0;
    for (const u of users) {
      const v = parseFloat(unitsMap[u.numberId] || '');
      if (!isNaN(v) && v > 0) {
        count++;
        unitsTotal += v;
        amountTotal += v * 14 + 20;
      }
    }
    return { count, unitsTotal, amountTotal };
  }, [unitsMap, users]);

  const validate = () => {
    if (!/^\d+$/.test(zone) || parseInt(zone, 10) <= 0) return 'กรุณาใส่โซนเป็นจำนวนเต็มบวก';
    if (!Array.isArray(users) || users.length === 0) return 'ไม่พบรายชื่อลูกบ้าน';
    if (stats.count === 0) return 'กรุณากรอก “หน่วยค่าน้ำ” อย่างน้อย 1 รายการ (> 0)';
    return '';
  };

  const handleSubmitAll = async () => {
    const msg = validate();
    if (msg) return setPopup({ visible: true, title: 'ข้อมูลไม่ถูกต้อง', message: msg });

    setConfirm({ visible: true });
  };

  const reallyCreate = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      setLoading(true);
      const z = parseInt(zone, 10);
      const oid = parseInt(String(officerId), 10);

      for (const user of users) {
        const v = parseFloat(unitsMap[user.numberId] || '');
        if (isNaN(v) || v <= 0) continue;
        const payload = {
          numberId: user.numberId,
          collectionOfficerId: oid,
          billDate: today,
          unitsUsed: v,
          amountDue: v * 14 + 20,
          paymentStatus: 'Gray' as const,
          zone: z,
        };
        await createBill(payload);
      }

      setPopup({ visible: true, title: 'สำเร็จ', message: 'สร้างบิลให้ลูกบ้านที่เลือกเรียบร้อยแล้ว' });
      navigation.goBack();
    } catch (e: any) {
      setPopup({
        visible: true,
        title: 'เกิดข้อผิดพลาด',
        message: e?.message?.toString?.() || 'ไม่สามารถสร้างบิลได้',
      });
    } finally {
      setLoading(false);
      setConfirm({ visible: false });
    }
  };

  // แสดงรายการผู้ใช้
  const renderItem = useCallback(
    ({ item }: { item: User }) => {
      const initials = `${firstMeaningfulInitial(item.firstName)}${firstMeaningfulInitial(
        item.lastName
      )}`;

      return (
        <View style={styles.memberCard}>
          <View style={styles.rowLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.memberName} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.memberMeta} numberOfLines={1}>
                #{item.numberId} • โซน {zone || item.zone || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.unitBox}>
            <Text style={styles.unitLabel}>หน่วย</Text>
            <TextInput
              style={styles.unitInput}
              placeholder="0"
              placeholderTextColor="#9FB3C8"
              keyboardType="numeric"
              value={unitsMap[item.numberId] || ''}
              onChangeText={(v) => handleUnitChange(item.numberId, v)}
              maxLength={8}
            />
          </View>
        </View>
      );
    },
    [unitsMap, zone]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#E9F4FF' }}
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
            <Text style={styles.badgeText}>สร้างบิล</Text>
          </View>
        </View>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#0288D1' }]}>
          <Text style={styles.summaryNum}>{users.length}</Text>
          <Text style={styles.summaryLabel}>ลูกบ้านทั้งหมด</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#26A69A' }]}>
          <Text style={styles.summaryNum}>{stats.count}</Text>
          <Text style={styles.summaryLabel}>เลือกกรอกแล้ว</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#7E57C2' }]}>
          <Text style={styles.summaryNum}>{moneyFormat(stats.amountTotal)}</Text>
          <Text style={styles.summaryLabel}>ยอดรวมโดยประมาณ (฿)</Text>
        </View>
      </View>

      {/* Zone Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>กำหนดโซน</Text>
        <Text style={styles.label}>โซน (zone)</Text>
        <View style={styles.zoneRow}>
          <TouchableOpacity style={styles.zoneBtn} onPress={() => stepZone(-1)}>
            <Text style={styles.zoneBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={[
              styles.zoneInput,
              (!zone || !/^\d+$/.test(zone) || parseInt(zone, 10) <= 0) && zone !== '' ? styles.inputError : null,
            ]}
            value={zone}
            onChangeText={setZoneSafe}
            placeholder="เช่น 1"
            placeholderTextColor="#9FB3C8"
            keyboardType="numeric"
            maxLength={3}
            textAlign="center"
          />
          <TouchableOpacity style={styles.zoneBtn} onPress={() => stepZone(1)}>
            <Text style={styles.zoneBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>* จะส่งค่าโซนนี้ไปในทุกบิลที่สร้าง</Text>
      </View>

      {/* Members List */}
      <FlatList
        data={users}
        keyExtractor={(item, idx) => `${item.numberId}-${idx}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>ไม่พบลูกบ้าน</Text>
            <Text style={styles.emptyText}>กลับไปหน้าก่อนเพื่อโหลดรายชื่ออีกครั้ง</Text>
          </View>
        }
      />

      {/* Sticky Submit Bar */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyLeft}>
          <Text style={styles.stickyTitle}>จะสร้าง {stats.count} รายการ</Text>
          <Text style={styles.stickySub}>
            หน่วยรวม ~ {stats.unitsTotal.toFixed(2)} • ยอดรวม ~ ฿{moneyFormat(stats.amountTotal)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmitAll}
          disabled={loading}
          style={[styles.submitBtn, (loading || !zone) && { opacity: 0.7 }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>💧 สร้างบิลทั้งหมด</Text>}
        </TouchableOpacity>
      </View>

      {/* Confirm Modal */}
      <Modal transparent animationType="fade" visible={confirm.visible} onRequestClose={() => setConfirm({ visible: false })}>
        <View style={styles.toastBackdrop}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>ยืนยันสร้างบิล</Text>
            <Text style={styles.toastMsg}>
              จะสร้างบิล {stats.count} รายการ • โซน {zone || '-'} • ยอดรวมประมาณ ฿{moneyFormat(stats.amountTotal)}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity onPress={() => setConfirm({ visible: false })} style={[styles.toastBtn, { backgroundColor: '#9e9e9e' }]}>
                <Text style={styles.toastBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={reallyCreate} style={[styles.toastBtn, { backgroundColor: '#1976D2' }]}>
                <Text style={styles.toastBtnText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Popup */}
      <ErrorPopup
        visible={popup.visible}
        title={popup.title || 'แจ้งเตือน'}
        message={popup.message}
        onClose={() => setPopup({ visible: false })}
      />
    </KeyboardAvoidingView>
  );
};

export default CreateBills;

/* ==================== Styles ==================== */
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: '#0288D1', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  badgeText: { color: '#EAF6FF', fontWeight: '800', fontSize: 12 },

  // Summary chips
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#E9F4FF',
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  summaryNum: { fontSize: 20, fontWeight: '900', color: '#fff' },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: '#EAF6FF', marginTop: 2 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0D2A4A', marginBottom: 8 },

  // Labels / Inputs
  label: { fontSize: 13, fontWeight: '700', color: '#35506B', marginBottom: 6 },
  hint: { color: '#6C89A3', marginTop: 8 },
  inputError: { borderColor: '#E53935', backgroundColor: '#FFF6F6' },

  // Zone stepper
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  zoneBtn: {
    backgroundColor: '#0288D1',
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 2,
  },
  zoneBtnText: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: -2 },
  zoneInput: {
    flex: 1,
    backgroundColor: '#F7FBFF',
    borderWidth: 1.5,
    borderColor: '#C9DBEA',
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 18,
    color: '#0D2A4A',
  },

  // Member item
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    minWidth: 44, height: 44, borderRadius: 12,
    backgroundColor: '#0288D1',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  memberName: { color: '#0D2A4A', fontWeight: '900', fontSize: 16, maxWidth: 210 },
  memberMeta: { color: '#6C89A3', fontWeight: '600', marginTop: 2 },

  unitBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitLabel: { color: '#35506B', fontWeight: '700' },
  unitInput: {
    width: 90,
    backgroundColor: '#F7FBFF',
    borderWidth: 1.5,
    borderColor: '#C9DBEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    fontSize: 16,
    color: '#0D2A4A',
    textAlign: 'right',
  },

  // Empty
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0D2A4A', marginBottom: 6 },
  emptyText: { color: '#6C89A3', textAlign: 'center', marginBottom: 12 },

  // Sticky bar
  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: -4 }, shadowRadius: 10, elevation: 16,
  },
  stickyLeft: { flexShrink: 1, paddingRight: 10 },
  stickyTitle: { color: '#0D2A4A', fontWeight: '900', fontSize: 16 },
  stickySub: { color: '#6C89A3', fontWeight: '600', marginTop: 2 },
  submitBtn: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    minWidth: 160,
  },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },

  // Toast / Modal
  toastBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  toastCard: { width: '86%', backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  toastTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#0D2A4A' },
  toastMsg: { fontSize: 15, color: '#2E4B66', marginBottom: 14 },
  toastBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#1976D2' },
  toastBtnText: { color: '#fff', fontWeight: '800' },
});
