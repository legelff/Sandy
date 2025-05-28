import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PetFormData } from './PetFormScreen'; // Import only the data type
import { colors, spacing } from '../../../theme'; // Added import for theme
import { PawPrint } from 'lucide-react-native';

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
        router.push('/(tabs)'); // Navigate to the tabs group, defaults to index.tsx
    };

    const handlePrevious = () => {
        router.back();
    };

    const renderPetItem = ({ item }: { item: Pet }) => (
        <View className="flex-row justify-between items-center py-3 px-2.5 border-b border-gray-200 bg-gray-50 rounded-md mb-sm">
            <View className="flex-1">
                <Text className="text-lg font-bold text-text-dark">{item.name}</Text>
                <Text className="text-sm text-gray-600">{item.species} ({item.breed})</Text>
            </View>
            <View className="flex-row">
                <TouchableOpacity onPress={() => navigateToEditPetForm(item)} className="ml-2.5 py-1 px-2">
                    <Text className="text-primary text-sm">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePet(item.id)} className="ml-2.5 py-1 px-2">
                    <Text className="text-red-500 text-sm">Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 p-md pt-8 bg-background mt-8">
            <Text className="text-2xl font-bold mb-sm text-center text-text-dark">Add Your Pets</Text>
            <Text className="text-base text-gray-500 mb-lg text-center px-2.5">
                You can add one or more pets. Each pet will have its own profile.
            </Text>

            <FlatList
                data={pets}
                renderItem={renderPetItem}
                keyExtractor={(item) => item.id}
                className="flex-grow mb-lg"
                ListEmptyComponent={<Text className="text-center mt-lg text-gray-500 text-base">No pets added yet. Tap "Add Pet" to start.</Text>}
            />

            <View className="mb-sm">
                <Button title="Add Pet" onPress={navigateToAddPetForm} color={colors.primary} />
            </View>

            <View className="flex-row justify-between items-center w-full py-2.5">
                <View className="w-2/5">
                    <Button title="Previous" onPress={handlePrevious} color={colors.primary} />
                </View>
                <PawPrint size={24} color={colors.primary} />
                <View className="w-2/5">
                    <Button title="Next" onPress={handleNext} color={colors.primary} />
                </View>
            </View>
        </View>
    );
};

export default AddPetsScreen; 