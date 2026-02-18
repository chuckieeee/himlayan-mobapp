import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { AuthService } from '@services/AuthService';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';
import api from '@services/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SearchResult {
  id: number;
  deceased_name: string;
  birth_date?: string;
  death_date?: string;
  burial_date?: string;
  plot?: {
    id: number;
    plot_number: string;
    section: string;
    latitude: number;
    longitude: number;
    unique_code?: string;
  };
}

const GraveSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const recentSearches = ['Juan Dela Cruz', 'Maria Santos', 'Pedro Garcia'];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(
        `/public/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.success) {
        setSearchResults(response.data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearched(false);
    setSearchResults([]);
  };

  const handleResultPress = async (result: SearchResult) => {
    console.log('👉 RESULT TAPPED:', result);

    try {
      const response = await api.get(`/burial-records/${result.id}`);

      console.log('📦 API response:', response);

      if (!response.success) {
        console.log('❌ Burial fetch failed:', response.message);
        return;
      }

      const grave = response.data;

      navigation.navigate('GraveMap', {
        plot: grave.plot,
      });
    } catch (err) {
      console.error('Burial fetch error:', err);
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Your Loved Ones</Text>
        <Text style={styles.headerSubtitle}>
          Enter the name of the person you're looking for
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter name (e.g. Juan Dela Cruz)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading || !searchQuery.trim()}>
          {loading ? (
            <>
              <ActivityIndicator color={colors.surface} size="small" />
              <Text style={styles.searchButtonText}>Searching...</Text>
            </>
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>

        {/* Quick Search Suggestions */}
        {!searched && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Examples:</Text>
            <View style={styles.suggestionTags}>
              {recentSearches.map((term, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSearchQuery(term)}
                  style={styles.suggestionTag}>
                  <Text style={styles.suggestionTagText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results Section */}
        {searched && (
          <View style={styles.resultsSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Searching for results...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>Results</Text>
                  <Text style={styles.resultsCount}>
                    {searchResults.length} found
                  </Text>
                </View>
                {searchResults.map(result => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.resultCard}
                    onPress={() => handleResultPress(result)}>
                    <View style={styles.resultAvatar}>
                      <Text style={styles.resultAvatarText}>👤</Text>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {result.deceased_name}
                      </Text>
                      <View style={styles.resultDetails}>
                        <Text style={styles.resultDetail}>
                          📍 Plot: {result.plot?.plot_number || 'N/A'}
                        </Text>
                        <Text style={styles.resultDetail}>
                          🏛️ Section: {result.plot?.section || 'N/A'}
                        </Text>
                        {result.birth_date && result.death_date && (
                          <Text style={styles.resultDetail}>
                            📅 {result.birth_date} - {result.death_date}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.viewButton}>View →</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>😔</Text>
                <Text style={styles.emptyTitle}>No Results Found</Text>
                <Text style={styles.emptySubtitle}>
                  "{searchQuery}" was not found in our database
                </Text>
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                  <Text style={styles.suggestionItem}>
                    • Check the spelling of the name
                  </Text>
                  <Text style={styles.suggestionItem}>
                    • Try searching by last name only
                  </Text>
                  <Text style={styles.suggestionItem}>
                    • Use shorter keywords
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* How It Works Section */}
        {!searched && (
          <View style={styles.howItWorksSection}>
            <Text style={styles.sectionTitle}>How to Use Search</Text>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enter Name</Text>
                <Text style={styles.stepDescription}>
                  Type the full or partial name of the deceased
                </Text>
              </View>
            </View>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Browse Results</Text>
                <Text style={styles.stepDescription}>
                  Review the list of matching records
                </Text>
              </View>
            </View>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>View Details</Text>
                <Text style={styles.stepDescription}>
                  Tap on a result to see location and navigate
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    ...typography.body1,
    color: colors.surface,
    fontWeight: '500',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.surface,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.surface,
    opacity: 0.9,
  },
  scrollContent: {
    padding: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    ...typography.h4,
    color: colors.textTertiary,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  searchButtonText: {
    ...typography.body1,
    color: colors.surface,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  suggestionsContainer: {
    marginBottom: spacing.lg,
  },
  suggestionsLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionTag: {
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  resultsSection: {
    marginTop: spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  resultsCount: {
    ...typography.body2,
    color: colors.textSecondary,
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
  },
  resultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  resultAvatarText: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultDetails: {
    marginTop: spacing.xs,
  },
  resultDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  viewButton: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  suggestions: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  suggestionsTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  suggestionItem: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryButtonText: {
    ...typography.body1,
    color: colors.surface,
    fontWeight: '600',
  },
  howItWorksSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 1,
  },
  stepNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: spacing.md,
    width: 40,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});

export default GraveSearchScreen;
