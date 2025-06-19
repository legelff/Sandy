import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, MapPin } from 'lucide-react-native'; // Example icons
import { colors } from '../../../theme';


export interface Sitter {
  id: string;
  name: string;
  imageUrl: string;
  distance: string;
  rating: number;
  supportedPets: string[];
  personality: string;
  personality_match_score: number; // Assuming this is a score between 0 and 1
}

interface SitterCardProps {
  sitter: Sitter;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = width * 1.4;

const SitterCard: React.FC<SitterCardProps> = ({ sitter }) => {
  const fallbackImage = 'https://via.placeholder.com/400x600.png?text=Pet+Sitter';

  return (
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: sitter.imageUrl || fallbackImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{sitter.name}</Text>
        <Text style={{ fontSize: 16, color: colors.textDark }}>
          Match Score: {sitter.personality_match_score}
        </Text>


        <View style={styles.statsRow}>
          <View style={styles.row}>
            <MapPin size={16} color={colors.textDark} />
            <Text style={styles.statText}>{sitter.distance}</Text>
          </View>
          <View style={styles.row}>
            <Star size={16} color={colors.textDark} />
            <Text style={styles.statText}>{sitter.rating} / 5</Text>
          </View>
        </View>

        <Text style={styles.label}>Supports:</Text>
        <Text style={styles.value}>{sitter.supportedPets.join(', ')}</Text>

        <Text style={styles.label}>Personality:</Text>
        <Text style={styles.value} numberOfLines={3}>
          {sitter.personality}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '60%',
  },
  content: {
    padding: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 6,
  },
});

export default SitterCard;
