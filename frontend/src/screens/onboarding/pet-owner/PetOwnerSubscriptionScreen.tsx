import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';

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

    const handleSelectSubscription = (subscriptionId: string) => {
        setSelectedSubscription(subscriptionId);
    };

    const handleNext = () => {
        if (selectedSubscription) {
            console.log('Selected Pet Owner Subscription:', selectedSubscription);
            router.push('/onboarding/pet-owner/add-pets');
        } else {
            console.log('Please select a subscription.');
        }
    };

    const handlePrevious = () => {
        router.back();
    };

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Choose Your Subscription</Text>
            <Text style={styles.subtitle}>Select a plan that works best for you as a Pet Owner.</Text>

            {SUBSCRIPTION_OPTIONS.map((option) => (
                <TouchableOpacity
                    key={option.id}
                    style={[
                        styles.optionButton,
                        selectedSubscription === option.id && styles.selectedOption,
                    ]}
                    onPress={() => handleSelectSubscription(option.id)}
                >
                    <Text style={styles.optionName}>{option.name} - {option.price}</Text>
                    <View style={styles.featuresContainer}>
                        {option.features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                {feature.included ?
                                    <CheckCircle2 color="green" size={18} style={styles.icon} /> :
                                    <XCircle color="red" size={18} style={styles.icon} />}
                                <Text style={styles.featureText}>{feature.name}</Text>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>
            ))}

            <View style={styles.navigationButtons}>
                <Button title="Previous" onPress={handlePrevious} />
                <Button title="Next" onPress={handleNext} disabled={!selectedSubscription} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
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
        marginBottom: 25,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    optionButton: {
        width: '95%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
    },
    selectedOption: {
        borderColor: 'blue',
        backgroundColor: '#e6f0ff',
    },
    optionName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    featuresContainer: {
        marginTop: 10,
        alignSelf: 'stretch',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        marginLeft: 8,
        flexShrink: 1,
    },
    icon: {
        // marginRight: 5, // Set on featureText.marginLeft instead for consistency
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 20,
    },
});

export default PetOwnerSubscriptionScreen; 