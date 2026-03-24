import React, { useState, useCallback } from "react";
import {
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

export interface CategoryChip {
    id: string;
    label: string;
}

export interface CategoryChipsProps {
    chips: CategoryChip[];
    onChipPress?: (chipId: string) => void;
    containerStyle?: ViewStyle;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
    chips,
    onChipPress,
    containerStyle,
}) => {
    const [activeChipId, setActiveChipId] = useState<string | null>(
        chips.length > 0 ? chips[0].id : null
    );

    const handleChipPress = useCallback(
        (chipId: string) => {
            setActiveChipId(chipId);
            onChipPress?.(chipId);
        },
        [onChipPress]
    );

    return (
        <View style={[styles.container, containerStyle]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                scrollEventThrottle={16}
            >
                {chips.map((chip) => {
                    const isActive = activeChipId === chip.id;
                    return (
                        <Pressable
                            key={chip.id}
                            onPress={() => handleChipPress(chip.id)}
                            style={[
                                styles.chip,
                                isActive ? styles.chipActive : styles.chipInactive,
                            ]}
                            hitSlop={4}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    isActive
                                        ? styles.chipTextActive
                                        : styles.chipTextInactive,
                                ]}
                            >
                                {chip.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 48,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    scrollContent: {
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    chipActive: {
        backgroundColor: "#0DF2F2",
    },
    chipInactive: {
        backgroundColor: "#F9FAFB",
    },
    chipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    chipTextActive: {
        color: "#000000",
    },
    chipTextInactive: {
        color: "#4B5563",
    },
});
