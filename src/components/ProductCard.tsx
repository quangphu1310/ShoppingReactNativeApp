import React, { useCallback } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    Platform,
} from "react-native";
import { PlusIcon } from "react-native-heroicons/solid";
import { HeartIcon } from "react-native-heroicons/outline";

export interface Product {
    id: string;
    title: string;
    category: string;
    price: number;
    image: string;
    isSale?: boolean;
}

export interface ProductCardProps {
    product: Product;
    onAddToCart?: (productId: string) => void;
    onWishlistPress?: (productId: string) => void;
    style?: ViewStyle;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onWishlistPress,
    style,
}) => {
    const handleAddToCart = useCallback(() => {
        onAddToCart?.(product.id);
    }, [product.id, onAddToCart]);

    const handleWishlistPress = useCallback(() => {
        onWishlistPress?.(product.id);
    }, [product.id, onWishlistPress]);

    return (
        <View style={[styles.card, style]}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            {/* Wishlist Badge - Top Right */}
            <Pressable
                onPress={handleWishlistPress}
                style={styles.wishlistBadge}
                hitSlop={8}
            >
                <View style={styles.wishlistBadgeBackground}>
                    <HeartIcon size={16} color="#4B5563" strokeWidth={2.25} />
                </View>
            </Pressable>

            {/* Content Section */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {product.title}
                </Text>
                <Text style={styles.category} numberOfLines={1}>
                    {product.category}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>${product.price.toFixed(2)}</Text>

                    <Pressable
                        onPress={handleAddToCart}
                        style={styles.addToCartButton}
                        hitSlop={8}
                    >
                        <PlusIcon size={18} color="#000000" strokeWidth={2.5} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export const ProductCard = React.memo(ProductCardComponent);

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        height: 297.75,
    },
    imageContainer: {
        height: 213.75,
        width: "100%",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    wishlistBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
    },
    wishlistBadgeBackground: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: 0,
        flex: 1,
        justifyContent: "space-between",
    },
    title: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
        marginBottom: 4,
        lineHeight: 18,
    },
    category: {
        fontSize: 12,
        fontWeight: "400",
        color: "#6B7280",
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        lineHeight: 24,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    addToCartButton: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: "#0DF2F2",
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
