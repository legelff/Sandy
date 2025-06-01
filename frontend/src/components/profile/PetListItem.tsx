import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { Edit3, Trash2, Dog } from 'lucide-react-native'; // Assuming Dog as a placeholder icon
import { colors } from '../../theme';

export interface PetProfileItem {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    // For simplicity, using a placeholder image. In a real app, this would be a URI.
    profilePictureUrl?: string; // Optional: if pets have profile pics
}

interface PetListItemProps {
    pet: PetProfileItem;
    onEdit: (petId: string) => void;
    onDelete: (petId: string) => void;
}

/**
 * PetListItem displays a single pet with edit and delete options.
 * @param {PetListItemProps} props - The props for the component.
 * @returns {React.ReactElement} The PetListItem component.
 */
const PetListItem: React.FC<PetListItemProps> = ({ pet, onEdit, onDelete }) => {
    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.petImageContainer}>
                    {pet.profilePictureUrl ? (
                        <Image source={{ uri: pet.profilePictureUrl }} style={styles.petImage} />
                    ) : (
                        // Placeholder icon if no image
                        <Dog size={40} color={colors.primary} />
                    )}
                </View>
                <View style={styles.petInfoContainer}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petDetails}>{`${pet.species} - ${pet.breed}, ${pet.age} yrs`}</Text>
                </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => onEdit(pet.id)} style={styles.iconButton}>
                        <Edit3 size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(pet.id)} style={styles.iconButton}>
                        <Trash2 size={22} color={'#FF3B30'} />
                    </TouchableOpacity>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    petImageContainer: {
        marginRight: 12,
        // Add styles for circular image if needed, e.g. borderRadius
    },
    petImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    petInfoContainer: {
        flex: 1,
    },
    petName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.textDark,
    },
    petDetails: {
        fontSize: 13,
        color: colors.textLight,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 8,
    },
});

export default PetListItem; 