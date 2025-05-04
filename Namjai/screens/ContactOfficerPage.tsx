import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchOfficerContact } from '../services/apiService';

const ContactOfficerPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { officerId } = route.params as { officerId: number };

  const [officerData, setOfficerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadOfficerContact = async () => {
      try {
        const data = await fetchOfficerContact(officerId);
        setOfficerData(data);
      } catch (error) {
        console.error('Failed to fetch officer contact', error);
      } finally {
        setLoading(false);
      }
    };
    if (officerId) {
      loadOfficerContact();
    }
  }, [officerId]);

  const handleCallPress = () => {
    if (officerData?.phone_number) {
      Linking.openURL(`tel:${officerData.phone_number}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuEmoji}>☰</Text>
      </View>

      {/* Profile Emoji */}
      <View style={styles.profileContainer}>
        <Text style={styles.profileEmoji}>👤</Text>
      </View>

      {/* Contact Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>NAME</Text>
        <TextInput
          style={styles.input}
          value={`${officerData.first_name} ${officerData.last_name}`}
          editable={false}
        />

        <Text style={styles.label}>ID LINE</Text>
        <TextInput
          style={styles.input}
          value={officerData.line_id || '*****'}
          editable={false}
        />

        <Text style={styles.label}>PHONE</Text>
        <TextInput
          style={styles.input}
          value={officerData.phone_number || '*****'}
          editable={false}
        />

        <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
          <Text style={styles.callButtonText}>☎️ โทรออก</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Wave */}
      <View style={styles.bottomWave} />
    </ScrollView>
  );
};

export default ContactOfficerPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E1F5FE',
    alignItems: 'center',
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#0288D1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoHighlight: {
    color: '#FF4081',
  },
  menuEmoji: {
    fontSize: 24,
    color: 'white',
  },
  profileContainer: {
    marginTop: 30,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 80,
  },
  infoContainer: {
    width: '80%',
  },
  label: {
    fontSize: 14,
    color: '#0288D1',
    marginBottom: 5,
    marginTop: 15,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#0288D1',
    borderRadius: 15,
    padding: 10,
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  callButton: {
    backgroundColor: '#0288D1',
    borderRadius: 15,
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    height: 100,
    width: '100%',
    backgroundColor: '#0288D1',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
