import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SuitabilityBadge } from '../../components/SuitabilityBadge';
import { recordsService } from '../../services';
import { colors, fonts, radius } from '../../theme';
import type { AssessmentRecord, Suitability } from '../../types';

type Filter = 'All' | Suitability;
const FILTERS: Filter[] = ['All', 'Suitable', 'Marginal', 'Unsuitable'];

function formatWhen(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} • ${time}`;
}

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  // Reload every time the screen comes into view, so new assessments show up.
  useFocusEffect(
    useCallback(() => {
      // TODO(Phase 3): this will read from SQLite once recordsService is swapped.
      recordsService.list().then(setRecords);
    }, []),
  );

  const visible = useMemo(
    () =>
      records
        .filter((r) => filter === 'All' || r.suitability === filter)
        .filter((r) => r.siteName.toLowerCase().includes(query.trim().toLowerCase())),
    [records, query, filter],
  );

  // Tapping the filter icon moves to the next filter: All, Suitable, Marginal, Unsuitable.
  const nextFilter = () => setFilter((f) => FILTERS[(FILTERS.indexOf(f) + 1) % FILTERS.length]);

  return (
    <View style={styles.screen}>
      <View style={{ height: insets.top }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/home')} accessibilityLabel="Back" hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </Pressable>
        <Text style={styles.title}>Records History</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={colors.headerText} />
          <TextInput
            style={styles.input}
            placeholder="Filter locations by name..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <Pressable onPress={nextFilter} accessibilityLabel="Change filter" hitSlop={8}>
          <Ionicons name="options" size={27} color={filter === 'All' ? colors.headerText : colors.primary} />
        </Pressable>
      </View>
      {filter !== 'All' && <Text style={styles.filterNote}>Showing: {filter} (tap the filter icon to change)</Text>}

      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No records found.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/report', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Open report for ${item.siteName}`}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.site} numberOfLines={1}>
                {item.siteName}
              </Text>
              <Text style={styles.date}>{formatWhen(item.createdAt)}</Text>
            </View>
            <SuitabilityBadge value={item.suitability} />
          </Pressable>
        )}
      />
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
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  search: {
    flex: 1,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  input: { flex: 1, fontFamily: fonts.hindLight, fontSize: 15, color: colors.text, padding: 0 },
  filterNote: { fontFamily: fonts.hindRegular, fontSize: 11, color: colors.primary, marginLeft: 20, marginBottom: 4 },
  list: { paddingHorizontal: 13, paddingTop: 4, paddingBottom: 24, gap: 7 },
  card: {
    height: 63,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  site: { fontFamily: fonts.hindSemiBold, fontSize: 15, color: colors.text },
  date: { fontFamily: fonts.hindRegular, fontSize: 11, color: colors.text, marginTop: 2 },
  empty: { fontFamily: fonts.hindRegular, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});

