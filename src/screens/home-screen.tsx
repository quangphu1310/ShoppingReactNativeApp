import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../App";
import { Button } from "../components/Button";
import { logout, selectCurrentUser } from "../slices/auth-slice";
import { useAppDispatch, useAppSelector } from "../stores/store";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.subtitle}>
                Welcome{currentUser ? `, ${currentUser.firstName}` : ""}
            </Text>

            <Button
                onPress={() => navigation.navigate("Profile")}
                style={styles.buttonSpacing}
                title="Go to Profile"
            />

            <Button
                onPress={() => navigation.navigate("Demo")}
                style={styles.buttonSpacing}
                title="Go to Demo"
                variant="secondary"
            />

            <Button
                onPress={() => navigation.navigate("OrderHistory")}
                style={styles.buttonSpacing}
                title="Go to Order History"
                variant="secondary"
            />

            <Button
                onPress={() => navigation.navigate("Checkout")}
                style={styles.buttonSpacing}
                title="Go to Checkout"
                variant="secondary"
            />

            <Button
                onPress={() => {
                    dispatch(logout());
                }}
                title="Sign Out"
                variant="outline"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#4B5563",
        textAlign: "center",
        marginBottom: 20,
    },
    buttonSpacing: {
        marginBottom: 12,
    },
});
