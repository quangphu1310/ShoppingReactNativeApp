import React, { useCallback, useMemo, useState, useLayoutEffect } from "react";
import {
    FlatList,
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

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

// Mock product data
const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        title: "Wireless Headphones",
        category: "Audio",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        isSale: false,
    },
    {
        id: "2",
        title: "Smart Watch",
        category: "Electronics",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        isSale: true,
    },
    {
        id: "3",
        title: "Portable Charger",
        category: "Accessories",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
        isSale: false,
    },
    {
        id: "4",
        title: "USB-C Cable",
        category: "Cables",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop",
        isSale: true,
    },
    {
        id: "5",
        title: "Bluetooth Speaker",
        category: "Audio",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
        isSale: false,
    },
    {
        id: "6",
        title: "Phone Stand",
        category: "Accessories",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
        isSale: true,
    },
    {
        id: "7",
        title: "Screen Protector",
        category: "Protection",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        isSale: false,
    },
    {
        id: "8",
        title: "Car Mount",
        category: "Accessories",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop",
        isSale: false,
    },
    {
        id: "9",
        title: "Webcam",
        category: "Electronics",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop",
        isSale: true,
    },
    {
        id: "10",
        title: "USB Hub",
        category: "Accessories",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop",
        isSale: false,
    },
];

// Mock category data
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

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
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

    const handleCategoryPress = useCallback((categoryId: string) => {
        setActiveCategory(categoryId);
    }, []);

    const handleBellPress = useCallback(() => {
        console.log("Bell pressed");
    }, []);

    const handleCartPress = useCallback(() => {
        console.log("Cart pressed");
    }, []);

    // Filter products based on category and search
    const filteredProducts = useMemo(() => {
        let filtered = MOCK_PRODUCTS;

        // Filter by category
        if (activeCategory !== "all") {
            filtered = filtered.filter(
                (product) =>
                    product.category.toLowerCase() === activeCategory.toLowerCase()
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.title.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [activeCategory, searchQuery]);

    const screenWidth = Dimensions.get("window").width;
    const columnWidth = (screenWidth - 16 * 2 - 16) / 2; // 16px padding left/right, 16px gap

    const renderProductCard: ListRenderItem<Product> = ({ item }) => (
        <ProductCard
            product={item}
            onAddToCart={handleAddToCart}
            onWishlistPress={handleWishlistPress}
            style={{ width: columnWidth }}
        />
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
                    data={filteredProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
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
                                        onChangeText={setSearchQuery}
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
                            <Text style={styles.emptyStateText}>No products found</Text>
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
        marginBottom: 16,
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
