import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, RadioButton, Checkbox, Provider as PaperProvider, Card, Title, Button as PaperButton, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme';
import { CalendarDays, MapPin, Briefcase, Users, DollarSign, Dog } from 'lucide-react-native';
import { useAuthStore } from '../../../store/useAuthStore';

const SERVICE_PACKAGES = ['Basic', 'Extended'];
const BASE_DAILY_RATE = 30;
const EXTENDED_PACKAGE_SURCHARGE = 10;
const PER_PET_DAILY_RATE = 5;

interface BookingDetailsOwnerParams {
    chatId?: string;
    sitterName?: string;
    sitterId?: string;
}

const BookingDetailsOwnerScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { chatId, sitterName, sitterId } = params as BookingDetailsOwnerParams;
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    // API state
    const [userPets, setUserPets] = useState<{ id: string; name: string }[]>([]);
    const [ownerName, setOwnerName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState<string>('');     // YYYY-MM-DD
    const [locationOption, setLocationOption] = useState<'owner_home' | 'sitter_home' | 'custom'>('owner_home');
    const [customLocation, setCustomLocation] = useState<string>('');
    const [servicePackage, setServicePackage] = useState<string>(SERVICE_PACKAGES[0]);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const selectedPetNames = useMemo(() => {
        return userPets.filter(pet => selectedPetIds.includes(pet.id)).map(pet => pet.name);
    }, [selectedPetIds, userPets]);

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

    useEffect(() => {
        const fetchPetsAndOwner = async () => {
            if (!user?.id || !token) return;
            setLoading(true);
            setError(null);
            try {
                // Fetch pets
                const petsRes = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/search/owner?user_id=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const petsData = await petsRes.json();
                setUserPets(petsData.pets.map((pet: any) => ({ id: pet.id.toString(), name: pet.name })));
                // Fetch owner info
                const ownerRes = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/users/profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ownerData = await ownerRes.json();
                setOwnerName(ownerData.user?.name || 'Me');
            } catch (err: any) {
                setError('Failed to fetch pets or owner info');
            } finally {
                setLoading(false);
            }
        };
        fetchPetsAndOwner();
    }, [user, token]);

    const togglePetSelection = (petId: string) => {
        setSelectedPetIds(prev =>
            prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
        );
    };

    const handleSendRequest = async () => {
        console.log('handleSendRequest')
        if (selectedPetIds.length === 0) {
            alert("Please select at least one pet.");
            return;
        }
        if (!fromDate || !toDate) {
            alert("Please select valid dates.");
            return;
        }
        if (!user || !token) {
            alert("User not authenticated");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // 0. Get sitter ID
            const sitterIdReq = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/sitter/users/${sitterId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (!sitterIdReq.ok) throw new Error('Failed to fetch sitter ID');
            const sitterData = await sitterIdReq.json();
            const realSitterId = sitterData.sitter_id;

            // 1. Create the booking
            const bookingRes = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sitter_id: realSitterId,
                    pet_ids: selectedPetIds,
                    start_datetime: fromDate,
                    end_datetime: toDate,
                    status: 'requested',
                    service_tier: servicePackage
                })
            });
            if (!bookingRes.ok) throw new Error('Failed to create booking');
            const bookingData = await bookingRes.json();
            const booking = bookingData.booking;
            // 2.get conversation with sitter
            const chatRes = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/chat/with/${sitterId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!chatRes.ok) throw new Error('Failed to create chat');
            const conversation = await chatRes.json();
            // 3. Send booking_confirmation message with booking id
            const bookingRequestMessage = {
                type: 'booking_confirmation',
                bookingDetails: {
                    id: booking.id,
                    sitterName: sitterName,
                    ownerName: ownerName,
                    petNames: selectedPetNames,
                    fromDate,
                    toDate,
                    location: locationOption === 'custom' ? customLocation : locationOption,
                    servicePackage,
                    totalPrice,
                    status: 'pending',
                }
            };
            await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/chat/${conversation.id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: JSON.stringify(bookingRequestMessage)
                })
            });
            // 4. Navigate to chat
            router.back();
        } catch (err: any) {
            setError(err.message || 'Error sending booking request');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Text style={{ margin: 20 }}>Loading...</Text>;
    }
    if (error) {
        return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;
    }

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
                                {userPets.map(pet => (
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