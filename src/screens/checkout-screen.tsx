import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/outline";
import { RootStackParamList } from "../../App";
import { Header } from "../components/Header";

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, "Checkout">;

export const CheckoutScreen: React.FC<CheckoutScreenProps> = () => {
    return (
        <View style={styles.container}>
            <Header
                centerTitle={false}
                leftIcon={<ArrowLeftIcon color="#0F172A" size={28} strokeWidth={2} />}
                title="Checkout"
            />

            <View style={styles.content}>
                <Text style={styles.placeholderText}>Checkout content</Text>
            </View>
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
