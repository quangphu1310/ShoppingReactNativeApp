import React, { useCallback, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Background } from "../components/Background";
import { Button } from "../components/Button";
import { AppTextInput } from "../components/TextInput";
import {
    clearAuthError,
    loginUser,
    selectAuthError,
    selectAuthLoading,
} from "../slices/auth-slice";
import { useAppDispatch, useAppSelector } from "../stores/store";

const FingerprintIcon: React.FC = () => {
    return (
        <View style={styles.fingerprintWrap}>
            <View style={styles.fingerprintOuter}>
                <View style={styles.fingerprintMiddle}>
                    <View style={styles.fingerprintInner} />
                </View>
            </View>
        </View>
    );
};

export const SignInScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const authError = useAppSelector(selectAuthError);

    const [username, setUsername] = useState<string>("johndoe");
    const [password, setPassword] = useState<string>("secret123");
    const [useBiometric, setUseBiometric] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);

    const onUsernameChange = useCallback(
        (value: string): void => {
            setUsername(value);
            setFormError(null);

            if (authError) {
                dispatch(clearAuthError());
            }
        },
        [authError, dispatch]
    );

    const onPasswordChange = useCallback(
        (value: string): void => {
            setPassword(value);
            setFormError(null);

            if (authError) {
                dispatch(clearAuthError());
            }
        },
        [authError, dispatch]
    );

    const onToggleBiometric = useCallback((): void => {
        setUseBiometric((prevValue: boolean) => !prevValue);
    }, []);

    const onPrimaryActionPress = useCallback(async (): Promise<void> => {
        if (loading) {
            return;
        }

        const normalizedUsername = username.trim();
        const normalizedPassword = password.trim();

        if (!normalizedUsername || !normalizedPassword) {
            setFormError("Username and password are required.");
            return;
        }

        setFormError(null);

        await dispatch(
            loginUser({
                username: normalizedUsername,
                password: normalizedPassword,
            })
        );

    }, [dispatch, loading, password, username]);

    const onForgotPasswordPress = useCallback((): void => {
        setFormError("Forgot password flow is not available yet.");
    }, []);

    return (
        <Background>
            <KeyboardAvoidingView
                behavior={Platform.select({ ios: "padding", android: undefined })}
                style={styles.screen}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <View style={styles.topIconWrap}>
                            <Text style={styles.topIconText}>B</Text>
                        </View>

                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Please enter your details</Text>

                        <View style={styles.segmentedControl}>
                            <View style={[styles.segmentButton, styles.segmentButtonActive]}>
                                <Text style={[styles.segmentText, styles.segmentTextActive]}>
                                    Login
                                </Text>
                            </View>
                            <View style={styles.segmentButton}>
                                <Text style={styles.segmentText}>Sign Up</Text>
                            </View>
                        </View>

                        <AppTextInput
                            autoCapitalize="none"
                            label="Username"
                            onChangeText={onUsernameChange}
                            value={username}
                        />

                        <AppTextInput
                            autoCapitalize="none"
                            label="Password"
                            onChangeText={onPasswordChange}
                            secureTextEntry
                            value={password}
                        />

                        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

                        <TouchableOpacity onPress={onForgotPasswordPress}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Pressable onPress={onToggleBiometric} style={styles.biometricsRow}>
                            <View
                                style={[
                                    styles.checkbox,
                                    useBiometric ? styles.checkboxActive : undefined,
                                ]}
                            >
                                {useBiometric ? <Text style={styles.checkmark}>x</Text> : null}
                            </View>
                            <Text style={styles.biometricsText}>Use biometrics for faster login</Text>
                        </Pressable>

                        <Button
                            loading={loading}
                            onPress={onPrimaryActionPress}
                            size="md"
                            style={styles.primaryButton}
                            textStyle={styles.primaryButtonText}
                            title="Sign In"
                        />

                        <Button
                            leftIcon={<FingerprintIcon />}
                            size="md"
                            style={styles.outlineButton}
                            textStyle={styles.outlineButtonText}
                            title="Sign in with Biometrics"
                            variant="outline"
                            disabled={loading}
                        />

                        <View style={styles.separatorRow}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>Or continue with</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <View style={styles.socialRow}>
                            <Button
                                leftIcon={<Text style={styles.socialIcon}>G</Text>}
                                size="sm"
                                style={styles.socialButton}
                                // textStyle={styles.socialText}
                                title="Google"
                                variant="secondary"
                            />
                            <Button
                                leftIcon={<Text style={styles.socialIcon}>f</Text>}
                                size="sm"
                                style={styles.socialButton}
                                // textStyle={styles.socialText}
                                title="Facebook"
                                variant="secondary"
                            />
                        </View>

                        <Text style={styles.termsText}>
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Background>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    card: {
        width: "100%",
        maxWidth: 448,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        padding: 32,
    },
    topIconWrap: {
        alignSelf: "center",
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#dffbfb",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    topIconText: {
        color: "#11d8e2",
        fontSize: 20,
        fontWeight: "700",
    },
    title: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: "700",
        color: "#212936",
    },
    subtitle: {
        marginTop: 10,
        textAlign: "center",
        color: "#6f7c8d",
        fontSize: 16,
        marginBottom: 24,
    },
    segmentedControl: {
        flexDirection: "row",
        borderRadius: 12,
        backgroundColor: "#ebedf1",
        padding: 4,
        marginBottom: 22,
    },
    segmentButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
    },
    segmentButtonActive: {
        backgroundColor: "#ffffff",
        shadowColor: "#000000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 1,
    },
    segmentText: {
        fontSize: 14,
        color: "#6d7785",
        fontWeight: "500",
    },
    segmentTextActive: {
        color: "#1f2937",
        fontWeight: "600",
    },
    forgotPasswordText: {
        alignSelf: "flex-end",
        color: "#04cfd7",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 2,
        marginBottom: 18,
    },
    biometricsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#c7d1dd",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    checkboxActive: {
        backgroundColor: "#11d8e2",
        borderColor: "#11d8e2",
    },
    checkmark: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 12,
    },
    biometricsText: {
        color: "#6f7c8d",
        fontSize: 14,
    },
    errorText: {
        color: "#B91C1C",
        fontSize: 13,
        marginBottom: 10,
    },
    successText: {
        color: "#047857",
        fontSize: 13,
        marginBottom: 10,
    },
    primaryButton: {
        backgroundColor: "#0DF2F2",
        borderRadius: 12,
        minHeight: 48,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 14,
    },
    primaryButtonText: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 24,
    },
    outlineButton: {
        borderRadius: 12,
        minHeight: 48,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    outlineButtonText: {
        color: "#11d8e2",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 24,
    },
    fingerprintWrap: {
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    fingerprintOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "#11d8e2",
        alignItems: "center",
        justifyContent: "center",
    },
    fingerprintMiddle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.2,
        borderColor: "#11d8e2",
        alignItems: "center",
        justifyContent: "center",
    },
    fingerprintInner: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#11d8e2",
    },
    separatorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e2e8f0",
    },
    separatorText: {
        color: "#7f8a9a",
        fontSize: 14,
        marginHorizontal: 10,
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
        columnGap: 12,
    },
    socialButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d5dee8",
        backgroundColor: "#ffffff",
    },
    socialIcon: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
        marginRight: 6,
    },
    // socialText: {
    //     color: "#475569",
    //     fontSize: 14,
    //     fontWeight: "500",
    // },
    termsText: {
        textAlign: "center",
        color: "#9aa5b1",
        fontSize: 12,
        lineHeight: 16,
    },
});