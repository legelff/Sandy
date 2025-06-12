import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Badge } from 'react-native-paper';
import { XCircle, Star, MapPin, CalendarRange, Users } from 'lucide-react-native'; // Users for pets, CalendarRange for dates
import { colors } from '../../theme';

export interface LikedSitter {
    id: string;
    sitterName: string;
    sitterUserId: string;
    distance: string;
    rating: number;
    selectedPets: string[]; // e.g., ['Buddy (Dog)', 'Lucy (Cat)']
    fromDate: string;
    toDate: string;
    relevancyScore: number; // e.g., 85%
    // Potentially add sitterImageUrl or other fields if needed for future enhancements
}


interface LikedSitterCardProps {
    sitterOption: LikedSitter;
    onDelete: (id: string) => void;
}

/**
 * LikedSitterCard displays information about a pet sitter the user has liked/swiped right on.
 * @param {LikedSitterCardProps} props - The props for the component.
 * @returns {React.ReactElement} The LikedSitterCard component.
 */
const LikedSitterCard: React.FC<LikedSitterCardProps> = ({ sitterOption, onDelete }) => {
    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Title style={styles.sitterName}>{sitterOption.sitterName}</Title>
                    <TouchableOpacity onPress={() => onDelete(sitterOption.id)} style={styles.deleteButton}>
                        <XCircle size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <MapPin size={16} color={colors.textDark} style={styles.icon} />
                    <Paragraph style={styles.detailText}>{sitterOption.distance}</Paragraph>
                </View>

                <View style={styles.row}>
                    <Star size={16} color={colors.textDark} style={styles.icon} />
                    <Paragraph style={styles.detailText}>{sitterOption.rating} / 5</Paragraph>
                </View>

                <View style={styles.row}>
                    <CalendarRange size={16} color={colors.textDark} style={styles.icon} />
                    <Paragraph style={styles.detailText}>{sitterOption.fromDate} - {sitterOption.toDate}</Paragraph>
                </View>

                <View style={styles.petsContainer}>
                    <Users size={16} color={colors.textDark} style={styles.icon} />
                    {sitterOption.selectedPets.map((pet, index) => (
                        <Badge key={index} style={styles.petBadge} size={20}>{pet}</Badge>
                    ))}
                </View>

                <Paragraph style={styles.relevancyText}>
                    Relevancy: <Text style={styles.relevancyScore}>{sitterOption.relevancyScore}</Text>
                </Paragraph>

            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sitterName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        flex: 1, // Allow name to take space but not push delete icon out
    },
    deleteButton: {
        padding: 4, // Make it easier to tap
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
        fontSize: 15,
        color: colors.textDark,
    },
    petsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 4,
        marginBottom: 8,
    },
    petBadge: {
        marginRight: 6,
        marginBottom: 6,
        backgroundColor: colors.primary,
        color: colors.textLight,
        fontSize: 12, // Font size for badge text
    },
    relevancyText: {
        fontSize: 15,
        color: colors.textDark,
        marginTop: 8,
    },
    relevancyScore: {
        fontWeight: 'bold',
        color: colors.primary,
    },
});

export default LikedSitterCard; 