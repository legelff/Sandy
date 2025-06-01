import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, RadioButton, Checkbox, Provider as PaperProvider, Card, Title, Button as PaperButton, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme';
import { CalendarDays, MapPin, Briefcase, Users, DollarSign, Dog } from 'lucide-react-native';

// Dummy data for owner's pets - in a real app, this would come from a data source
const USER_PETS = [
    { id: '1', name: 'Buddy' },
    { id: '2', name: 'Lucy' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Max' },
];

const SERVICE_PACKAGES = ['Basic', 'Extended'];
const BASE_DAILY_RATE = 30;
const EXTENDED_PACKAGE_SURCHARGE = 10;
const PER_PET_DAILY_RATE = 5;

interface BookingDetailsOwnerParams {
    chatId?: string;
    sitterName?: string; // Name of the Pet Sitter
}

const BookingDetailsOwnerScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { chatId, sitterName } = params as BookingDetailsOwnerParams;

    // Form states
    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState<string>('');     // YYYY-MM-DD
    const [locationOption, setLocationOption] = useState<'owner_home' | 'sitter_home' | 'custom'>('owner_home');
    const [customLocation, setCustomLocation] = useState<string>('');
    const [servicePackage, setServicePackage] = useState<string>(SERVICE_PACKAGES[0]);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const selectedPetNames = useMemo(() => {
        return USER_PETS.filter(pet => selectedPetIds.includes(pet.id)).map(pet => pet.name);
    }, [selectedPetIds]);

    useEffect(() => {
        const calculatePrice = () => {
            if (!fromDate || !toDate || selectedPetIds.length === 0) {
                setTotalPrice(0);
                return;
            }
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
                setTotalPrice(0);
                return;
            }
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) {
                setTotalPrice(0);
                return;
            }
            let dailyRate = BASE_DAILY_RATE;
            if (servicePackage === 'Extended') {
                dailyRate += EXTENDED_PACKAGE_SURCHARGE;
            }
            const numPets = selectedPetIds.length;
            let petSurcharge = 0;
            if (numPets > 0) {
                petSurcharge = numPets * PER_PET_DAILY_RATE;
            }
            const calculatedPrice = diffDays * (dailyRate + petSurcharge);
            setTotalPrice(calculatedPrice);
        };
        calculatePrice();
    }, [fromDate, toDate, servicePackage, selectedPetIds]);

    const togglePetSelection = (petId: string) => {
        setSelectedPetIds(prev =>
            prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
        );
    };

    const handleSendRequest = () => {
        if (selectedPetIds.length === 0) {
            alert("Please select at least one pet.");
            return;
        }
        if (!fromDate || !toDate) {
            alert("Please select valid dates.");
            return;
        }

        const bookingConfirmationDetails = {
            chatId,
            sitterName, // Sitter's name to whom the request is being made
            petNames: selectedPetNames,
            ownerName: "Pet Owner (Me)", // Placeholder for actual owner name from auth state
            fromDate,
            toDate,
            location: locationOption === 'custom' ? customLocation : locationOption,
            servicePackage,
            totalPrice,
            status: 'pending',
        };
        console.log('Sending Booking Request:', bookingConfirmationDetails);
        router.push({
            pathname: `/(tabs)/chats/chat`, // Navigate to Pet Owner's chat
            params: {
                chatId, bookingConfirmation: JSON.stringify(bookingConfirmationDetails), // Pass sitterName too for title
                sitterName: sitterName
            },
        });
    };

    return (
        <PaperProvider>
            <SafeAreaView style={styles.safeAreaContainer} edges={['bottom', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingContainer}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.headerContainer}>
                            <Title style={styles.headerTitle}>New Booking Request</Title>
                            <Text style={styles.headerSubtitle}>To: {sitterName || 'Sitter'}</Text>
                        </View>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={styles.cardTitleView}>
                                        <Dog color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Select Your Pet(s)</Text>
                                    </View>
                                </Title>
                                {USER_PETS.map(pet => (
                                    <Checkbox.Item
                                        key={pet.id}
                                        label={pet.name}
                                        status={selectedPetIds.includes(pet.id) ? 'checked' : 'unchecked'}
                                        onPress={() => togglePetSelection(pet.id)}
                                        color={colors.primary}
                                        labelStyle={{ color: colors.textDark }}
                                    />
                                ))}
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={styles.cardTitleView}>
                                        <CalendarDays color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Dates</Text>
                                    </View>
                                </Title>
                                <TextInput
                                    label="From Date (YYYY-MM-DD)"
                                    value={fromDate}
                                    onChangeText={setFromDate}
                                    style={styles.input}
                                    mode="outlined"
                                    keyboardType="numbers-and-punctuation"
                                    placeholder="YYYY-MM-DD"
                                    textColor={colors.textDark}
                                />
                                <TextInput
                                    label="To Date (YYYY-MM-DD)"
                                    value={toDate}
                                    onChangeText={setToDate}
                                    style={styles.input}
                                    mode="outlined"
                                    keyboardType="numbers-and-punctuation"
                                    placeholder="YYYY-MM-DD"
                                    textColor={colors.textDark}
                                />
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={styles.cardTitleView}>
                                        <MapPin color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Location</Text>
                                    </View>
                                </Title>
                                <RadioButton.Group onValueChange={newValue => setLocationOption(newValue as any)} value={locationOption}>
                                    <RadioButton.Item label="My Home" value="owner_home" color={colors.primary} labelStyle={{ color: colors.textDark }} />
                                    <RadioButton.Item label="Sitter's Home" value="sitter_home" color={colors.primary} labelStyle={{ color: colors.textDark }} />
                                    <RadioButton.Item label="Custom" value="custom" color={colors.primary} labelStyle={{ color: colors.textDark }} />
                                </RadioButton.Group>
                                {locationOption === 'custom' && (
                                    <TextInput
                                        label="Enter Custom Address"
                                        value={customLocation}
                                        onChangeText={setCustomLocation}
                                        style={styles.input}
                                        mode="outlined"
                                        textColor={colors.textDark}
                                    />
                                )}
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={styles.cardTitleView}>
                                        <Briefcase color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Service Package</Text>
                                    </View>
                                </Title>
                                <RadioButton.Group onValueChange={newValue => setServicePackage(newValue)} value={servicePackage}>
                                    {SERVICE_PACKAGES.map(pkg => (
                                        <RadioButton.Item key={pkg} label={pkg} value={pkg} color={colors.primary} labelStyle={{ color: colors.textDark }} />
                                    ))}
                                </RadioButton.Group>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={styles.cardTitleView}>
                                        <DollarSign color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Total Estimated Price</Text>
                                    </View>
                                </Title>
                                <Text style={styles.priceText}>${totalPrice.toFixed(2)}</Text>
                            </Card.Content>
                        </Card>

                        <PaperButton
                            mode="contained"
                            onPress={handleSendRequest}
                            style={styles.confirmButton}
                            labelStyle={styles.confirmButtonText}
                            disabled={totalPrice <= 0 || !fromDate || !toDate || selectedPetIds.length === 0}
                        >
                            Send Booking Request
                        </PaperButton>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 4,
    },
    card: {
        marginBottom: 16,
        backgroundColor: colors.white,
    },
    cardTitleView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        marginBottom: 12,
    },
    cardTitleText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    input: {
        marginBottom: 12,
        backgroundColor: colors.background,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 8,
        textAlign: 'center',
    },
    confirmButton: {
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
});

export default BookingDetailsOwnerScreen; 