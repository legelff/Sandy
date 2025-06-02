import React, { useState } from 'react';
import { View, Text, Button, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PawPrint, UserCircle, Camera, CheckSquare, Square } from 'lucide-react-native'; // Added icons
import { colors, spacing } from '../../../theme';
import { useOnboardingStore } from '../../../store/onboardingStore'; // Import the store

const PetSitterProfileScreen = () => {
    const router = useRouter();
    const { setPetSitterOnboardingData, getAllData, resetOnboardingState } = useOnboardingStore(); // Get store action, getAllData, and resetOnboardingState

    const [bio, setBio] = useState('');
    const [motivation, setMotivation] = useState('');
    const [photos, setPhotos] = useState<string[]>([]); // Placeholder for photo URIs
    const [supportedPets, setSupportedPets] = useState<{ cats: boolean; dogs: boolean }>({ cats: false, dogs: false });

    const handleNext = async () => {
        if (!bio || !motivation) {
            Alert.alert('Missing Information', 'Please fill in your personality and motivation.');
            return;
        }
        if (photos.length < 3) {
            Alert.alert('Photos Required', 'Please upload at least 3 photos.');
            return;
        }

        const profileData = { bio, motivation, photos, supportedPets };
        setPetSitterOnboardingData(profileData);
        // console.log('Pet Sitter Profile Details saved to store:', profileData);

        const allOnboardingData = getAllData();

        const parseExperienceLevel = (level?: string): number => {
            if (!level) return 0;
            const lowerLevel = level.toLowerCase();
            if (lowerLevel.includes("0-1") || lowerLevel.includes("beginner")) return 0;
            if (lowerLevel.includes("1-3") || lowerLevel.includes("intermediate")) return 1;
            if (lowerLevel.includes("3+") || lowerLevel.includes("experienced")) return 3;
            const match = level.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
        };
        const transformedExperienceYears = parseExperienceLevel(allOnboardingData.experienceLevel);

        const personalityAndMotivation = `${allOnboardingData.bio || ''}\n\nMotivation: ${allOnboardingData.motivation || ''}`.trim();

        const transformedAvailability = allOnboardingData.availability
            ? Object.entries(allOnboardingData.availability)
                .filter(([, detail]) => detail.isAvailable)
                .map(([day, detail]) => ({
                    day_of_week: day,
                    start_time: detail.fromTime,
                    end_time: detail.toTime,
                }))
            : [];

        const getSubscriptionId = (plan?: string): number | undefined => {
            if (!plan) return undefined;
            const lowerPlan = plan.toLowerCase();
            if (lowerPlan.includes('basic')) {
                return 1;
            } else {
                return 2;
            }
            return undefined; // Or a default/error value if appropriate
        };

        const requestBody = {
            name: allOnboardingData.name,
            email: allOnboardingData.email,
            password: allOnboardingData.password,
            street: allOnboardingData.street,
            city: allOnboardingData.city,
            postcode: allOnboardingData.postcode,
            experience_years: transformedExperienceYears,
            personality_and_motivation: personalityAndMotivation,
            subscription_id: getSubscriptionId(allOnboardingData.plan),
            availability: transformedAvailability,
            photos: allOnboardingData.photos,
        };

        // console.log('--- Attempting to Register Pet Sitter ---');
        // console.log('Request Body:', JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch('http://192.168.1.52:3000/auth/register/sitter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json();

            if (response.ok) {
                // console.log('Registration successful:', responseData);
                Alert.alert('Registration Successful', 'Your pet sitter profile has been created!');
                resetOnboardingState();
                router.replace('/(petSitterTabs)');
            } else {
                console.error('Registration failed:', responseData);
                Alert.alert('Registration Failed', responseData.message || `Error: ${response.status} - ${responseData.errType || 'Unknown error type'}`);
            }
        } catch (error: any) {
            console.error('Network or other error during registration:', error);
            Alert.alert('Registration Error', error.message || 'An unexpected error occurred. Please check your network connection and try again.');
        }
    };

    const handlePrevious = () => {
        router.push('/onboarding/pet-sitter/details'); // Navigate back to details/experience screen
    };

    const toggleSupportedPet = (petType: 'cats' | 'dogs') => {
        setSupportedPets(prev => ({ ...prev, [petType]: !prev[petType] }));
    };

    // Placeholder for photo upload logic
    const handlePhotoUpload = () => {
        // console.log('Photo upload triggered');
        // This would typically open an image picker
        if (photos.length < 3) {
            setPhotos([...photos, `photo${photos.length + 1}.jpg`]); // Placeholder URI
        }
    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md }}
        >
            <Text className="text-2xl font-bold mb-sm text-center text-text-dark">Complete Your Sitter Profile</Text>
            <Text className="text-base text-gray-500 mb-lg text-center px-md">Share more about yourself and the pets you can care for.</Text>

            {/* Personality */}
            <View className="mb-md">
                <Text className="text-sm font-semibold text-text-dark mb-xs">Personality & Bio</Text>
                <TextInput
                    className="border border-gray-300 p-sm rounded-md bg-white text-text-dark h-24"
                    placeholder="Describe your personality, and a bit about yourself..."
                    value={bio}
                    onChangeText={setBio}
                    multiline
                />
            </View>

            {/* Motivation */}
            <View className="mb-lg">
                <Text className="text-sm font-semibold text-text-dark mb-xs">Motivation</Text>
                <TextInput
                    className="border border-gray-300 p-sm rounded-md bg-white text-text-dark h-24"
                    placeholder="Why do you enjoy pet sitting? What makes you a great sitter?"
                    value={motivation}
                    onChangeText={setMotivation}
                    multiline
                />
            </View>

            {/* Photo Upload Placeholder */}
            <View className="mb-lg p-sm border border-gray-300 rounded-md bg-white">
                <View className="flex-row items-center justify-between mb-sm">
                    <Text className="text-sm font-semibold text-text-dark">Upload 3 Profile Photos</Text>
                    <Camera size={20} color={colors.primary} />
                </View>
                <Button title={`Upload Photo (${photos.length}/3)`} onPress={handlePhotoUpload} disabled={photos.length >= 3} color={colors.primary} />
                <View className="flex-row flex-wrap mt-sm">
                    {photos.map((photo, index) => (
                        <View key={index} className="w-20 h-20 bg-gray-200 mr-sm mb-sm rounded items-center justify-center">
                            <Text className="text-xs text-gray-600">{photo}</Text>
                        </View>
                    ))}
                    {[...Array(Math.max(0, 3 - photos.length))].map((_, i) => (
                        <View key={`placeholder-${i}`} className="w-20 h-20 bg-gray-100 border-dashed border-gray-300 mr-sm mb-sm rounded items-center justify-center">
                            <UserCircle size={24} color={'#6B7280' /* Fallback for grayMedium */} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Supported Pets */}
            <View className="mb-lg p-sm border border-gray-300 rounded-md bg-white">
                <Text className="text-sm font-semibold text-text-dark mb-sm">Pets You Can Sit</Text>
                <TouchableOpacity
                    className="flex-row items-center justify-between py-sm"
                    onPress={() => toggleSupportedPet('cats')}
                >
                    <Text className={`text-base ${supportedPets.cats ? 'text-primary font-semibold' : 'text-text-dark'}`}>Cats</Text>
                    {supportedPets.cats ? <CheckSquare size={24} color={colors.primary} /> : <Square size={24} color={'#6B7280' /* Fallback for grayMedium */} />}
                </TouchableOpacity>
                <View className="h-px bg-gray-200" />{/* Divider */}
                <TouchableOpacity
                    className="flex-row items-center justify-between py-sm"
                    onPress={() => toggleSupportedPet('dogs')}
                >
                    <Text className={`text-base ${supportedPets.dogs ? 'text-primary font-semibold' : 'text-text-dark'}`}>Dogs</Text>
                    {supportedPets.dogs ? <CheckSquare size={24} color={colors.primary} /> : <Square size={24} color={'#6B7280' /* Fallback for grayMedium */} />}
                </TouchableOpacity>
            </View>


            {/* Navigation Buttons */}
            <View className="flex-row justify-between items-center w-full mt-md">
                <View className="w-2/5">
                    <Button title="Previous" onPress={handlePrevious} color={colors.primary} />
                </View>
                <PawPrint size={24} color={colors.primary} />
                <View className="w-2/5">
                    <Button title="Next" onPress={handleNext} color={colors.primary} />
                </View>
            </View>
        </ScrollView>
    );
};

export default PetSitterProfileScreen;