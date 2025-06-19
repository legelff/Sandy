import React from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../../theme';
import { PawPrint } from 'lucide-react-native';
import { useOnboardingStore, Pet } from '../../../store/onboardingStore';
import { useAuthStore } from '../../../store/useAuthStore';

const AddPetsScreen = () => {
    const router = useRouter();
    const { pets, removePet, getAllData, resetOnboardingState } = useOnboardingStore();
    const setAuthData = useAuthStore((state) => state.setAuthData);

    const navigateToAddPetForm = () => {
        router.push({ pathname: '/onboarding/pet-owner/pet-form', params: { fromAddPets: 'true' } });
    };

    const navigateToEditPetForm = (petToEdit: Pet) => {
        router.push({
            pathname: '/onboarding/pet-owner/pet-form',
            params: { petToEdit: JSON.stringify(petToEdit), fromAddPets: 'true' },
        });
    };

    const handleDeletePet = (petId: string) => {
        removePet(petId);
        // console.log('Pet removed from store:', petId);
    };

    const handleNext = async () => {
        // Validate all pets before registration
        const incompletePet = pets.find(pet =>
            !pet.name || !pet.species || !pet.age || !pet.breed ||
            pet.vaccinations === undefined || pet.sterilized === undefined
        );
        if (incompletePet) {
            Alert.alert('Pet Incomplete', 'All pets must have Name, Species, Age, Breed, Vaccinations, and Sterilized filled in before you can continue.');
            return;
        }
        const allOnboardingData = getAllData();
        // console.log('--- All Collected Onboarding Data (Pet Owner - Preparing for API) ---');
        // console.log('Registration Data:', {
        //     name: allOnboardingData.name,
        //     email: allOnboardingData.email,
        //     // Password is not logged for security but will be sent
        //     street: allOnboardingData.street,
        //     city: allOnboardingData.city,
        //     postcode: allOnboardingData.postcode,
        //     role: allOnboardingData.role,
        // });
        // console.log('Pets Data (Raw from Store):', allOnboardingData.pets);
        // console.log('Subscription Data:', {
        //     plan: allOnboardingData.plan,
        //     hasSubscribed: allOnboardingData.hasSubscribed
        // });
        // console.log('-------------------------------------------------------------------');

        // --- Prepare data for the API ---
        let subscription_id;
        switch (allOnboardingData.plan?.toLowerCase()) {
            case 'basic':
                subscription_id = 1;
                break;
            case 'upgraded':
                subscription_id = 2;
                break;
            case 'premium':
                subscription_id = 3;
                break;
            default:
                // Default to basic or handle error if plan is not set/invalid
                // For now, let's assume a default or require it to be set.
                // If it's crucial the user selects a plan, ensure it's set before this step.
                console.warn("Subscription plan not set or invalid, defaulting to basic (ID 1) for API call.");
                subscription_id = 1; // Fallback or handle error appropriately
        }

        const transformedPets = (allOnboardingData.pets || []).map(pet => {
            const photos: string[] = [];
            if (pet.photo1Url) photos.push(pet.photo1Url);
            if (pet.photo2Url) photos.push(pet.photo2Url);
            if (pet.photo3Url) photos.push(pet.photo3Url);

            return {
                name: pet.name,
                species: pet.species,
                age: pet.age, // Ensure this is a string as per your backend expectations based on error
                breed: pet.breed,
                personality: pet.personality,
                favorite_activities_and_needs: pet.activitiesAndNeeds,
                energy_level: pet.energyLevel, // Expects number
                comfort_with_strangers: pet.comfortLevel, // Expects number, maps to comfort_with_strangers
                vaccinations: pet.vaccinations !== undefined ? pet.vaccinations : false, // Placeholder: default to false
                sterilized: pet.sterilized !== undefined ? pet.sterilized : false, // Placeholder: default to false
                photos: photos, // Array of photo URLs
            };
        });

        const registrationPayload = {
            name: allOnboardingData.name,
            email: allOnboardingData.email,
            password: allOnboardingData.password, // Ensure password is in the store
            street: allOnboardingData.street,
            city: allOnboardingData.city,
            postcode: allOnboardingData.postcode,
            subscription_id: subscription_id,
            pets: transformedPets,
            // role is implicitly 'owner' by using this endpoint
        };

        // Log the payload for debugging
        console.log('Registration payload:', JSON.stringify(registrationPayload, null, 2));

        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/auth/register/owner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationPayload),
            });

            const responseData = await response.json();

            if (response.ok && responseData.status === 200 && responseData.user && responseData.token) {
                // console.log('Registration successful:', responseData);
                setAuthData(responseData.user, responseData.token); // Log the user in
                resetOnboardingState(); // Clear onboarding data
                router.replace('/(tabs)'); // Navigate to the main dashboard
            } else {
                console.error('Registration failed:', responseData);
                const errorMessage = responseData.message || 'An unknown error occurred during registration.';
                const errorDetails = responseData.error ? `\nDetails: ${responseData.error}` : '';
                const errType = responseData.errType ? `\nError Type: ${responseData.errType}` : '';
                Alert.alert('Registration Failed', `${errorMessage}${errorDetails}${errType}`);
            }
        } catch (error) {
            console.error('Network or other error during registration:', error);
            Alert.alert('Error', 'An error occurred while trying to register. Please check your connection and try again.');
        }
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