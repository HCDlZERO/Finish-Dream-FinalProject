import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ErrorPopupProps = {
  visible: boolean;
  message?: string;
  onClose: () => void;
  title?: string;
};

export default function ErrorPopup({
  visible,
  message,
  onClose,
  title = 'เกิดข้อผิดพลาด',
}: ErrorPopupProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.msg}>{message}</Text>}
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>เข้าใจแล้ว</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '82%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  msg: { fontSize: 15, color: '#333', marginBottom: 16 },
  btn: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#222', borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});
