import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, MapPin } from 'lucide-react-native'; // Example icons
import { colors } from '../../theme';

export interface Sitter {
    id: string;
    name: string;
    imageUrl: string; // URL for the background image of the card
    distance: string;
    rating: number;
    supportedPets: string[]; // e.g., ['Dogs', 'Cats']
    personality: string;
    // Add other fields as necessary, e.g., bio, full details for expanded view
}

interface SitterCardProps {
    sitter: Sitter;
}

const { width } = Dimensions.get('window');
const CARD_HEIGHT = Dimensions.get('window').height * 0.7;
const CARD_WIDTH = width * 0.9;

/**
 * SitterCard displays a single pet sitter's information in a tinder-like card.
 * @param {SitterCardProps} props - The props for the component.
 * @returns {React.ReactElement} The SitterCard component.
 */
const SitterCard: React.FC<SitterCardProps> = ({ sitter }) => {
    return (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={{ uri: sitter.imageUrl || 'https://via.placeholder.com/400x600.png?text=Pet+Sitter' }} // Fallback image
                style={styles.imageBackground}
                imageStyle={styles.image}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} // Gradient from transparent to dark
                    style={styles.gradient}
                >
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{sitter.name}</Text>
                        <View style={styles.row}>
                            <MapPin size={16} color={colors.textLight} style={styles.icon} />
                            <Text style={styles.detailText}>{sitter.distance}</Text>
                        </View>
                        <View style={styles.row}>
                            <Star size={16} color={colors.textLight} style={styles.icon} />
                            <Text style={styles.detailText}>{sitter.rating} / 5</Text>
                        </View>
                        <Text style={styles.detailTextBold}>Supports: <Text style={styles.detailText}>{sitter.supportedPets.join(', ')}</Text></Text>
                        <Text style={styles.detailTextBold}>Personality: <Text style={styles.detailText}>{sitter.personality}</Text></Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        overflow: 'hidden', // Ensures the gradient and image respect the border radius
        backgroundColor: colors.background, // Fallback color
        elevation: 5, // Shadow for Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end', // Aligns info to the bottom
    },
    image: {
        borderRadius: 20,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%', // Adjust gradient height as needed
        justifyContent: 'flex-end',
        padding: 20,
        borderBottomLeftRadius: 20, // Match parent border radius
        borderBottomRightRadius: 20,
    },
    infoContainer: {
        //marginBottom: 10, // Extra spacing if needed
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textLight,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    icon: {
        marginRight: 8,
    },
    detailText: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 4,
    },
    detailTextBold: {
        fontSize: 16,
        color: colors.textLight,
        fontWeight: 'bold',
        marginBottom: 4,
    }
});

export default SitterCard; 