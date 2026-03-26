import React, {
    useCallback,
    useMemo,
    useState,
    useLayoutEffect,
    useEffect,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
    ListRenderItem,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import {
    MagnifyingGlassIcon,
    HomeIcon,
    SquaresPlusIcon,
    HeartIcon,
    UserIcon,
} from "react-native-heroicons/outline";
import { ProductCard, Product } from "../components/ProductCard";
import { CategoryChips, CategoryChip } from "../components/CategoryChips";
import { DiscoverHeader } from "../components/DiscoverHeader";
import { BottomTab, BottomTabItem } from "../components/BottomTab";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../stores/store";
import { resolvedApiBaseUrl } from "../services/api-service";
import {
    fetchProducts,
    selectProductError,
    selectProductLoading,
    selectProducts,
    selectProductSearchQuery,
    setSearchQuery,
} from "../slices/product-slice";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const MOCK_CATEGORIES: CategoryChip[] = [
    { id: "all", label: "All Items" },
    { id: "audio", label: "Audio" },
    { id: "electronics", label: "Electronics" },
    { id: "accessories", label: "Accessories" },
    { id: "cables", label: "Cables" },
    { id: "protection", label: "Protection" },
];

// Tab icon renderers
const renderShopTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <HomeIcon color={color} size={24} strokeWidth={2} />
);

const renderCategoriesTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <SquaresPlusIcon color={color} size={24} strokeWidth={2} />
);

const renderSavedTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <HeartIcon color={color} size={24} strokeWidth={2} />
);

const renderProfileTabIcon = (_active: boolean, color: string): React.ReactNode => (
    <UserIcon color={color} size={24} strokeWidth={2} />
);

const FALLBACK_PRODUCT_IMAGE =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop";

const resolveProductImageUrl = (rawImageUrl: string): string => {
    const normalized = rawImageUrl.trim();

    if (!normalized) {
        return FALLBACK_PRODUCT_IMAGE;
    }

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
        return normalized;
    }

    if (normalized.startsWith("//")) {
        return `https:${normalized}`;
    }

    if (normalized.startsWith("/")) {
        return `${resolvedApiBaseUrl}${normalized}`;
    }

    return `${resolvedApiBaseUrl}/${normalized}`;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const searchQuery = useAppSelector(selectProductSearchQuery);
    const productData = useAppSelector(selectProducts);
    const productLoading = useAppSelector(selectProductLoading);
    const productError = useAppSelector(selectProductError);
    const [activeTabKey, setActiveTabKey] = useState("shop");
    const insets = useSafeAreaInsets();

    // Hide default header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const handleAddToCart = useCallback((productId: string) => {
        console.log("Added to cart:", productId);
    }, []);

    const handleWishlistPress = useCallback((productId: string) => {
        console.log("Wishlist toggled:", productId);
    }, []);

    const handleCategoryPress = useCallback((_categoryId: string): void => {
        // Keep category chips as UI mock for now.
    }, []);

    const handleSearchChange = useCallback(
        (value: string): void => {
            dispatch(setSearchQuery(value));
        },
        [dispatch]
    );

    const handleBellPress = useCallback(() => {
        console.log("Bell pressed");
    }, []);

    const handleCartPress = useCallback(() => {
        console.log("Cart pressed");
    }, []);

    useEffect(() => {
        const debounceId = setTimeout(() => {
            dispatch(
                fetchProducts({
                    name: searchQuery.trim() ? searchQuery.trim() : undefined,
                })
            );
        }, 350);

        return () => {
            clearTimeout(debounceId);
        };
    }, [dispatch, searchQuery]);

    const products = useMemo<Product[]>(() => {
        return productData.map((item) => ({
            id: String(item.id),
            title: item.name,
            category: item.priceUnit.toUpperCase(),
            price: item.price,
            image: resolveProductImageUrl(item.image),
            isSale: false,
        }));
    }, [productData]);

    const handleRetryPress = useCallback((): void => {
        dispatch(
            fetchProducts({
                name: searchQuery.trim() ? searchQuery.trim() : undefined,
            })
        );
    }, [dispatch, searchQuery]);

    const screenWidth = Dimensions.get("window").width;
    const columnWidth = (screenWidth - 16 * 2 - 16) / 2; // 16px padding left/right, 16px gap

    const renderProductCard: ListRenderItem<Product> = ({ item }) => (
        <View style={styles.productItemContainer}>
            <ProductCard
                product={item}
                onAddToCart={handleAddToCart}
                onWishlistPress={handleWishlistPress}
                style={{ width: columnWidth }}
            />
        </View>
    );

    const bottomTabItems: BottomTabItem[] = [
        {
            key: "shop",
            label: "Shop",
            onPress: () => setActiveTabKey("shop"),
            icon: renderShopTabIcon,
        },
        {
            key: "categories",
            label: "Categories",
            onPress: () => {
                setActiveTabKey("categories");
                navigation.navigate("Demo");
            },
            icon: renderCategoriesTabIcon,
        },
        {
            key: "saved",
            label: "Saved",
            onPress: () => {
                setActiveTabKey("saved");
                navigation.navigate("Checkout");
            },
            icon: renderSavedTabIcon,
        },
        {
            key: "profile",
            label: "Profile",
            onPress: () => {
                setActiveTabKey("profile");
                navigation.navigate("Profile");
            },
            icon: renderProfileTabIcon,
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={products}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    refreshControl={
                        <RefreshControl
                            refreshing={productLoading}
                            onRefresh={handleRetryPress}
                        />
                    }
                    contentContainerStyle={[
                        styles.listContent,
                        {
                            paddingBottom: insets.bottom + 80, // Space for bottom tab
                        },
                    ]}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <DiscoverHeader
                                onBellPress={handleBellPress}
                                onCartPress={handleCartPress}
                            />

                            {/* Search Bar */}
                            <View style={styles.searchContainer}>
                                <View style={styles.searchInputWrapper}>
                                    <MagnifyingGlassIcon
                                        size={18}
                                        color="#9CA3AF"
                                        strokeWidth={2}
                                    />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search products..."
                                        placeholderTextColor="#9CA3AF"
                                        value={searchQuery}
                                        onChangeText={handleSearchChange}
                                    />
                                </View>
                            </View>

                            {/* Category Chips */}
                            <CategoryChips
                                chips={MOCK_CATEGORIES}
                                onChipPress={handleCategoryPress}
                            />

                            {/* Grid Separator */}
                            <View style={styles.gridSeparator} />
                        </>
                    }
                    ListEmptyComponent={
                        <>
                            {productLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#0DF2F2" />
                                    <Text style={styles.loadingText}>Loading products...</Text>
                                </View>
                            ) : productError ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{productError.message}</Text>
                                    <Pressable
                                        onPress={handleRetryPress}
                                        style={styles.retryButton}
                                    >
                                        <Text style={styles.retryText}>Try again</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Text style={styles.emptyStateText}>No products found</Text>
                            )}
                        </>
                    }
                />

                {/* Bottom Tab */}
                <View style={[styles.bottomTabWrapper, { paddingBottom: insets.bottom }]}>
                    <BottomTab
                        tabs={bottomTabItems}
                        activeTabKey={activeTabKey}
                        activeColor="#0DF2F2"
                        inactiveColor="#9CA3AF"
                        backgroundColor="#FFFFFF"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    columnWrapper: {
        gap: 16,
    },
    productItemContainer: {
        marginBottom: 12,
    },
    searchContainer: {
        paddingVertical: 16,
        paddingHorizontal: 0,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
    },
    gridSeparator: {
        height: 12,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "500",
        paddingVertical: 48,
        textAlign: "center",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    errorContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 36,
        paddingHorizontal: 20,
        gap: 10,
    },
    errorText: {
        fontSize: 14,
        color: "#DC2626",
        textAlign: "center",
        fontWeight: "500",
    },
    retryButton: {
        backgroundColor: "#0DF2F2",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 96,
        alignItems: "center",
    },
    retryText: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
    },
    bottomTabWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
});
