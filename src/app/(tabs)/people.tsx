import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PersonCard } from '@/components/PersonCard';
import { Radius, Spacing } from '@/constants/theme';
import { usePeople } from '@/hooks/usePeople';
import { useAppTheme } from '@/hooks/useTheme';
import { comparePeopleByName, comparePeopleByUpcoming, matchesSearch } from '@/lib/birthdays';

type SortMode = 'upcoming' | 'name';

export default function PeopleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeople();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('upcoming');

  const visible = useMemo(() => {
    const filtered = people.filter((person) => matchesSearch(person, query));
    return [...filtered].sort(sort === 'name' ? comparePeopleByName : comparePeopleByUpcoming);
  }, [people, query, sort]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.toolbar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search people..."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search people"
          style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        />
        <View style={styles.sortRow}>
          {(['upcoming', 'name'] as const).map((mode) => {
            const selected = sort === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setSort(mode)}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: selected ? colors.primarySoft : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '700' }}>
                  {mode === 'upcoming' ? 'Upcoming' : 'A–Z'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <PersonCard person={item} index={index} onPress={() => router.push(`/person/${item.id}`)} />
        )}
        ListEmptyComponent={
          people.length === 0 ? (
            <EmptyState
              emoji="💛"
              title="Your people will appear here."
              message="Add birthdays for the people who matter to you."
              actionLabel="Add Birthday"
              onAction={() => router.push('/add')}
            />
          ) : (
            <EmptyState emoji="🔎" title="No one found." message="Try another name." />
          )
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add birthday"
        onPress={() => router.push('/add')}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 72 + insets.bottom }]}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  toolbar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
