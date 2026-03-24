import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    ChevronLeftIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    UserIcon,
} from "react-native-heroicons/outline";
import { RootStackParamList } from "../../App";
import { BottomTab, BottomTabItem } from "../components/BottomTab";
import { Header } from "../components/Header";

type OrderHistoryScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "OrderHistory"
>;

const renderHomeTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <HomeIcon color={color} size={24} strokeWidth={2} />
);

const renderExploreTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <MagnifyingGlassIcon color={color} size={24} strokeWidth={2} />
);

const renderOrdersTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <ClipboardDocumentListIcon color={color} size={24} strokeWidth={2} />
);

const renderProfileTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <UserIcon color={color} size={24} strokeWidth={2} />
);

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({
    navigation,
}) => {
    const handleSearchPress = useCallback(() => {
        navigation.navigate("Demo");
    }, [navigation]);

    const tabs: BottomTabItem[] = [
        {
            key: "home",
            label: "Home",
            icon: renderHomeTabIcon,
            onPress: () => navigation.navigate("Home"),
        },
        {
            key: "explore",
            label: "Explore",
            icon: renderExploreTabIcon,
            onPress: () => navigation.navigate("Demo"),
        },
        {
            key: "orders",
            label: "Orders",
            icon: renderOrdersTabIcon,
            onPress: () => navigation.navigate("OrderHistory"),
        },
        {
            key: "profile",
            label: "Profile",
            icon: renderProfileTabIcon,
            onPress: () => navigation.navigate("Profile"),
        },
    ];

    return (
        <View style={styles.container}>
            <Header
                leftIcon={<ChevronLeftIcon color="#0F172A" size={24} strokeWidth={2} />}
                onRightPress={handleSearchPress}
                rightIcon={<MagnifyingGlassIcon color="#0F172A" size={24} strokeWidth={2} />}
                title="Order History"
            />

            <View style={styles.content}>
                <Text style={styles.placeholderText}>Order history content</Text>
            </View>

            <BottomTab
                activeColor="#0D9488"
                activeTabKey="orders"
                tabs={tabs}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderText: {
        color: "#64748B",
        fontSize: 16,
        fontWeight: "500",
    },
});
