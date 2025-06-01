import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, RadioButton, Provider as PaperProvider, Card, Title, Button as PaperButton, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme';
import { CalendarDays, MapPin, Briefcase, Users, DollarSign } from 'lucide-react-native';

const SERVICE_PACKAGES = ['Basic', 'Extended']; // Define available service packages
const BASE_DAILY_RATE = 30; // Example base daily rate
const EXTENDED_PACKAGE_SURCHARGE = 10; // Surcharge for extended package per day
const PER_PET_DAILY_RATE = 5; // Additional cost per extra pet per day (first pet included)

interface BookingDetailsParams {
    chatId?: string;
    ownerName?: string;
    petNames?: string; // Expecting a JSON stringified array of pet names
}

const BookingDetailsScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { chatId, ownerName, petNames: petNamesString } = params as BookingDetailsParams;

    const parsedPetNames: string[] = useMemo(() => {
        try {
            return JSON.parse(petNamesString || '[]');
        } catch (e) {
            console.error("Failed to parse pet names:", e);
            return [];
        }
    }, [petNamesString]);

    // Form states
    const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState<string>('');     // YYYY-MM-DD
    const [locationOption, setLocationOption] = useState<'owner_home' | 'sitter_home' | 'custom'>('owner_home');
    const [customLocation, setCustomLocation] = useState<string>('');
    const [servicePackage, setServicePackage] = useState<string>(SERVICE_PACKAGES[0]);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    // Effect to calculate price when relevant fields change
    useEffect(() => {
        const calculatePrice = () => {
            if (!fromDate || !toDate || parsedPetNames.length === 0) {
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

            const numPets = parsedPetNames.length;
            let petSurcharge = 0;
            if (numPets > 0) { // First pet included in base rate, surcharge for additional
                petSurcharge = (numPets) * PER_PET_DAILY_RATE; // All pets have a charge
            }

            const calculatedPrice = diffDays * (dailyRate + petSurcharge);
            setTotalPrice(calculatedPrice);
        };

        calculatePrice();
    }, [fromDate, toDate, servicePackage, parsedPetNames]);


    const handleSendConfirmation = () => {
        if (!ownerName || parsedPetNames.length === 0) {
            console.error("Owner name or pet names are missing");
            // Potentially show an alert to the user
            return;
        }
        const bookingConfirmationDetails = {
            chatId,
            ownerName,
            petNames: parsedPetNames,
            fromDate,
            toDate,
            location: locationOption === 'custom' ? customLocation : locationOption,
            servicePackage,
            totalPrice,
            status: 'pending', // Initial status for the confirmation card
        };
        console.log('Sending Booking Confirmation:', bookingConfirmationDetails);
        // Navigate back to chat and pass bookingConfirmationDetails
        // For now, just log and go back.
        // router.back(); 
        // We'll need to use router.push or similar to pass params back to the chat screen
        // or use a global state management solution.
        // For now, let's assume we will pass it via router params.
        // The chat screen will need to be adapted to receive these.
        router.push({
            pathname: `/(petSitterTabs)/chats/chat`, // Correct path to the chat screen
            params: { chatId, bookingConfirmation: JSON.stringify(bookingConfirmationDetails) },
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
                            <Title style={styles.headerTitle}>Booking for {ownerName}</Title>
                        </View>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={styles.cardTitleView}>
                                        <Users color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Pet(s)</Text>
                                    </View>
                                </Title>
                                <View style={styles.petChipsContainer}>
                                    {parsedPetNames.length > 0 ? parsedPetNames.map(petName => (
                                        <Chip key={petName} icon="paw" style={styles.petChip} textStyle={styles.petChipText}>
                                            {petName}
                                        </Chip>
                                    )) : <Text>No pets specified.</Text>}
                                </View>
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
                                    <RadioButton.Item label="Owner's Home" value="owner_home" color={colors.primary} labelStyle={{ color: colors.textDark }} />
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
                            onPress={handleSendConfirmation}
                            style={styles.confirmButton}
                            labelStyle={styles.confirmButtonText}
                            disabled={totalPrice <= 0 || !fromDate || !toDate || parsedPetNames.length === 0}
                        >
                            Send Confirmation
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
    card: {
        marginBottom: 16,
        backgroundColor: colors.white,
    },
    cardTitleView: { // Wrapper for icon and text in title
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: { // Kept for consistency if needed, but text now styled by cardTitleText
        marginBottom: 12,
    },
    cardTitleText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    petChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    petChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: colors.primary,
    },
    petChipText: {
        color: colors.white,
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

export default BookingDetailsScreen; 