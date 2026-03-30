import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import {
    ArrowLeftOnRectangleIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    ChevronLeftIcon,
    Cog6ToothIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    UserIcon,
} from "react-native-heroicons/outline";
import { RootStackParamList } from "../../App";
import { BottomTab, BottomTabItem } from "../components/BottomTab";
import { Header } from "../components/Header";
import { useLocalProfile } from "../hooks/use-local-profile";
import { getCurrentUser, logoutUser, selectAuthToken } from "../slices/auth-slice";
import { useAppDispatch, useAppSelector } from "../stores/store";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const renderHomeTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <HomeIcon color={color} size={24} strokeWidth={2} />
);

const renderSearchTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <MagnifyingGlassIcon color={color} size={24} strokeWidth={2} />
);

const renderProfileTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <UserIcon color={color} size={24} strokeWidth={2} />
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectAuthToken);
    const { profile, loading, refetch } = useLocalProfile();

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const syncProfileFromApi = async (): Promise<void> => {
                if (!token) {
                    return;
                }

                const action = await dispatch(getCurrentUser(token));
                if (isMounted && getCurrentUser.fulfilled.match(action)) {
                    refetch();
                }
            };

            void syncProfileFromApi();

            return () => {
                isMounted = false;
            };
        }, [dispatch, refetch, token]),
    );

    const handleSettingsPress = useCallback(() => {
        navigation.navigate("Demo");
    }, [navigation]);

    const handleHomePress = useCallback(() => {
        navigation.navigate("Home");
    }, [navigation]);

    const handleSearchPress = useCallback(() => {
        navigation.navigate("Demo");
    }, [navigation]);

    const handleProfilePress = useCallback(() => {
        navigation.navigate("Profile");
    }, [navigation]);

    const handleOrderHistoryPress = useCallback(() => {
        navigation.navigate("OrderHistory");
    }, [navigation]);

    const handleLogoutPress = useCallback(async () => {
        try {
            await dispatch(logoutUser());
        } catch (error) {
            console.error('Failed to clear profile:', error);
        }
    }, [dispatch]);

    const handleNoopPress = useCallback(() => {
        // UI-only phase: interaction intentionally disabled
    }, []);

    const tabs: BottomTabItem[] = [
        {
            key: "home",
            label: "Home",
            icon: renderHomeTabIcon,
            onPress: handleHomePress,
        },
        {
            key: "search",
            label: "Search",
            icon: renderSearchTabIcon,
            onPress: handleSearchPress,
        },
        {
            key: "profile",
            label: "Profile",
            icon: renderProfileTabIcon,
            onPress: handleProfilePress,
        },
    ];

    // Display loading spinner while profile is being loaded
    if (loading) {
        return (
            <View style={styles.container}>
                <Header
                    leftIcon={<ChevronLeftIcon color="#0F172A" size={24} strokeWidth={2} />}
                    onRightPress={handleSettingsPress}
                    rightIcon={<Cog6ToothIcon color="#0F172A" size={24} strokeWidth={2} />}
                    titleStyle={styles.headerTitle}
                    title="Profile Settings"
                    titleColor="#1F2937"
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0DF2F2" />
                </View>
                <BottomTab
                    activeColor="#0DF2F2"
                    activeTabKey="profile"
                    tabs={tabs}
                />
            </View>
        );
    }

    // Get initials from profile or use default
    const initials = profile
        ? `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`
        : 'U';

    return (
        <View style={styles.container}>
            <Header
                leftIcon={<ChevronLeftIcon color="#0F172A" size={24} strokeWidth={2} />}
                onRightPress={handleSettingsPress}
                rightIcon={<Cog6ToothIcon color="#0F172A" size={24} strokeWidth={2} />}
                titleStyle={styles.headerTitle}
                title="Profile Settings"
                titleColor="#1F2937"
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                            <Pressable
                                accessibilityLabel="Edit avatar"
                                accessibilityRole="button"
                                onPress={handleNoopPress}
                                style={styles.avatarEditBadge}
                            >
                                <PencilIcon color="#1F2937" size={12} strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.nameText}>
                        {profile ? `${profile.firstName} ${profile.lastName}` : 'Guest User'}
                    </Text>
                    <Text style={styles.usernameText}>
                        {profile ? `@${profile.username}` : '@guest'}
                    </Text>

                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>PREMIUM MEMBER</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        <Pressable
                            accessibilityLabel="Edit details"
                            accessibilityRole="button"
                            onPress={handleNoopPress}
                        >
                            <Text style={styles.editDetailsText}>Edit Details</Text>
                        </Pressable>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                        <View style={styles.emailInputContainer}>
                            <Text style={styles.emailText}>
                                {profile?.email || 'No email'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>FIRST NAME</Text>
                        <Text style={styles.fieldValue}>
                            {profile?.firstName || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>LAST NAME</Text>
                        <Text style={styles.fieldValue}>
                            {profile?.lastName || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.fieldGroupLast}>
                        <Text style={styles.fieldLabel}>AGE</Text>
                        <Text style={styles.fieldValue}>
                            {profile?.age || 'N/A'}
                        </Text>
                    </View>
                </View>

                <Pressable
                    accessibilityLabel="Open order history"
                    accessibilityRole="button"
                    onPress={handleOrderHistoryPress}
                    style={styles.singleActionCard}
                >
                    <View style={styles.actionLeftGroup}>
                        <View style={styles.actionIconContainer}>
                            <ClipboardDocumentListIcon color="#6B7280" size={16} strokeWidth={2} />
                        </View>
                        <Text style={styles.actionText}>Order History</Text>
                    </View>
                    <ChevronRightIcon color="#D1D5DB" size={18} strokeWidth={2} />
                </Pressable>

                <Pressable
                    accessibilityLabel="Logout"
                    accessibilityRole="button"
                    onPress={handleLogoutPress}
                    style={[styles.singleActionCard, styles.logoutActionCard]}
                >
                    <View style={styles.actionLeftGroup}>
                        <View style={styles.logoutIconContainer}>
                            <ArrowLeftOnRectangleIcon color="#EF4444" size={16} strokeWidth={2} />
                        </View>
                        <Text style={styles.logoutText}>Logout</Text>
                    </View>
                </Pressable>
            </ScrollView>

            <BottomTab
                activeColor="#0DF2F2"
                activeTabKey="profile"
                tabs={tabs}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerTitle: {
        fontFamily: "Inter",
        fontSize: 20,
        fontWeight: "600",
        lineHeight: 24,
    },
    card: {
        marginBottom: 24,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        padding: 16,
        shadowColor: "#0F172A",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    avatarWrapper: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
        marginBottom: 12,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        position: "relative",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitials: {
        fontFamily: "Inter",
        fontSize: 28,
        fontWeight: "600",
        color: "#1F2937",
    },
    avatarEditBadge: {
        position: "absolute",
        right: -8,
        bottom: -2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#0DF2F2",
        alignItems: "center",
        justifyContent: "center",
    },
    nameText: {
        textAlign: "center",
        fontFamily: "Inter",
        fontSize: 20,
        lineHeight: 24,
        fontWeight: "600",
        color: "#1F2937",
    },
    usernameText: {
        marginTop: 4,
        textAlign: "center",
        fontFamily: "Inter",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
        color: "#6B7280",
    },
    badgeContainer: {
        marginTop: 10,
        alignSelf: "center",
        borderRadius: 999,
        backgroundColor: "rgba(13,242,242,0.1)",
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        fontFamily: "Inter",
        fontSize: 12,
        lineHeight: 14,
        fontWeight: "600",
        color: "#0DF2F2",
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: "Inter",
        fontSize: 18,
        lineHeight: 22,
        fontWeight: "600",
        color: "#1F2937",
    },
    editDetailsText: {
        fontFamily: "Inter",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600",
        color: "#0DF2F2",
    },
    fieldGroup: {
        marginBottom: 14,
    },
    fieldGroupLast: {
        marginBottom: 0,
    },
    fieldLabel: {
        fontFamily: "Inter",
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "500",
        color: "#6B7280",
        marginBottom: 6,
    },
    emailInputContainer: {
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    emailText: {
        fontFamily: "Inter",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
        color: "#6B7280",
    },
    fieldValue: {
        fontFamily: "Inter",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
        color: "#1F2937",
    },
    singleActionCard: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        minHeight: 68,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#0F172A",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    logoutActionCard: {
        marginBottom: 24,
    },
    actionLeftGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    logoutIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    actionText: {
        fontFamily: "Inter",
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "500",
        color: "#1F2937",
    },
    logoutText: {
        fontFamily: "Inter",
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "500",
        color: "#EF4444",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});