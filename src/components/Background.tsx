import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface BackgroundProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const Background: React.FC<BackgroundProps> = ({ children, style }) => {
    return <SafeAreaView style={[styles.background, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
});

export default Background;