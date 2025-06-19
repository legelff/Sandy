import React, { useState } from 'react';
import { View, Text, Button, ScrollView, TextInput, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PawPrint, CalendarDays, Clock } from 'lucide-react-native'; // Added icons
import { colors, spacing } from '../../../theme';
import { useOnboardingStore } from '../../../store/onboardingStore'; // Import the store
// Assuming you might use React Native Paper components for Checkbox later if desired
// import { Checkbox as PaperCheckbox } from 'react-native-paper';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface AvailabilityDetail {
    isAvailable: boolean;
    fromTime: string;
    toTime: string;
}

export interface AvailabilityData { // Exporting for potential use in store if not already shared
    Monday: AvailabilityDetail;
    Tuesday: AvailabilityDetail;
    Wednesday: AvailabilityDetail;
    Thursday: AvailabilityDetail;
    Friday: AvailabilityDetail;
    Saturday: AvailabilityDetail;
    Sunday: AvailabilityDetail;
}

const initialAvailability: AvailabilityData = {
    Monday: { isAvailable: false, fromTime: '', toTime: '' },
    Tuesday: { isAvailable: false, fromTime: '', toTime: '' },
    Wednesday: { isAvailable: false, fromTime: '', toTime: '' },
    Thursday: { isAvailable: false, fromTime: '', toTime: '' },
    Friday: { isAvailable: false, fromTime: '', toTime: '' },
    Saturday: { isAvailable: false, fromTime: '', toTime: '' },
    Sunday: { isAvailable: false, fromTime: '', toTime: '' },
};

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PetSitterExperienceScreen = () => {
    const router = useRouter();
    const { setPetSitterOnboardingData } = useOnboardingStore(); // Correctly get only the setter

    const [yearsExperience, setYearsExperience] = useState('');
    const [availability, setAvailability] = useState<AvailabilityData>(initialAvailability);
    const [alwaysAccept, setAlwaysAccept] = useState(false); // Renamed to alwaysAccept for clarity with store

    const handleAvailabilityChange = (day: DayOfWeek, field: keyof AvailabilityDetail, value: string | boolean) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const handleNext = () => {
        if (!yearsExperience) {
            Alert.alert('Missing Information', 'Please enter your years of experience.');
            return;
        }

        const experienceData = {
            experienceLevel: yearsExperience,
            availability,
            alwaysAcceptRequests: alwaysAccept,
        };

        setPetSitterOnboardingData(experienceData); // No need to spread previous state here, store action handles merging
        // console.log('Pet Sitter Experience Details saved to store:', experienceData);
        router.push('/onboarding/pet-sitter/profile'); // Navigate to profile screen
    };

    const handlePrevious = () => {
        router.push('/onboarding/pet-sitter/subscription'); // Navigate back to subscription screen
    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md }}
        >
            <Text className="text-2xl font-bold mb-sm text-center text-text-dark">Your Experience & Availability</Text>
            <Text className="text-base text-gray-500 mb-lg text-center px-md">Tell us about your experience and when you're available to sit.</Text>

            {/* Years of Experience */}
            <View className="mb-md">
                <Text className="text-sm font-semibold text-text-dark mb-xs">Years of Experience</Text>
                <TextInput
                    className="border border-gray-300 p-sm rounded-md bg-white text-text-dark"
                    placeholder="E.g., 5"
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    keyboardType="numeric"
                />
            </View>

            {/* Availability */}
            <View className="mb-lg">
                <Text className="text-sm font-semibold text-text-dark mb-md">Availability</Text>
                {DAYS_OF_WEEK.map((day) => (
                    <View key={day} className="mb-md p-sm border border-gray-300 rounded-md bg-white">
                        <TouchableOpacity
                            className="flex-row items-center justify-between mb-sm"
                            onPress={() => handleAvailabilityChange(day, 'isAvailable', !availability[day].isAvailable)}
                        >
                            <View className="flex-row items-center">
                                {/* Basic Checkbox visualization - consider using a library component */}
                                <View
                                    className={`w-5 h-5 border-2 rounded-sm mr-sm items-center justify-center ${availability[day].isAvailable ? 'bg-primary border-primary' : 'border-gray-400'}`}
                                >
                                    {availability[day].isAvailable && <Text className="text-white text-xs">✓</Text>}
                                </View>
                                <Text className="text-base text-text-dark font-medium">{day}</Text>
                            </View>
                            {availability[day].isAvailable && <CalendarDays size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        {availability[day].isAvailable && (
                            <View className="flex-row justify-between items-center mt-xs">
                                <View className="flex-1 mr-xs">
                                    <Text className="text-xs text-gray-500 mb-xs">From</Text>
                                    <TextInput
                                        className="border border-gray-300 p-xs rounded-md bg-white text-text-dark text-sm"
                                        placeholder="HH:MM"
                                        value={availability[day].fromTime}
                                        onChangeText={(text) => handleAvailabilityChange(day, 'fromTime', text)}
                                        keyboardType="numbers-and-punctuation"
                                    />
                                </View>
                                <Clock size={18} color={colors.textSecondary} style={{ marginHorizontal: spacing.xs, marginTop: spacing.md }} />
                                <View className="flex-1 ml-xs">
                                    <Text className="text-xs text-gray-500 mb-xs">To</Text>
                                    <TextInput
                                        className="border border-gray-300 p-xs rounded-md bg-white text-text-dark text-sm"
                                        placeholder="HH:MM"
                                        value={availability[day].toTime}
                                        onChangeText={(text) => handleAvailabilityChange(day, 'toTime', text)}
                                        keyboardType="numbers-and-punctuation"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Always Accept Toggle */}
            <View className="flex-row items-center justify-between mb-lg p-sm border border-gray-300 rounded-md bg-white">
                <Text className="text-sm text-text-dark">Always Accept Requests?</Text>
                <Switch
                    trackColor={{ false: '#D1D5DB', true: colors.primary /* Or a light primary hex */ }}
                    thumbColor={alwaysAccept ? colors.primary : '#6B7280'}
                    ios_backgroundColor={'#D1D5DB'}
                    onValueChange={setAlwaysAccept}
                    value={alwaysAccept}
                />
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

export default PetSitterExperienceScreen; 