import React, { useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { RootStackParamList } from '../../App';
import { ProductCard, Product } from '../components/ProductCard';
import { CategoryChips, CategoryChip } from '../components/CategoryChips';
import { DiscoverHeader } from '../components/DiscoverHeader';
import { BottomTab } from '../components/BottomTab';
import { useHomeScreen } from '../hooks/use-home-screen';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MOCK_CATEGORIES: CategoryChip[] = [
  { id: 'all', label: 'All Items' },
  { id: 'audio', label: 'Audio' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'cables', label: 'Cables' },
  { id: 'protection', label: 'Protection' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    products,
    searchQuery,
    isLoading,
    error,
    activeTabKey,
    bottomTabItems,
    onSearchChange,
    onRetry,
    onAddToCart,
    onWishlistPress,
    onProductPress,
    onCategoryPress,
    onBellPress,
    onCartPress,
    hideHeader,
  } = useHomeScreen(navigation);

  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    hideHeader();
  }, [hideHeader]);

  const screenWidth = Dimensions.get('window').width;
  const columnWidth = (screenWidth - 16 * 2 - 16) / 2;

  const renderProductCard: ListRenderItem<Product> = ({ item }) => (
    <View style={styles.productItemContainer}>
      <ProductCard
        product={item}
        onAddToCart={onAddToCart}
        onWishlistPress={onWishlistPress}
        onPress={onProductPress}
        style={{ width: columnWidth }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRetry} />
          }
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + 80,
            },
          ]}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <DiscoverHeader
                onBellPress={onBellPress}
                onCartPress={onCartPress}
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
                    onChangeText={onSearchChange}
                  />
                </View>
              </View>

              {/* Category Chips */}
              <CategoryChips
                chips={MOCK_CATEGORIES}
                onChipPress={onCategoryPress}
              />

              {/* Grid Separator */}
              <View style={styles.gridSeparator} />
            </>
          }
          ListEmptyComponent={
            <>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0DF2F2" />
                  <Text style={styles.loadingText}>Loading products...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error.message}</Text>
                  <Pressable onPress={onRetry} style={styles.retryButton}>
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
        <View
          style={[styles.bottomTabWrapper, { paddingBottom: insets.bottom }]}>
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
    backgroundColor: '#FFFFFF',
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
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  gridSeparator: {
    height: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    paddingVertical: 48,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#0DF2F2',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 96,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  bottomTabWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
