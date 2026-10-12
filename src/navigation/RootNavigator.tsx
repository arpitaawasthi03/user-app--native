import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type {
  RootStackParamList,
  BottomTabParamList,
  TabName,
} from "./types";
import { useApp } from "../state/AppState";

// Auth Screens
import Splash from "../screens/auth/Splash";
import PhoneLogin from "../screens/auth/PhoneLogin";
import OtpVerify from "../screens/auth/OtpVerify";

// Home Screens
import FoodHome from "../screens/home/FoodHome";
import RidesHome from "../screens/home/RidesHome";
import GroceryHome from "../screens/home/GroceryHome";
import CourierHome from "../screens/home/CourierHome";

// Flow Screens
import StoreDetail from "../screens/flow/StoreDetail";
import RideConfirm from "../screens/flow/RideConfirm";
import Cart from "../screens/flow/Cart";
import DeliveryDetails from "../screens/flow/DeliveryDetails";
import Payment from "../screens/flow/Payment";
import OrderStatus from "../screens/flow/OrderStatus";
import OrderComplete from "../screens/flow/OrderComplete";

// Tab Screens
import NavCart from "../screens/tabs/NavCart";
import Wallet from "../screens/tabs/Wallet";
import Orders from "../screens/tabs/Orders";
import Account from "../screens/tabs/Account";

// Auxiliary & More Screens
import AddAddress from "../screens/more/AddAddress";
import Help from "../screens/more/Help";
import PaymentMethods from "../screens/more/PaymentMethods";
import AddMoney from "../screens/more/AddMoney";
import Places from "../screens/more/Places";
import Notifications from "../screens/more/Notifications";
import AddPaymentMethod from "../screens/more/AddPaymentMethod";
import ChatSupport from "../screens/more/ChatSupport";
import RestaurantsList from "../screens/more/RestaurantsList";
import OrderDetail from "../screens/more/OrderDetail";
import Profile from "../screens/more/Profile";
import Transactions from "../screens/more/Transactions";
import Favorites from "../screens/more/Favorites";

// Shared Components
import BottomNav from "../components/BottomNav";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Service vertical dispatcher for the Home tab, matching original App.tsx behavior.
 */
function HomeServiceDispatcher() {
  const { state } = useApp();

  switch (state.service) {
    case "food":
      return <FoodHome />;
    case "rides":
      return <RidesHome />;
    case "grocery":
      return <GroceryHome />;
    case "courier":
      return <CourierHome />;
    default:
      return <FoodHome />;
  }
}

/**
 * Main Tabs Navigator wrapping the 5 tabs with custom BottomNav
 */
function MainTabsNavigator() {
  const { state } = useApp();
  const cartCount =
    state.carts.food.lines.reduce((sum, l) => sum + l.qty, 0) +
    state.carts.grocery.lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <Tab.Navigator
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index].name as TabName;
        return (
          <BottomNav
            active={activeRoute}
            count={cartCount}
            onSelect={(tab) => props.navigation.navigate(tab)}
          />
        );
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="home" component={HomeServiceDispatcher} />
      <Tab.Screen name="navcart" component={NavCart} />
      <Tab.Screen name="wallet" component={Wallet} />
      <Tab.Screen name="orders" component={Orders} />
      <Tab.Screen name="account" component={Account} />
    </Tab.Navigator>
  );
}

/**
 * Root Native Stack Navigator
 */
export default function RootNavigator() {
  const { state } = useApp();
  // Allow unauthenticated guests to freely browse mainTabs
  const initialRoute = "mainTabs";

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {/* Authentication Flow */}
        <Stack.Screen name="splash" component={Splash} />
        <Stack.Screen name="phone" component={PhoneLogin} />
        <Stack.Screen name="otp">
          {({ route }: any) => (
            <OtpVerify phone={route.params?.phone || "9876543210"} />
          )}
        </Stack.Screen>

        {/* Core Main Tab Navigation */}
        <Stack.Screen name="mainTabs" component={MainTabsNavigator} />

        {/* Flow Routes */}
        <Stack.Screen name="detail">
          {({ route }: any) => (
            <StoreDetail
              service={route.params?.service || "food"}
              storeId={route.params?.storeId}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="rideConfirm" component={RideConfirm} />
        <Stack.Screen name="cart">
          {({ route }: any) => (
            <Cart service={route.params?.service || "food"} />
          )}
        </Stack.Screen>
        <Stack.Screen name="address">
          {({ route }: any) => (
            <DeliveryDetails service={route.params?.service || "food"} />
          )}
        </Stack.Screen>
        <Stack.Screen name="payment">
          {({ route }: any) => (
            <Payment service={route.params?.service || "food"} />
          )}
        </Stack.Screen>
        <Stack.Screen name="status">
          {({ route }: any) => (
            <OrderStatus
              orderId={route.params?.orderId || ""}
              initialView={route.params?.view}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="complete">
          {({ route }: any) => (
            <OrderComplete orderId={route.params?.orderId || ""} />
          )}
        </Stack.Screen>

        {/* Interconnected Flow & Auxiliary Routes */}
        <Stack.Screen name="addAddress">
          {({ route }: any) => (
            <AddAddress mode={route.params?.mode || "delivery"} />
          )}
        </Stack.Screen>
        <Stack.Screen name="paymentMethods" component={PaymentMethods} />
        <Stack.Screen name="addMoney" component={AddMoney} />
        <Stack.Screen name="help">
          {({ route }: any) => (
            <Help orderId={route.params?.orderId} />
          )}
        </Stack.Screen>

        {/* Secondary Remaining Routes */}
        <Stack.Screen name="notifications" component={Notifications} />
        <Stack.Screen name="places">
          {({ route }: any) => (
            <Places mode={route.params?.mode || "manage"} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="addPaymentMethod"
          component={AddPaymentMethod}
        />
        <Stack.Screen name="chatSupport">
          {({ route }: any) => (
            <ChatSupport orderId={route.params?.orderId} />
          )}
        </Stack.Screen>
        <Stack.Screen name="restaurantsList">
          {({ route }: any) => (
            <RestaurantsList cuisine={route.params?.cuisine} />
          )}
        </Stack.Screen>
        <Stack.Screen name="orderDetail">
          {({ route }: any) => (
            <OrderDetail orderId={route.params?.orderId || ""} />
          )}
        </Stack.Screen>
        <Stack.Screen name="profile" component={Profile} />
        <Stack.Screen name="favorites">
          {({ route }: any) => (
            <Favorites service={route.params?.service} />
          )}
        </Stack.Screen>
        <Stack.Screen name="transactions" component={Transactions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
