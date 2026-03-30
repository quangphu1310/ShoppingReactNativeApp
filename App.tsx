import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DemoScreen } from "./src/screens/demo-screen";
import { CheckoutScreen } from "./src/screens/checkout-screen";
import { HomeScreen } from "./src/screens/home-screen";
import { OrderHistoryScreen } from "./src/screens/order-history-screen";
import { ProfileScreen } from "./src/screens/profile-screen";
import { SignInScreen } from "./src/screens/sign-in-screen";
import { ProductDetailScreen } from "./src/screens/product-detail-screen";
import {
  bootstrapAuthSession,
  selectIsBootstrappingAuth,
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
  ProductDetails: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBootstrappingAuth = useAppSelector(selectIsBootstrappingAuth);

  useEffect(() => {
    dispatch(bootstrapAuthSession());
  }, [dispatch]);

  if (isBootstrappingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00CFC8" />
      </View>
    );
  }

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
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailScreen}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
