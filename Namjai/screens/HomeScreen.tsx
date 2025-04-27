import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

const HomeScreen = ({ navigation }: any) => {
  console.log('HomeScreen loaded');
  return (
    <View style={styles.container}>
      <Text>Welcome to HomeScreen!</Text>
      <Button title="Register for Member" onPress={() => navigation.navigate('RegisterMember')} />
      <Button title="Register for Officer" onPress={() => navigation.navigate('RegisterOfficer')} />
      <Button title="Login" onPress={() => navigation.navigate('LoginScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
});

export default HomeScreen;
