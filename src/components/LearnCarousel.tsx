import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    type ImageSourcePropType,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { images } from '../assets';
import type { LearnTopicId } from '../content/learn';
import { colors, fonts, radius } from '../theme';

type Card = {
  id: LearnTopicId;
  text: string;
  image?: ImageSourcePropType;
  overlay: readonly [string, string];
};

// Each card opens the matching tab in the Learn screen.
// TODO(Phase 8): add more cards (or photos for cards 2 and 3) if you want.
const DARK_OVERLAY = ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)'] as const;

const CARDS: Card[] = [
  {
    id: 'mangroves',
    text: 'Find out more about mangrove ecosystem',
    image: images.banner,
    overlay: ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)'],
  },
  
  { id: 'how-to', text: 'How to use Bakhaw AI', image: images.howToCard, overlay: DARK_OVERLAY },
  { id: 'tips', text: 'Tips for taking good readings', image: images.tipsCard, overlay: DARK_OVERLAY },
];

export function LearnCarousel() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - 32; // same side margins as the rest of Home
  const [page, setPage] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        data={CARDS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.id}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <Pressable
            style={{ width, height: 85 }}
            accessibilityRole="button"
            accessibilityLabel={item.text}
            onPress={() => router.push({ pathname: '/learn', params: { tab: item.id } })}
          >
            {item.image && <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />}
            <LinearGradient
              colors={item.overlay}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.textWrap}>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          </Pressable>
        )}
      />
      <View style={styles.dots} pointerEvents="none">
        {CARDS.map((c, i) => (
          <View key={c.id} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24, height: 85, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.tint },
  textWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 15 },
  text: { fontFamily: fonts.hindSemiBold, fontSize: 15, color: '#fff', width: 170 },
  dots: { position: 'absolute', bottom: 8, alignSelf: 'center', flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 20, backgroundColor: '#fff' },
});
