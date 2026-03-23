import React from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
    title?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    textStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = "primary",
    size = "md",
    fullWidth = true,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    textStyle,
    style,
    children,
    ...props
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={isDisabled}
            style={[
                styles.base,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth ? styles.fullWidth : styles.autoWidth,
                isDisabled ? styles.disabled : undefined,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? "#0d1b2a" : "#11d8e2"} />
            ) : (
                <View style={styles.content}>
                    {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
                    {children ? (
                        children
                    ) : (
                        <Text style={[styles.textBase, textVariantStyles[variant], textSizeStyles[size], textStyle]}>
                            {title}
                        </Text>
                    )}
                    {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    fullWidth: {
        width: "100%",
    },
    autoWidth: {
        alignSelf: "flex-start",
    },
    disabled: {
        opacity: 0.6,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    textBase: {
        fontWeight: "700",
        textAlign: "center",
    },
});

const variantStyles = StyleSheet.create<Record<ButtonVariant, ViewStyle>>({
    primary: {
        backgroundColor: "#11d8e2",
        borderWidth: 0,
    },
    secondary: {
        backgroundColor: "#e9eef5",
        borderWidth: 0,
    },
    outline: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#7be7ec",
    },
    ghost: {
        backgroundColor: "transparent",
        borderWidth: 0,
    },
});

const sizeStyles = StyleSheet.create<Record<ButtonSize, ViewStyle>>({
    sm: {
        minHeight: 36,
        paddingVertical: 8,
    },
    md: {
        minHeight: 48,
        paddingVertical: 12,
    },
    lg: {
        minHeight: 54,
        paddingVertical: 14,
    },
});

const textVariantStyles = StyleSheet.create<Record<ButtonVariant, TextStyle>>({
    primary: {
        color: "#0d1b2a",
    },
    secondary: {
        color: "#1f2937",
    },
    outline: {
        color: "#11d8e2",
    },
    ghost: {
        color: "#11d8e2",
    },
});

const textSizeStyles = StyleSheet.create<Record<ButtonSize, TextStyle>>({
    sm: {
        fontSize: 14,
    },
    md: {
        fontSize: 16,
    },
    lg: {
        fontSize: 20,
    },
});

export default Button;