import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router'; // Or your navigation hook
import { colors } from '../theme'; // Added import for theme colors

const RoleSelectionScreen = () => {
    const router = useRouter(); // Or useNavigation() depending on your setup

    const handleSelectRole = (role: string) => {
        console.log('Selected role:', role);
        if (role === 'Pet Owner') {
            router.push('/onboarding/pet-owner/subscription');
        } else if (role === 'Pet Sitter') {
            // Placeholder for Pet Sitter onboarding
            router.push('/onboarding/pet-sitter/subscription');
            // console.log('Pet Sitter onboarding to be implemented');
        }
    };

    return (
        <View className="flex-1 justify-center items-center p-md bg-background">
            <Text className="text-2xl font-bold mb-sm text-center text-text-dark">Choose Your Role</Text>
            <Text className="text-base text-gray-500 mb-lg text-center">How will you be using Sandy?</Text>

            <View className="my-sm w-4/5">
                <Button title="I'm a Pet Owner" onPress={() => handleSelectRole('Pet Owner')} color={colors.primary} />
            </View>

            <View className="my-sm w-4/5">
                <Button title="I'm a Pet Sitter" onPress={() => handleSelectRole('Pet Sitter')} color={colors.primary} />
            </View>
        </View>
    );
};

export default RoleSelectionScreen; 