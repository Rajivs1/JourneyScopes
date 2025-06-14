import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

// Sample static language data
const LANGUAGES = [
  { id: 'spanish', name: 'Spanish', flag: '🇪🇸', region: 'Spain/Latin America' },
  { id: 'french', name: 'French', flag: '🇫🇷', region: 'France/Canada' },
  { id: 'italian', name: 'Italian', flag: '🇮🇹', region: 'Italy' },
  { id: 'german', name: 'German', flag: '🇩🇪', region: 'Germany/Austria' },
  { id: 'japanese', name: 'Japanese', flag: '🇯🇵', region: 'Japan' },
  { id: 'mandarin', name: 'Mandarin', flag: '🇨🇳', region: 'China/Taiwan' },
  { id: 'portuguese', name: 'Portuguese', flag: '🇵🇹', region: 'Portugal/Brazil' },
  { id: 'thai', name: 'Thai', flag: '🇹🇭', region: 'Thailand' },
];

// Sample static phrases data
const PHRASE_CATEGORIES = [
  {
    id: 'greetings',
    title: 'Greetings',
    icon: 'hand-wave',
    phrases: {
      spanish: [
        { phrase: 'Hola', translation: 'Hello' },
        { phrase: 'Buenos días', translation: 'Good morning' },
        { phrase: 'Buenas tardes', translation: 'Good afternoon' },
        { phrase: 'Buenas noches', translation: 'Good evening/night' },
        { phrase: 'Adiós', translation: 'Goodbye' },
        { phrase: 'Hasta luego', translation: 'See you later' },
      ],
      french: [
        { phrase: 'Bonjour', translation: 'Hello/Good day' },
        { phrase: 'Salut', translation: 'Hi' },
        { phrase: 'Bonsoir', translation: 'Good evening' },
        { phrase: 'Au revoir', translation: 'Goodbye' },
        { phrase: 'À bientôt', translation: 'See you soon' },
      ],
      // Other languages would be defined similarly
      default: [
        { phrase: 'Hello', translation: 'Select a language to see phrases' },
      ],
    },
  },
  {
    id: 'basics',
    title: 'Basic Phrases',
    icon: 'chat-processing',
    phrases: {
      spanish: [
        { phrase: 'Por favor', translation: 'Please' },
        { phrase: 'Gracias', translation: 'Thank you' },
        { phrase: 'De nada', translation: 'You\'re welcome' },
        { phrase: 'Sí', translation: 'Yes' },
        { phrase: 'No', translation: 'No' },
        { phrase: 'Perdón', translation: 'Excuse me/Sorry' },
      ],
      french: [
        { phrase: 'S\'il vous plaît', translation: 'Please' },
        { phrase: 'Merci', translation: 'Thank you' },
        { phrase: 'De rien', translation: 'You\'re welcome' },
        { phrase: 'Oui', translation: 'Yes' },
        { phrase: 'Non', translation: 'No' },
        { phrase: 'Pardon', translation: 'Excuse me/Sorry' },
      ],
      // Other languages would be defined similarly
      default: [
        { phrase: 'Please & Thank you', translation: 'Select a language to see phrases' },
      ],
    },
  },
  {
    id: 'travel',
    title: 'Travel & Directions',
    icon: 'map-marker',
    phrases: {
      spanish: [
        { phrase: '¿Dónde está...?', translation: 'Where is...?' },
        { phrase: 'El hotel', translation: 'The hotel' },
        { phrase: 'El aeropuerto', translation: 'The airport' },
        { phrase: 'La estación de tren', translation: 'The train station' },
        { phrase: 'El baño', translation: 'The bathroom' },
        { phrase: '¿Cuánto cuesta?', translation: 'How much does it cost?' },
      ],
      french: [
        { phrase: 'Où est...?', translation: 'Where is...?' },
        { phrase: 'L\'hôtel', translation: 'The hotel' },
        { phrase: 'L\'aéroport', translation: 'The airport' },
        { phrase: 'La gare', translation: 'The train station' },
        { phrase: 'Les toilettes', translation: 'The bathroom' },
        { phrase: 'Combien ça coûte?', translation: 'How much does it cost?' },
      ],
      // Other languages would be defined similarly
      default: [
        { phrase: 'Directions', translation: 'Select a language to see phrases' },
      ],
    },
  },
  {
    id: 'food',
    title: 'Food & Dining',
    icon: 'food-fork-drink',
    phrases: {
      spanish: [
        { phrase: 'Tengo hambre', translation: 'I\'m hungry' },
        { phrase: 'La carta, por favor', translation: 'The menu, please' },
        { phrase: 'La cuenta, por favor', translation: 'The check, please' },
        { phrase: 'Está delicioso', translation: 'It\'s delicious' },
        { phrase: 'Agua', translation: 'Water' },
        { phrase: 'Soy vegetariano/a', translation: 'I\'m vegetarian' },
      ],
      french: [
        { phrase: 'J\'ai faim', translation: 'I\'m hungry' },
        { phrase: 'Le menu, s\'il vous plaît', translation: 'The menu, please' },
        { phrase: 'L\'addition, s\'il vous plaît', translation: 'The check, please' },
        { phrase: 'C\'est délicieux', translation: 'It\'s delicious' },
        { phrase: 'De l\'eau', translation: 'Water' },
        { phrase: 'Je suis végétarien/végétarienne', translation: 'I\'m vegetarian' },
      ],
      // Other languages would be defined similarly
      default: [
        { phrase: 'Restaurant phrases', translation: 'Select a language to see phrases' },
      ],
    },
  },
  {
    id: 'emergency',
    title: 'Emergency',
    icon: 'medical-bag',
    phrases: {
      spanish: [
        { phrase: '¡Ayuda!', translation: 'Help!' },
        { phrase: 'Llame a la policía', translation: 'Call the police' },
        { phrase: 'Necesito un médico', translation: 'I need a doctor' },
        { phrase: 'Es una emergencia', translation: 'It\'s an emergency' },
        { phrase: 'Estoy perdido/a', translation: 'I\'m lost' },
      ],
      french: [
        { phrase: 'Au secours !', translation: 'Help!' },
        { phrase: 'Appelez la police', translation: 'Call the police' },
        { phrase: 'J\'ai besoin d\'un médecin', translation: 'I need a doctor' },
        { phrase: 'C\'est une urgence', translation: 'It\'s an emergency' },
        { phrase: 'Je suis perdu(e)', translation: 'I\'m lost' },
      ],
      // Other languages would be defined similarly
      default: [
        { phrase: 'Emergency phrases', translation: 'Select a language to see phrases' },
      ],
    },
  },
];

const LanguageScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle language selection
  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    // Reset expanded categories when changing language
    setExpandedCategories({});
  };

  // Filter categories based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return PHRASE_CATEGORIES;
    
    return PHRASE_CATEGORIES.filter(category => {
      const phrases = category.phrases[selectedLanguage?.id || 'default'];
      return (
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phrases.some(
          phrase => 
            phrase.phrase.toLowerCase().includes(searchQuery.toLowerCase()) || 
            phrase.translation.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    });
  };

  // Render language selection item
  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage?.id === item.id && {
          backgroundColor: theme.primary + '20',
          borderColor: theme.primary,
        },
      ]}
      onPress={() => selectLanguage(item)}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <View style={styles.languageInfo}>
        <Text style={[styles.languageName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.languageRegion, { color: theme.text + '99' }]}>
          {item.region}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render phrase category
  const renderPhraseCategory = (category, index) => {
    const isExpanded = expandedCategories[category.id];
    const phrases = category.phrases[selectedLanguage?.id || 'default'];
    
    // Filter phrases based on search query if category is expanded
    const filteredPhrases = searchQuery.trim() && isExpanded
      ? phrases.filter(
          phrase => 
            phrase.phrase.toLowerCase().includes(searchQuery.toLowerCase()) || 
            phrase.translation.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : phrases;
    
    return (
      <Animatable.View
        key={category.id}
        animation="fadeInUp"
        duration={500}
        delay={index * 100}
      >
        <Card style={styles.categoryCard}>
          <TouchableOpacity
            style={styles.categoryHeader}
            onPress={() => toggleCategory(category.id)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryTitleContainer}>
              <View style={[
                styles.categoryIconContainer,
                { backgroundColor: theme.primary + '20' }
              ]}>
                <Icon name={category.icon} size={20} color={theme.primary} />
              </View>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>
                {category.title}
              </Text>
            </View>
            
            <Animatable.View
              animation={isExpanded ? 'rotate' : 'rotateBack'}
              duration={300}
              style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
            >
              <Icon name="chevron-down" size={22} color={theme.text + '99'} />
            </Animatable.View>
          </TouchableOpacity>
          
          {isExpanded && (
            <Animatable.View
              animation="fadeIn"
              duration={300}
              style={styles.phrasesContainer}
            >
              {filteredPhrases.length > 0 ? (
                filteredPhrases.map((phraseItem, phraseIndex) => (
                  <Animatable.View
                    key={phraseIndex}
                    animation="fadeInUp"
                    duration={300}
                    delay={phraseIndex * 50}
                    style={styles.phraseItem}
                  >
                    <View style={styles.phraseContent}>
                      <Text style={[styles.phrase, { color: theme.text }]}>
                        {phraseItem.phrase}
                      </Text>
                      <Text style={[styles.translation, { color: theme.text + '99' }]}>
                        {phraseItem.translation}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.pronounceButton, { backgroundColor: theme.primary + '20' }]}
                    >
                      <Icon name="volume-high" size={18} color={theme.primary} />
                    </TouchableOpacity>
                  </Animatable.View>
                ))
              ) : (
                <Text style={[styles.noResults, { color: theme.text + '99' }]}>
                  No phrases matching "{searchQuery}"
                </Text>
              )}
            </Animatable.View>
          )}
        </Card>
      </Animatable.View>
    );
  };

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [theme.background, '#1a1a2e'] : 
        [theme.background, '#f5f5f7']
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.primary, theme.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Language Assistant</Text>
            {selectedLanguage && (
              <View style={styles.selectedLanguageContainer}>
                <Text style={styles.selectedLanguageFlag}>{selectedLanguage.flag}</Text>
                <Text style={styles.selectedLanguageName}>{selectedLanguage.name}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {!selectedLanguage ? (
        <View style={styles.languageSelectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select a Language
          </Text>
          <FlatList
            data={LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.languageGrid}
          />
        </View>
      ) : (
        <View style={styles.phrasesScreenContainer}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
              <Icon name="magnify" size={20} color={theme.text + '99'} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search phrases..."
                placeholderTextColor={theme.text + '80'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearch}
                  onPress={() => setSearchQuery('')}
                >
                  <Icon name="close" size={18} color={theme.text + '99'} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedLanguage(null)}
            >
              <Icon name="keyboard-backspace" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.categoriesScrollView}
            contentContainerStyle={styles.categoriesContainer}
            showsVerticalScrollIndicator={false}
          >
            {getFilteredCategories().map((category, index) => 
              renderPhraseCategory(category, index)
            )}
          </ScrollView>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 15,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  selectedLanguageFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  selectedLanguageName: {
    color: '#fff',
    fontSize: 16,
  },
  languageSelectionContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  languageGrid: {
    paddingBottom: 20,
  },
  languageItem: {
    flex: 1,
    margin: 6,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 30,
    marginBottom: 8,
  },
  languageInfo: {
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  languageRegion: {
    fontSize: 12,
    textAlign: 'center',
  },
  phrasesScreenContainer: {
    flex: 1,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  clearSearch: {
    padding: 6,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    marginBottom: 15,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  phrasesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  phraseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  phraseContent: {
    flex: 1,
  },
  phrase: {
    fontSize: 16,
    marginBottom: 4,
  },
  translation: {
    fontSize: 14,
  },
  pronounceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});

export default LanguageScreen;
