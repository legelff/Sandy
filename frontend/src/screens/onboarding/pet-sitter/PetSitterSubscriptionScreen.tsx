import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, XCircle, PawPrint } from 'lucide-react-native';
import { colors, spacing } from '../../../theme'; // Assuming theme is in src/theme
import { useOnboardingStore } from '../../../store/onboardingStore'; // Import the store

// Define feature names for Pet Sitter subscriptions
const FEATURE_NAME_SITTER = {
    supportedPetsBasic: 'Cats & Dogs Only Supported',
    petSittingLimitBasic: 'Sit up to 2 Pets/Week',
    bookingFeeBasic: '5% Booking Fee',
    insurance: 'Pet Insurance', // Generic name, will be false for Basic
    petSittingTraining: 'Pet Sitting Training', // Generic name, will be false for Basic
    ads: 'Ad-supported Experience',
    adFree: 'Ad-free Experience',
    allBasicSitter: 'All perks from Basic Plan',
};

const SITTER_BASIC_PLAN_FEATURES = [
    { name: FEATURE_NAME_SITTER.supportedPetsBasic, included: true },
    { name: FEATURE_NAME_SITTER.petSittingLimitBasic, included: true },
    { name: FEATURE_NAME_SITTER.bookingFeeBasic, included: true },
    { name: FEATURE_NAME_SITTER.insurance, included: false },
    { name: FEATURE_NAME_SITTER.petSittingTraining, included: false },
    { name: FEATURE_NAME_SITTER.ads, included: true }, // Basic has ads
];

const SITTER_SUBSCRIPTION_OPTIONS = [
    {
        id: 'sitterBasic',
        name: 'Basic Sitter',
        price: '$3/mo', // Placeholder price
        features: SITTER_BASIC_PLAN_FEATURES,
    },
    {
        id: 'sitterPartTime',
        name: 'Part-Time Sitter',
        price: '$7/mo', // Placeholder price
        features: [
            { name: FEATURE_NAME_SITTER.allBasicSitter, included: true },
            { name: FEATURE_NAME_SITTER.adFree, included: true }, // Part-Time is Ad-free
        ],
    },
];

const PetSitterSubscriptionScreen = () => {
    const router = useRouter();
    const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
    const { setSubscriptionData } = useOnboardingStore(); // Removed getAllData

    const handleSelectSubscription = (subscriptionId: string) => {
        setSelectedSubscription(subscriptionId);
    };

    const handleNext = () => {
        if (selectedSubscription) {
            setSubscriptionData({ plan: selectedSubscription, hasSubscribed: true });
            // console.log('Selected Pet Sitter Subscription and saved to store:', selectedSubscription);

            router.push('/onboarding/pet-sitter/details'); // Navigate to details screen
        } else {
            Alert.alert('Selection Required', 'Please select a subscription plan to continue.');
        }
    };

    const handlePrevious = () => {
        router.replace('/role-selection'); // Navigate back to role selection
    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md }}
        >
            <Text
                className="text-2xl font-bold mb-sm text-center text-text-dark"
            >Choose Your Sitter Subscription</Text>
            <Text
                className="text-base text-gray-500 mb-lg text-center px-md"
            >Select a plan that suits your pet sitting availability and goals.</Text>

            {SITTER_SUBSCRIPTION_OPTIONS.map((option) => (
                <TouchableOpacity
                    key={option.id}
                    className={`w-full max-w-md p-md border rounded-lg mb-lg 
                                ${selectedSubscription === option.id ? 'border-primary bg-primary/10' : 'border-gray-300 bg-white'}`}
                    onPress={() => handleSelectSubscription(option.id)}
                >
                    <View className="flex-row justify-between items-center mb-sm">
                        <Text className="text-xl font-bold text-text-dark">{option.name}</Text>
                        <Text className="text-xl font-bold text-text-dark">{option.price}</Text>
                    </View>
                    <View
                        className="mt-sm self-stretch"
                    >
                        {option.features.map((feature, index) => (
                            <View key={index}
                                className="flex-row items-center mb-sm"
                            >
                                {feature.included ?
                                    <CheckCircle2 color="green" size={18} /> :
                                    <XCircle color="red" size={18} />}
                                <Text
                                    className="text-sm text-text-dark flex-shrink ml-sm"
                                >{feature.name}</Text>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>
            ))}

            <View
                className="flex-row justify-between items-center w-full mt-lg px-md"
            >
                <View className="w-2/5">
                    <Button title="Previous" onPress={handlePrevious} color={colors.primary} />
                </View>
                <PawPrint size={24} color={colors.primary} />
                <View className="w-2/5">
                    <Button title="Next" onPress={handleNext} disabled={!selectedSubscription} color={colors.primary} />
                </View>
            </View>
        </ScrollView>
    );
};

export default PetSitterSubscriptionScreen; 