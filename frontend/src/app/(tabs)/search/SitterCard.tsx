import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
import { colors } from '../../../theme';

const { width: screenWidth } = Dimensions.get('window');

type SitterProps = {
    sitter: {
        sitter_id: number;
        name: string;
        distance: number;
        //pictures: string[];
        average_rating: number;
        supported_pets: string[];
        personality: string;
        personality_match_score: number;
    }
};

const SitterCard: React.FC<SitterProps> = ({ sitter }) => {
    const fallbackImage = 'https://via.placeholder.com/300';
    
    const handleImageError = React.useCallback((e: any) => {
        console.log('Image loading error:', e.nativeEvent.error);
    }, []);

        // Add validation for required props
    if (!sitter) {
        console.error('Sitter data is missing');
        return null;
    }

    return (
        <Card style={styles.card}>
            {/* <Image 
                source={{ 
                    uri: sitter.pictures?.[0] || fallbackImage
                    
                }} 
                style={styles.image} 
                resizeMode="cover"
                onError={handleImageError}
            /> */}
            <Card.Content style={styles.content}>
                <Title style={styles.name}>{sitter.name}</Title>
                <View style={styles.statsRow}>
                    <Text style={styles.stat}>📍 {sitter.distance.toFixed(1)} km</Text>
                    <Text style={styles.stat}>⭐ {sitter.average_rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.matchScore}>
                    Match Score: {sitter.personality_match_score}
                </Text>
                <Text style={styles.pets}>
                    Pets: {sitter.supported_pets.join(', ')}
                </Text>
                <Text style={styles.personality} numberOfLines={2}>
                    {sitter.personality}
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        width: screenWidth * 0.9,
        height: screenWidth * 1.2,
        backgroundColor: 'white',
        borderRadius: 20,
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    content: {
        padding: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    stat: {
        fontSize: 16,
        color: colors.textDark,
    },
    matchScore: {
        fontSize: 16,
        color: colors.primary,
        marginBottom: 8,
    },
    pets: {
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 8,
    },
    personality: {
        fontSize: 14,
        color: colors.textDark,
        lineHeight: 20,
    },
});

export default SitterCard;