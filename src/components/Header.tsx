import React from "react";
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface HeaderProps {
    title: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightPress?: () => void;
    centerTitle?: boolean;
    leftAccessibilityLabel?: string;
    rightAccessibilityLabel?: string;
    height?: number;
    backgroundColor?: string;
    iconColor?: string;
    titleColor?: string;
    titleStyle?: TextStyle;
    containerStyle?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    leftIcon,
    rightIcon,
    onRightPress,
    centerTitle = true,
    leftAccessibilityLabel = "Go back",
    rightAccessibilityLabel = "Header right action",
    height = 73,
    backgroundColor = "#FFFFFF",
    iconColor = "#0F172A",
    titleColor = "#0F172A",
    titleStyle,
    containerStyle,
}) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const handleLeftPress = (): void => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    minHeight: height + insets.top,
                    backgroundColor,
                },
                containerStyle,
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={leftAccessibilityLabel}
                hitSlop={8}
                onPress={handleLeftPress}
                style={styles.iconButton}
            >
                {leftIcon ?? <ChevronLeftIcon color={iconColor} size={24} strokeWidth={2} />}
            </Pressable>

            <Text
                numberOfLines={1}
                style={[
                    styles.title,
                    centerTitle ? styles.titleCenter : styles.titleLeft,
                    {
                        color: titleColor,
                    },
                    titleStyle,
                ]}
            >
                {title}
            </Text>

            {rightIcon ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={rightAccessibilityLabel}
                    disabled={!onRightPress}
                    hitSlop={8}
                    onPress={onRightPress}
                    style={styles.iconButton}
                >
                    {rightIcon}
                </Pressable>
            ) : centerTitle ? (
                <View style={styles.iconButton} />
            ) : null
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontFamily: "Inter",
        fontSize: 18,
        lineHeight: 28,
        fontWeight: "600",
    },
    titleCenter: {
        flex: 1,
        textAlign: "center",
    },
    titleLeft: {
        marginLeft: 12,
        flex: 1,
        textAlign: "left",
    },
});
