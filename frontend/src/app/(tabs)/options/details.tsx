import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, RadioButton, Checkbox, Provider as PaperProvider, Card, Title, Button as PaperButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme';
import { CalendarDays, MapPin, Briefcase, Star, Users } from 'lucide-react-native'; // Added Star and Users for rating and pets
import { useAuthStore } from '../../../store/useAuthStore';


const SERVICE_PACKAGES = ['Basic', 'Extended']; // Should match search screen or be dynamic

interface SitterDetails {
  id: string; // booking_id
  sitterUserId: string;
  sitterName: string;
  distance: string;
  rating: number;
  selectedPets: string[]; // pet names
  fromDate: string;
  toDate: string;
  servicePackage: string; // "Basic" | "Extended"
}



const SitterDetailsScreen: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const params = useLocalSearchParams();
    const [sitter, setSitter] = useState<SitterDetails | null>(null);


    useEffect(() => {
  if (params.sitterData && typeof params.sitterData === 'string') {
    try {
      const parsed = JSON.parse(params.sitterData);
      setSitter(parsed);
      setFromDate(parsed.fromDate);
      setToDate(parsed.toDate);
      setServicePackage(parsed.servicePackage || 'Basic');
    } catch (e) {
      console.error('Failed to parse sitterData:', e);
    }
  }
}, [params.sitterData]);


   const [userPets, setUserPets] = useState<{ id: string; name: string }[]>([]);

    // Form states, initialized from sitter data
    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [locationOption, setLocationOption] = useState<'home' | 'current' | 'custom'>('home'); // Default or from sitter
    const [customLocation, setCustomLocation] = useState<string>('');
    const [servicePackage, setServicePackage] = useState<string>(SERVICE_PACKAGES[0]);



useEffect(() => {
  const fetchPets = async () => {
    try {
      const res = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/search/owner?user_id=${user.id}`);
      const data = await res.json();
      const pets = data.pets.map((p: any) => ({ id: p.id.toString(), name: `${p.name} (${p.species})` }));

      setUserPets(pets);

      if (sitter?.selectedPets?.length) {
        const preselectedIds = pets
          .filter(p => sitter.selectedPets.some(name => p.name.startsWith(name))) // partial match by name
          .map(p => p.id);
        setSelectedPetIds(preselectedIds);
      }
    } catch (e) {
      console.error('Failed to fetch pets:', e);
    }
  };
  fetchPets();
}, [sitter]);





    const togglePetSelection = (petId: string) => {
        setSelectedPetIds(prev =>
            prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
        );
    };

    const handleConfirmRequest = async () => {
        if (!sitter || !user?.id) return;

        const payload = {
            user_id: user.id, // from auth store
            sitter_user_id: parseInt(sitter.sitterUserId), // make sure it's number
            start_date: fromDate,
            end_date: toDate,
            selected_pets: selectedPetIds.map(id => parseInt(id)), // convert to numbers
            street: customLocation || 'Lange Ridderstraat 44', // fallback if empty
            city: 'Mechelen', // you can pass this from SearchScreen too
            postcode: '2800', // hardcoded or passed
        };


        console.log('Sending booking payload from details screen:', payload);

        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/search/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to confirm booking');

            const data = await response.json();
            console.log('✅ Booking confirmed:', data);
            router.back(); // or show a success message
        } catch (error) {
            console.error('❌ Booking failed:', error);
            alert('Failed to confirm your booking.');
        }
        };


    if (!sitter) {
        return (
            <PaperProvider>
                <SafeAreaView style={styles.safeAreaContainer}>
                    <View style={styles.loadingContainer}>
                        <Text>Loading sitter details...</Text>
                    </View>
                </SafeAreaView>
            </PaperProvider>
        );
    }

    return (
        <PaperProvider>
            <SafeAreaView style={styles.safeAreaContainer} edges={['bottom', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingContainer}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust offset as needed for header
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.sitterInfoContainer}>
                            <Title style={styles.sitterName}>{sitter.sitterName}</Title>
                            <View style={styles.sitterMetaRow}>
                                <MapPin size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                <Text style={styles.sitterMetaText}>{sitter.distance}</Text>
                                <Star size={16} color={colors.primary} style={{ marginLeft: 12, marginRight: 4 }} />
                                <Text style={styles.sitterMetaText}>{sitter.rating} / 5</Text>
                            </View>
                        </View>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Users color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Selected Pet(s)</Text>
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
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                                    textColor={colors.textDark}
                                />
                                <TextInput
                                    label="To Date (YYYY-MM-DD)"
                                    value={toDate}
                                    onChangeText={setToDate}
                                    style={styles.input}
                                    mode="outlined"
                                    keyboardType="numbers-and-punctuation"
                                    textColor={colors.textDark}
                                />
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.cardTitle}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MapPin color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text style={styles.cardTitleText}>Location</Text>
                                    </View>
                                </Title>
                                <RadioButton.Group onValueChange={newValue => setLocationOption(newValue as any)} value={locationOption}>
                                    <RadioButton.Item label="My Home" value="home" color={colors.primary} labelStyle={{ color: colors.textDark }} />
                                    <RadioButton.Item label="Sitter's Home (if applicable)" value="sitter_home" color={colors.primary} labelStyle={{ color: colors.textDark }} />
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
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

                        <PaperButton
                            mode="contained"
                            onPress={handleConfirmRequest}
                            style={styles.confirmButton}
                            labelStyle={styles.confirmButtonText}
                            color={colors.primary} // Ensure PaperButton uses color prop for background
                        >
                            Confirm Request
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sitterInfoContainer: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 8,
        alignItems: 'center', // Center content like name, distance, rating
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    sitterName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    sitterMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sitterMetaText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    card: {
        marginBottom: 16,
        backgroundColor: colors.white, // Ensure cards have a distinct background
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 12, // Add some space below title
        flexDirection: 'row', // Align icon and text
        alignItems: 'center',
    },
    cardTitleText: { // Style for the text part of the title if icon is present
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    input: {
        marginBottom: 12,
        backgroundColor: colors.background, // Light background for inputs
    },
    confirmButton: {
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary, // Explicitly set background color
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white, // Ensure text is white for primary button
    },
});

export default SitterDetailsScreen; 