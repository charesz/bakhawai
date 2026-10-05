import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LEARN_TOPICS, SHOW_DRAFT_MARKERS, type Block, type LearnTopicId } from '../content/learn';
import { colors, fonts, radius, suitabilityStyle } from '../theme';

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <Text style={styles.body}>{block.text}</Text>;

    case 'bullets':
      return (
        <View style={styles.list}>
          {block.items.map((item) => (
            <Text key={item} style={styles.body}>
              • {item}
            </Text>
          ))}
        </View>
      );

    case 'steps':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <Text key={item} style={styles.body}>
              {i + 1}. {item}
            </Text>
          ))}
        </View>
      );

    case 'table':
      return (
        <View style={styles.table}>
          {[block.header, ...block.rows].map((row, i) => (
            <View key={i} style={[styles.tr, i === 0 && styles.trHead]}>
              {row.map((cell, j) => (
                <Text key={j} style={[styles.td, i === 0 && styles.th]}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
  }
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  const initial = LEARN_TOPICS.find((t) => t.id === tab)?.id ?? 'mangroves';
  const [active, setActive] = useState<LearnTopicId>(initial);
  const topic = LEARN_TOPICS.find((t) => t.id === active)!;

  return (
    <View style={styles.screen}>
      <View style={{ height: insets.top }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </Pressable>
        <Text style={styles.title}>Learn</Text>
      </View>

      <View style={styles.tabs}>
        {LEARN_TOPICS.map((t) => {
          const on = t.id === active;
          return (
            <Pressable
              key={t.id}
              onPress={() => setActive(t.id)}
              style={[styles.tab, on && styles.tabOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {topic.sections.map((s) => (
          <View key={s.title} style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              {SHOW_DRAFT_MARKERS && s.draft && (
                <View style={styles.draftChip}>
                  <Text style={styles.draftText}>DRAFT</Text>
                </View>
              )}
            </View>

            {s.body.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}

            {SHOW_DRAFT_MARKERS && s.editorNote && <Text style={styles.editorNote}>{s.editorNote}</Text>}

            {s.sources && s.sources.length > 0 && (
              <View style={styles.sources}>
                <Text style={styles.sourcesTitle}>Sources</Text>
                {s.sources.map((src) => (
                  <Text key={src} style={styles.source}>
                    {src}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 58,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  title: { fontFamily: fonts.interMedium, fontSize: 18, color: colors.headerText },

  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#fff' },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontFamily: fonts.hindSemiBold, fontSize: 13, color: colors.primary },
  tabTextOn: { color: '#fff' },

  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.card, padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { flex: 1, fontFamily: fonts.hindSemiBold, fontSize: 16, color: colors.headerText },
  draftChip: {
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  draftText: { fontFamily: fonts.interSemiBold, fontSize: 10, color: suitabilityStyle.Marginal.text },

  body: { fontFamily: fonts.hindRegular, fontSize: 14, lineHeight: 21, color: colors.text, marginBottom: 6 },
  list: { marginBottom: 2 },

  table: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.cardBorder },
  trHead: { backgroundColor: colors.cardSoft, borderTopWidth: 0 },
  td: { flex: 1, padding: 8, fontFamily: fonts.hindRegular, fontSize: 12, color: colors.text },
  th: { fontFamily: fonts.hindSemiBold, color: colors.headerText },

  editorNote: {
    fontFamily: fonts.hindRegular,
    fontSize: 12,
    lineHeight: 18,
    color: suitabilityStyle.Marginal.text,
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  sources: { marginTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#CCC', paddingTop: 8 },
  sourcesTitle: { fontFamily: fonts.hindSemiBold, fontSize: 11, color: colors.textLabel, marginBottom: 2 },
  source: { fontFamily: fonts.hindRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted, marginBottom: 4 },
});
