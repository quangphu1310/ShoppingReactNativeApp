import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useProductDetailScreen } from '../hooks/use-product-detail-screen';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import {
  ShareIcon,
  HeartIcon,
  BoltIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowDownIcon,
} from 'react-native-heroicons/outline';
import { StarIcon as StarIconSolid } from 'react-native-heroicons/solid';

type ProductDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductDetails'
>;

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  route,
}) => {
  const { product, loading, error, mappedImageUrl, onRetry } =
    useProductDetailScreen(route.params?.id);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product Details" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0DF2F2" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product Details" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
          <Button title="Retry" onPress={onRetry} variant="primary" style={styles.retryBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Product Details"
        rightIcon={<ShareIcon color="#111827" size={24} />}
        onRightPress={() => console.log('Share pressed')}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product Image Area */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: mappedImageUrl ?? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {/* Pagination dots simulation */}
          <View style={styles.paginationContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Top Info Card (Title, Rating, Price) -> Has Bottom Radius & Shadow */}
        <View style={styles.topCardContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <Text style={styles.badgeText}>NEW ARRIVAL</Text>
              <Text style={styles.productTitle}>
                {product?.name ?? 'Quantum Pro Smartwatch'}
              </Text>
            </View>
            <HeartIcon color="#9CA3AF" size={28} style={styles.heartIcon} />
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.starFrame}><StarIconSolid color="#FBBF24" size={12} /></View>
            <View style={styles.starFrame}><StarIconSolid color="#FBBF24" size={12} /></View>
            <View style={styles.starFrame}><StarIconSolid color="#FBBF24" size={12} /></View>
            <View style={styles.starFrame}><StarIconSolid color="#FBBF24" size={12} /></View>
            <View style={styles.starFrame}><StarIconSolid color="#D1D5DB" size={12} /></View>
            <Text style={styles.reviewText}>(128 Reviews)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${product?.price ? product.price.toFixed(2) : '299.00'}
            </Text>
            {/* Keeping old price hardcoded for demo or conditionally hide if not exists */}
            <Text style={styles.oldPrice}>
              ${product?.price ? (product.price + 50).toFixed(2) : '349.00'}
            </Text>
          </View>
        </View>

        {/* Gray Gap Background */}
        <View style={styles.grayGap} />

        {/* Bottom Scroll Sections */}
        <View style={styles.bottomSectionsContainer}>
          {/* Key Features */}
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureBox}>
              <View style={styles.featureIconBox}>
                <ClockIcon color="#0DF2F2" size={24} />
              </View>
              <View>
                <Text style={styles.featureLabel}>Battery</Text>
                <Text style={styles.featureValue}>48 Hours</Text>
              </View>
            </View>

            <View style={styles.featureBox}>
              <View style={styles.featureIconBox}>
                <BoltIcon color="#0DF2F2" size={24} />
              </View>
              <View>
                <Text style={styles.featureLabel}>Sync</Text>
                <Text style={styles.featureValue}>Bluetooth 5.2</Text>
              </View>
            </View>

            <View style={styles.featureBox}>
              <View style={styles.featureIconBox}>
                <ArrowDownIcon color="#0DF2F2" size={24} />
              </View>
              <View>
                <Text style={styles.featureLabel}>Water</Text>
                <Text style={styles.featureValue}>5ATM Resist</Text>
              </View>
            </View>

            <View style={styles.featureBox}>
              <View style={styles.featureIconBox}>
                <ShieldCheckIcon color="#0DF2F2" size={24} />
              </View>
              <View>
                <Text style={styles.featureLabel}>Warranty</Text>
                <Text style={styles.featureValue}>12 Months</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Product Description */}
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.descriptionText}>
            {product?.description ??
              'Experience the future on your wrist. The Quantum Pro Smartwatch combines sleek industrial design with cutting-edge health monitoring sensors. Featuring an Always-On OLED display, it tracks your heart rate, blood oxygen levels, and daily activity with medical-grade precision.'}
          </Text>
          <Text style={styles.readMoreText}>Read more...</Text>

          <View style={styles.divider} />

          {/* User Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>User Reviews</Text>
            <Text style={styles.seeAllText}>See All</Text>
          </View>

          <View style={styles.reviewItem}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.reviewContent}>
              <View style={styles.reviewUserRow}>
                <Text style={styles.reviewerName}>Jane Doe</Text>
                <Text style={styles.reviewDate}>2 days ago</Text>
              </View>
              <View style={styles.reviewRating}>
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#D1D5DB" size={12} />
              </View>
              <Text style={styles.reviewComment}>
                Absolutely love this watch! The battery life is impressive and
                the sleep tracking is very accurate.
              </Text>
            </View>
          </View>

          <View style={styles.reviewItem}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.reviewContent}>
              <View style={styles.reviewUserRow}>
                <Text style={styles.reviewerName}>Mark Smith</Text>
                <Text style={styles.reviewDate}>1 week ago</Text>
              </View>
              <View style={styles.reviewRating}>
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
                <StarIconSolid color="#FBBF24" size={12} />
              </View>
              <Text style={styles.reviewComment}>
                The best smartwatch I've owned so far. Highly recommended for
                the price.
              </Text>
            </View>
          </View>

          {/* Bottom spacing before absolute bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.buttonWrapper}>
             <Button
              title="Add to Cart"
              variant="outline"
              style={styles.outlineButton}
              textStyle={styles.outlineButtonText}
            />
          </View>
          <View style={styles.buttonGap} />
          <View style={styles.buttonWrapper}>
            <Button
              title="Buy Now"
              variant="primary"
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          </View>
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
    backgroundColor: '#F9FAFB', // The background color of the scrolling area behind cards
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    minWidth: 120,
  },
  imageContainer: {
    width: '100%',
    height: 390,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#0DF2F2',
  },
  topCardContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4, // for android
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContent: {
    flex: 1,
    paddingRight: 16,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#0DF2F2',
    letterSpacing: 0.6,
    marginBottom: 0,
  },
  productTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
  },
  heartIcon: {
    marginTop: 0,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starFrame: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 36,
  },
  oldPrice: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: 8,
    textDecorationLine: 'line-through',
  },
  grayGap: {
    height: 16, // gap size between top card and bottom section
  },
  bottomSectionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginVertical: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureBox: {
    width: (width - 32 - 16) / 2, // (screen_width - paddingHorizontal*2 - gap) / 2
    backgroundColor: '#F9FAFB', // off-white
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E0FCFC', // light cyan background for icons
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  featureValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  readMoreText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#0DF2F2',
    marginTop: 8,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#0DF2F2',
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  reviewContent: {
    flex: 1,
  },
  reviewUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  reviewerName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  reviewDate: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  reviewComment: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 100, // Make sure last review can be scrolled past bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32, // safe area approximation
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
  },
  buttonGap: {
    width: 16,
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0DF2F2',
    borderRadius: 12,
  },
  outlineButtonText: {
    color: '#0DF2F2',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#0DF2F2',
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});
