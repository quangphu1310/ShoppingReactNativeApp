import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DemoScreen } from "./src/screens/demo-screen";
import { CheckoutScreen } from "./src/screens/checkout-screen";
import { HomeScreen } from "./src/screens/home-screen";
import { OrderHistoryScreen } from "./src/screens/order-history-screen";
import { ProfileScreen } from "./src/screens/profile-screen";
import { SignInScreen } from "./src/screens/sign-in-screen";
import {
  getCurrentUser,
  selectAuthToken,
  selectCurrentUser,
  selectIsAuthenticated,
} from "./src/slices/auth-slice";
import store, { useAppDispatch, useAppSelector } from "./src/stores/store";
import { initializeDatabase } from "./src/services/storage/sqlite";

export type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  OrderHistory: undefined;
  Checkout: undefined;
  Demo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectAuthToken);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (!token || currentUser) {
      return;
    }

    dispatch(getCurrentUser(token));
  }, [currentUser, dispatch, token]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Home" }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Demo"
              component={DemoScreen}
              options={{ title: "Demo Screen" }}
            />
            <Stack.Screen
              name="OrderHistory"
              component={OrderHistoryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize SQLite database on app start
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database on app start:', error);
    });
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
