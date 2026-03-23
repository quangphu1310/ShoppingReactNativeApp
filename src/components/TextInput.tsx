import React from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput as RNTextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

export interface AppTextInputProps extends Omit<TextInputProps, "style"> {
    label: string;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
    label,
    containerStyle,
    labelStyle,
    inputStyle,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.label, labelStyle]}>{label}</Text>
            <RNTextInput style={[styles.input, inputStyle]} {...props} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        color: "#2b3340",
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#cfd8e2",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#2f3845",
        fontSize: 16,
        backgroundColor: "#ffffff",
    },
});

export default AppTextInput;