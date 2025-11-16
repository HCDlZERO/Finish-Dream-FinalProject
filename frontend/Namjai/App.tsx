import React from 'react';
import { StatusBar, useColorScheme, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// 👉 เพิ่ม import SplashScreen
import SplashScreen from './screens/SplashScreen';

// Import หน้าต่างๆ
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterMember from './screens/RegisterMember';
import RegisterOfficer from './screens/RegisterOfficer';
import HomeTechnicianPage from './screens/HomeTechnicianPage';
import HomeOfficerPage from './screens/HomeOfficerPage';
import HomeMemberPage from './screens/HomeMemberPage';
import HomeHeadOfficerPage from './screens/HomeHeadOfficerPage';
import UserBillsInfo from './screens/UserBillsInfo';
import CreateBills from './screens/CreateBills';
import InfoPayment from './screens/InfoPayment';
import AddMemberPage from './screens/AddMemberPage';
import InfoRedUsers from './screens/InfoRedUsers';
import AddOfficer from './screens/AddOfficer';
import DeleteOfficer from './screens/DeleteOfficer';
import ApproveRequest from './screens/ApproveRequest';
import SettingOfficerInfo from './screens/SettingOfficerInfo';
import PaymentPage from './screens/PaymentPage';
import QRCodePage from './screens/QRCodePage';
import BankTransferPage from './screens/BankTransferPage';
import CashPaymentPage from './screens/CashPaymentPage';
import ConfirmPaymentPage from './screens/ConfirmPaymentPage';
import HistoryPage from './screens/HistoryPage';
import ContactOfficerPage from './screens/ContactOfficerPage';
import UserProfilePage from './screens/UserProfilePage';
import DeleteMemberPage from './screens/DeleteMemberPage';
import ResetPasswordPage from './screens/ResetPasswordPage';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? Colors.darker : Colors.lighter}
      />
      <Stack.Navigator
        // 👉 ให้เริ่มที่ SplashScreen
        initialRouteName="SplashScreen"
        screenOptions={{
          headerStyle: { backgroundColor: isDarkMode ? '#333' : '#fff' },
          headerTintColor: isDarkMode ? '#fff' : '#000',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* 👉 สปลาช (ซ่อน header) */}
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        {/* หน้า Home & อื่นๆ ตามเดิม */}
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="RegisterMember" component={RegisterMember} options={{ title: 'Register Member', headerShown: false }} />
        <Stack.Screen name="RegisterOfficer" component={RegisterOfficer} options={{ title: 'Register Officer', headerShown: false }} />
        <Stack.Screen name="HomeTechnicianPage" component={HomeTechnicianPage} options={{ title: 'Technician Home', headerShown: false }} />
        <Stack.Screen name="HomeOfficerPage" component={HomeOfficerPage} options={{ title: 'Officer Home', headerShown: false }} />
        <Stack.Screen name="HomeMemberPage" component={HomeMemberPage} options={{ title: 'Member Home', headerShown: false }} />
        <Stack.Screen name="HomeHeadOfficerPage" component={HomeHeadOfficerPage} options={{ title: 'Head Officer Home', headerShown: false }} />
        <Stack.Screen name="UserBillsInfo" component={UserBillsInfo} options={{ title: 'User Bills Info', headerShown: false }} />
        <Stack.Screen name="CreateBills" component={CreateBills} options={{ title: 'Create Bills', headerShown: false }} />
        <Stack.Screen name="InfoPayment" component={InfoPayment} options={{ title: 'Payment Info', headerShown: false }} />
        <Stack.Screen name="AddMemberPage" component={AddMemberPage} options={{ title: 'Add Member', headerShown: false }} />
        <Stack.Screen name="InfoRedUsers" component={InfoRedUsers} options={{ title: 'Red User Info', headerShown: false }} />
        <Stack.Screen name="AddOfficer" component={AddOfficer} options={{ title: 'Add Officer', headerShown: false }} />
        <Stack.Screen name="DeleteOfficer" component={DeleteOfficer} options={{ title: 'Delete Officer', headerShown: false }} />
        <Stack.Screen name="ApproveRequest" component={ApproveRequest} options={{ title: 'Approve Requests', headerShown: false }} />
        <Stack.Screen name="SettingOfficerInfo" component={SettingOfficerInfo} options={{ title: 'Setting Officer Info', headerShown: false }} />
        <Stack.Screen name="PaymentPage" component={PaymentPage} options={{ title: 'Payment', headerShown: false }} />
        <Stack.Screen name="QRCodePage" component={QRCodePage} options={{ title: 'QR Code', headerShown: false }} />
        <Stack.Screen name="BankTransferPage" component={BankTransferPage} options={{ title: 'Bank Transfer', headerShown: false }} />
        <Stack.Screen name="CashPaymentPage" component={CashPaymentPage} options={{ title: 'Cash Payment', headerShown: false }} />
        <Stack.Screen name="ConfirmPaymentPage" component={ConfirmPaymentPage} options={{ title: 'Confirm Payment', headerShown: false }} />
        <Stack.Screen name="HistoryPage" component={HistoryPage} options={{ title: 'History', headerShown: false }} />
        <Stack.Screen name="ContactOfficerPage" component={ContactOfficerPage} options={{ title: 'Contact Officer', headerShown: false }} />
        <Stack.Screen name="UserProfilePage" component={UserProfilePage} options={{ title: 'User Profile', headerShown: false }} />
        <Stack.Screen name="DeleteMemberPage" component={DeleteMemberPage} options={{ title: 'Delete Member', headerShown: false }} />
        <Stack.Screen name="ResetPasswordPage" component={ResetPasswordPage} options={{ title: 'Reset Password', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });

export default App;
