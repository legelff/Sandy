import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PetFormData } from './PetFormScreen'; // Import only the data type

// Expanded Pet interface to include all fields from PetFormData
interface Pet extends PetFormData {
    id: string;
}

const AddPetsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ newPetData?: string; updatedPetData?: string; petId?: string; action?: string }>();

    const [pets, setPets] = useState<Pet[]>([]);

    useEffect(() => {
        if (params.action === 'add' && params.newPetData) {
            try {
                const newPet = JSON.parse(params.newPetData) as PetFormData;
                setPets(prevPets => [...prevPets, { ...newPet, id: Math.random().toString(36).substr(2, 9) }]);
                // Optionally, clear params or use a different mechanism if multiple adds/edits are quick
                router.setParams({ newPetData: '', action: '' });
            } catch (e) {
                console.error("Failed to parse new pet data:", e);
            }
        } else if (params.action === 'edit' && params.updatedPetData && params.petId) {
            try {
                const updatedPet = JSON.parse(params.updatedPetData) as PetFormData;
                setPets(prevPets =>
                    prevPets.map(p => (p.id === params.petId ? { ...updatedPet, id: params.petId! } : p))
                );
                router.setParams({ updatedPetData: '', petId: '', action: '' });
            } catch (e) {
                console.error("Failed to parse updated pet data:", e);
            }
        }
    }, [params.newPetData, params.updatedPetData, params.petId, params.action, router]);

    const navigateToAddPetForm = () => {
        router.push('/onboarding/pet-owner/pet-form');
    };

    const navigateToEditPetForm = (petToEdit: Pet) => {
        router.push({
            pathname: '/onboarding/pet-owner/pet-form',
            params: { petToEdit: JSON.stringify(petToEdit) },
        });
    };

    const handleDeletePet = (petId: string) => {
        setPets(prevPets => prevPets.filter(p => p.id !== petId));
    };

    const handleNext = () => {
        if (pets.length === 0) {
            // console.log('Please add at least one pet to continue.');
            // return; // Uncomment to enforce adding pets
        }
        console.log('Proceeding from Add Pets with:', pets);
        router.push('/(tabs)/home'); // Placeholder navigation
    };

    const handlePrevious = () => {
        router.back();
    };

    const renderPetItem = ({ item }: { item: Pet }) => (
        <View style={styles.petItemContainer}>
            <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petSpecies}>{item.species} ({item.breed})</Text>
            </View>
            <View style={styles.petActions}>
                <TouchableOpacity onPress={() => navigateToEditPetForm(item)} style={styles.actionButton}>
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePet(item.id)} style={styles.actionButton}>
                    <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Your Pets</Text>
            <Text style={styles.subtitle}>
                You can add one or more pets. Each pet will have its own profile.
            </Text>

            <FlatList
                data={pets}
                renderItem={renderPetItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                ListEmptyComponent={<Text style={styles.emptyListText}>No pets added yet. Tap "Add Pet" to start.</Text>}
            />

            <Button title="Add Pet" onPress={navigateToAddPetForm} />

            <View style={styles.navigationButtons}>
                <Button title="Previous" onPress={handlePrevious} />
                <Button title="Next" onPress={handleNext} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 30, // More space at the top
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    list: {
        flexGrow: 1,
        marginBottom: 20,
    },
    petItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
        marginBottom: 8,
    },
    petInfo: {
        flex: 1, // Allow pet info to take available space
    },
    petName: {
        fontSize: 18, // Slightly larger name
        fontWeight: 'bold',
    },
    petSpecies: {
        fontSize: 14,
        color: '#555',
    },
    petActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 10,
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    actionText: {
        color: 'blue',
        fontSize: 14,
    },
    deleteText: {
        color: 'red',
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
        fontSize: 16,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 10, // Added padding
    },
    // Modal styles will be part of PetFormModal
});

export default AddPetsScreen; 