import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, XCircle, PawPrint } from 'lucide-react-native';
import { colors, spacing } from '../../../theme';
import { useOnboardingStore } from '../../../store/onboardingStore';

// Define feature names directly for clarity in the options
const FEATURE_NAME = {
    petLimitBasic: '1 Pet Allowed',
    petLimitPremium: 'Unlimited Pets Allowed',
    speciesBasic: 'Cats & Dogs Only Supported',
    speciesPremium: 'All Pet Species Supported',
    requestsBasic: '5 Requests/Day',
    requestsPremium: 'Unlimited Requests',
    packageBasic: 'Basic Service Package',
    packagePremium: 'Extended Service Package',
    feeBasic: '5% Booking Fee',
    feePremium: '2% Booking Fee',
    adFree: 'Ad-free Experience',
    allBasic: 'All perks from Basic Plan',
};

const BASIC_PLAN_FEATURES = [
    { name: FEATURE_NAME.petLimitBasic, included: true },
    { name: FEATURE_NAME.speciesBasic, included: true },
    { name: FEATURE_NAME.requestsBasic, included: true },
    { name: FEATURE_NAME.packageBasic, included: true },
    { name: FEATURE_NAME.feeBasic, included: true },
    { name: FEATURE_NAME.adFree, included: false }, // Basic has ads
];

const SUBSCRIPTION_OPTIONS = [
    {
        id: 'basic',
        name: 'Basic',
        price: '$5/mo',
        features: BASIC_PLAN_FEATURES,
    },
    {
        id: 'upgraded',
        name: 'Upgraded Basic',
        price: '$10/mo',
        features: [
            { name: FEATURE_NAME.allBasic, included: true },
            { name: FEATURE_NAME.adFree, included: true }, // Upgraded is Ad-free
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$15/mo',
        features: [
            { name: FEATURE_NAME.petLimitPremium, included: true },
            { name: FEATURE_NAME.speciesPremium, included: true },
            { name: FEATURE_NAME.requestsPremium, included: true },
            { name: FEATURE_NAME.packagePremium, included: true },
            { name: FEATURE_NAME.feePremium, included: true },
            { name: FEATURE_NAME.adFree, included: true }, // Premium is Ad-free
        ],
    },
];

const PetOwnerSubscriptionScreen = () => {
    const router = useRouter();
    const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
    const { setSubscriptionData } = useOnboardingStore();

    const handleSelectSubscription = (subscriptionId: string) => {
        setSelectedSubscription(subscriptionId);
    };

    const handleNext = () => {
        if (selectedSubscription) {
            setSubscriptionData({ plan: selectedSubscription, hasSubscribed: true });
            // console.log('Selected Pet Owner Subscription and saved to store:', selectedSubscription);

            // Navigate to the add pets screen
            router.push('/onboarding/pet-owner/add-pets');
        } else {
            // console.log('Please select a subscription.');
        }
    };

    const handlePrevious = () => {
        router.back();
    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md }}
        >
            <Text
                className="text-2xl font-bold mb-sm text-center text-text-dark"
            >Choose Your Subscription</Text>
            <Text
                className="text-base text-gray-500 mb-lg text-center px-md"
            >Select a plan that works best for you as a Pet Owner.</Text>

            {SUBSCRIPTION_OPTIONS.map((option) => (
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

export default PetOwnerSubscriptionScreen; 