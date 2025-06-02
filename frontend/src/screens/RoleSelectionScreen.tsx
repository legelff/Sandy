import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router'; // Or your navigation hook
import { colors } from '../theme'; // Added import for theme colors
import { useOnboardingStore } from '../store/onboardingStore'; // Import the store

const RoleSelectionScreen = () => {
    const router = useRouter(); // Or useNavigation() depending on your setup
    const { setRegistrationData } = useOnboardingStore(); // Get the setter function

    const handleSelectRole = (role: 'petOwner' | 'petSitter') => {
        // console.log('Selected role:', role);
        setRegistrationData({ role }); // Save role to store

        if (role === 'petOwner') {
            router.push('/onboarding/pet-owner/subscription'); // Navigate to subscription screen for pet owner
        } else if (role === 'petSitter') {
            router.push('/onboarding/pet-sitter/subscription'); // Corrected: Sitter to Subscription first
        }
    };

    return (
        <View className="flex-1 justify-center items-center p-md bg-background">
            <Text className="text-2xl font-bold mb-sm text-center text-text-dark">Choose Your Role</Text>
            <Text className="text-base text-gray-500 mb-lg text-center">How will you be using Sandy?</Text>

            <View className="my-sm w-4/5">
                <Button title="I'm a Pet Owner" onPress={() => handleSelectRole('petOwner')} color={colors.primary} />
            </View>

            <View className="my-sm w-4/5">
                <Button title="I'm a Pet Sitter" onPress={() => handleSelectRole('petSitter')} color={colors.primary} />
            </View>
        </View>
    );
};

export default RoleSelectionScreen; 