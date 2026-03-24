import React, { useCallback } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { BellIcon, ShoppingCartIcon } from "react-native-heroicons/outline";

export interface DiscoverHeaderProps {
    onBellPress?: () => void;
    onCartPress?: () => void;
    containerStyle?: ViewStyle;
}

export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
    onBellPress,
    onCartPress,
    containerStyle,
}) => {
    const handleBellPress = useCallback(() => {
        onBellPress?.();
    }, [onBellPress]);

    const handleCartPress = useCallback(() => {
        onCartPress?.();
    }, [onCartPress]);

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.title}>Discover</Text>

            <View style={styles.iconsContainer}>
                <Pressable
                    onPress={handleBellPress}
                    hitSlop={8}
                    style={styles.iconButton}
                    accessibilityLabel="Notifications"
                    accessibilityRole="button"
                >
                    <BellIcon size={20} color="#4B5563" strokeWidth={1.5} />
                </Pressable>

                <Pressable
                    onPress={handleCartPress}
                    hitSlop={8}
                    style={styles.iconButton}
                    accessibilityLabel="Shopping cart"
                    accessibilityRole="button"
                >
                    <ShoppingCartIcon size={20} color="#4B5563" strokeWidth={1.5} />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        height: 36,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    iconsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
    },
});
