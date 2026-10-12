import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  Image,
  Pressable,
} from "react-native";
import Header from "../../components/Header";
import ServiceTabs from "../../components/ServiceTabs";
import SearchBar from "../../components/SearchBar";
import Icon from "../../components/Icon";
import {
  GROCERY_CATEGORIES,
  PHOTOS,
  PRODUCTS,
  type Product,
  type Service,
} from "../../data/demo";
import { fetchGroceryProducts } from "../../lib/supabaseData";
import { useNav } from "../../navigation/Navigation";
import { useApp } from "../../state/AppState";
import { rupees } from "../../lib/pricing";
import { colors, radii } from "../../theme/tokens";

export default function GroceryHome() {
  const { push } = useNav();
  const {
    setService,
    state,
    toggleFavorite,
    addToCart,
    showToast,
    setPendingAction,
  } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);

  const handleSelectService = (s: Service) => {
    setService(s);
  };

  useEffect(() => {
    let isMounted = true;
    fetchGroceryProducts().then((data) => {
      if (isMounted && data.length > 0) {
        setProductsList(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !activeCategory ||
      p.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    if (!state.authenticated) {
      setPendingAction({
        type: "cart",
        service: "grocery",
        line: {
          id: product.id,
          name: product.name,
          subtitle: `${product.unit} · Fresh essentials`,
          price: product.price,
        },
        storeId: "roadrider-grocery",
      });
      showToast("Please log in to add items to your basket");
      push({ name: "phone" });
      return;
    }
    addToCart(
      "grocery",
      {
        id: product.id,
        name: product.name,
        subtitle: `${product.unit} · Fresh essentials`,
        price: product.price,
      },
      "roadrider-grocery"
    );
    showToast(`Added ${product.name} to grocery basket`);
  };

  const handleToggleFav = (product: Product) => {
    if (!state.authenticated) {
      setPendingAction({
        type: "wishlist",
        itemId: product.id,
        itemTitle: product.name,
      });
      showToast("Please log in to save to your wishlist");
      push({ name: "phone" });
      return;
    }
    toggleFavorite(product.id);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Header />
      <ServiceTabs service="grocery" onSelect={handleSelectService} />

      {/* Hero Banner */}
      <ImageBackground
        source={{ uri: PHOTOS.grocery }}
        style={styles.hero}
        imageStyle={{ borderRadius: radii.md }}
      >
        <View style={styles.heroOverlay} />
        <Text style={styles.heroKicker}>FARM FRESH · EVERYDAY</Text>
        <Text style={styles.heroTitle}>
          Fresh groceries{"\n"}at your doorstep.
        </Text>
        <Text style={styles.heroSub}>Delivery in 15 minutes</Text>
      </ImageBackground>

      {/* Search */}
      <SearchBar
        placeholder="Search 10,000+ products"
        value={search}
        onChange={setSearch}
        onFilter={() => showToast("Showing all farm-fresh grocery categories.")}
      />

      {/* Categories */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
          <Pressable
            onPress={() => {
              setActiveCategory(null);
              setSearch("");
            }}
          >
            <Text style={styles.linkText}>
              {activeCategory ? "Show all" : "See all"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {GROCERY_CATEGORIES.map(({ abbr, label }) => {
            const isSelected = activeCategory === label;
            return (
              <Pressable
                key={label}
                onPress={() => setActiveCategory(isSelected ? null : label)}
                style={[
                  styles.categoryBtn,
                  isSelected && styles.categoryBtnActive,
                ]}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    isSelected && styles.categoryCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryAbbr,
                      isSelected && styles.categoryAbbrActive,
                    ]}
                  >
                    {abbr}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() =>
              showToast("Explore more: Bakery, Beverages, Personal Care")
            }
            style={styles.categoryBtn}
          >
            <View style={styles.categoryCircle}>
              <Text style={styles.categoryAbbr}>＋</Text>
            </View>
            <Text style={styles.categoryLabel}>More</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Discount Green Banner */}
      <View style={styles.bannerWrap}>
        <View style={styles.greenBanner}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTag}>FRESH & HEALTHY</Text>
            <Text style={styles.bannerTitle}>Up to 30% off</Text>
            <Pressable
              onPress={() => push({ name: "detail", service: "grocery" })}
              style={styles.bannerBtn}
            >
              <Text style={styles.bannerBtnText}>Shop now</Text>
              <Icon name="arrow" size={13} color="#ffffff" />
            </Pressable>
          </View>
          <Image source={{ uri: PHOTOS.produce }} style={styles.bannerImage} />
        </View>
      </View>

      {/* Daily Essentials Products Grid */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Daily essentials</Text>
          <Pressable onPress={() => push({ name: "detail", service: "grocery" })}>
            <Text style={styles.linkText}>View basket</Text>
          </Pressable>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((p, i) => {
            const isFav = state.favorites.includes(p.id);
            const discountPct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <View key={p.id || p.name} style={styles.productCard}>
                <ImageBackground
                  source={{
                    uri: i % 2 === 0 ? PHOTOS.grocery : PHOTOS.produce,
                  }}
                  style={styles.productPhoto}
                  imageStyle={{
                    borderTopLeftRadius: radii.md,
                    borderTopRightRadius: radii.md,
                  }}
                >
                  <View style={styles.prodDiscountBadge}>
                    <Text style={styles.prodDiscountText}>
                      {discountPct}% OFF
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleToggleFav(p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.prodHeartBtn}
                  >
                    <Icon name="heart" size={15} color="#ff5232" filled={isFav} />
                  </Pressable>
                </ImageBackground>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.productUnit}>{p.unit}</Text>

                  <View style={styles.priceRow}>
                    <View style={styles.priceCol}>
                      <Text style={styles.priceText}>{rupees(p.price)}</Text>
                      {p.mrp > p.price && (
                        <Text style={styles.mrpText}>{rupees(p.mrp)}</Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleAddToCart(p)}
                      style={({ pressed }) => [
                        styles.addBtn,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${p.name}`}
                    >
                      <Icon name="plus" size={18} color="#ffffff" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    marginHorizontal: 16,
    height: 140,
    borderRadius: radii.md,
    padding: 18,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    marginTop: 6,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10, 40, 20, 0.65)",
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: "800",
    color: "#86efac",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.6,
    lineHeight: 26,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.services.grocery.accent,
  },
  categoriesRow: {
    gap: 12,
  },
  categoryBtn: {
    alignItems: "center",
    width: 60,
  },
  categoryBtnActive: {},
  categoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 6,
  },
  categoryCircleActive: {
    backgroundColor: colors.services.grocery.accentSoft,
    borderColor: colors.services.grocery.accent,
    borderWidth: 1.5,
  },
  categoryAbbr: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  categoryAbbrActive: {
    color: colors.services.grocery.accent,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
  },
  categoryLabelActive: {
    color: colors.services.grocery.accent,
    fontWeight: "700",
  },
  bannerWrap: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  greenBanner: {
    backgroundColor: colors.services.grocery.accent,
    borderRadius: radii.md,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTag: {
    fontSize: 9,
    fontWeight: "800",
    color: "#bbf7d0",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  bannerBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerImage: {
    width: 90,
    height: 90,
    borderRadius: radii.md,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },
  productPhoto: {
    width: "100%",
    height: 110,
    position: "relative",
  },
  prodDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.services.grocery.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  prodDiscountText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  prodHeartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  productUnit: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceCol: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  mrpText: {
    fontSize: 10,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.services.grocery.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
