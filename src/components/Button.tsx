import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export default function Button({ style, ...props }: any) {
    return (
        <TouchableOpacity
            style={[styles.button, style]}
            labelStyle={styles.text}
            {...props}
        />
    );
}

type IButtonStyles = {
    button: ViewStyle;
    text: TextStyle;
};

const styles = StyleSheet.create<IButtonStyles>({
    button: {
        width: '80%',
        marginVertical: 10,
        paddingVertical: 10,
        backgroundColor: '#0DF2F2',
        alignItems: 'center',
        borderRadius: 10,
    },
    text: {
        fontWeight: 'bold',
        fontSize: 15,
        lineHeight: 26,
        color: 'black',
    },
});