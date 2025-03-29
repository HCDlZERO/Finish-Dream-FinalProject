import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// Import หน้าต่างๆ
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterMember from './screens/RegisterMember';
import RegisterOfficer from './screens/RegisterOfficer';
import HomeTechnicianPage from './screens/HomeTechnicianPage';
import HomeOfficerPage from './screens/HomeOfficerPage';
import HomeMemberPage from './screens/HomeMemberPage';
import HomeHeadOfficerPage from './screens/HomeHeadOfficerPage';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterMember" component={RegisterMember} />
          <Stack.Screen name="RegisterOfficer" component={RegisterOfficer} />
          <Stack.Screen name="HomeTechnicianPage" component={HomeTechnicianPage} />
          <Stack.Screen name="HomeOfficerPage" component={HomeOfficerPage} />
          <Stack.Screen name="HomeMemberPage" component={HomeMemberPage} />
          <Stack.Screen name="HomeHeadOfficerPage" component={HomeHeadOfficerPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default App;