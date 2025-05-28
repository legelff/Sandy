import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity, Button as NativeButton } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, RadioButton, Checkbox, Provider as PaperProvider, Card, Title, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme'; // Adjusted import path
import { CalendarDays, MapPin, Briefcase } from 'lucide-react-native';

// Dummy data for pets - replace with actual data source later
const USER_PETS = [
    { id: '1', name: 'Buddy (Dog)' },
    { id: '2', name: 'Lucy (Cat)' },
    { id: '3', name: 'Charlie (Dog)' },
];

const SERVICE_PACKAGES = ['Basic', 'Extended'];

// Renamed from SearchScreen to SearchFormScreen or similar if preferred, keeping SearchScreen for now as it's the index.
const SearchIndexScreen: React.FC = () => {
    const router = useRouter();

    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [locationOption, setLocationOption] = useState<'home' | 'current' | 'custom'>('home');
    const [customLocation, setCustomLocation] = useState<string>('');
    const [servicePackage, setServicePackage] = useState<string>(SERVICE_PACKAGES[0]);

    // Date picker visibility states (if using modal pickers)
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    const togglePetSelection = (petId: string) => {
        setSelectedPetIds(prev =>
            prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
        );
    };

    const handleStartSearching = () => {
        const searchCriteria = {
            selectedPetIds,
            fromDate,
            toDate,
            location: locationOption === 'custom' ? customLocation : locationOption,
            servicePackage,
        };
        console.log('Search Criteria:', searchCriteria);

        // Navigate to the search results screen using a more explicit path
        router.push({
            pathname: '/(tabs)/search/results', // Using absolute path from app directory
            params: { criteria: JSON.stringify(searchCriteria) } // Pass criteria as params
        });
    };

    // TODO: Implement actual date picker modals or inputs
    const renderDatePicker = (label: string, value: string, onPress: () => void) => (
        <TouchableOpacity onPress={onPress} style={styles.dateInputContainer}>
            <TextInput
                label={label}
                value={value}
                editable={false} // Non-editable, value set by picker
                style={styles.input}
                mode="outlined"
                right={<TextInput.Icon icon={() => <CalendarDays color={colors.primary} />} onPress={onPress} />}
            />
        </TouchableOpacity>
    );

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.header}>Find a Sitter</Text>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Select Your Pet(s)</Title>
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
                            <Title style={styles.cardTitle} className='mb-md'>
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
                            <Title style={styles.cardTitle} className='mb-md'>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MapPin color={colors.primary} style={{ marginRight: 8 }} />
                                    <Text style={styles.cardTitleText}>Location</Text>
                                </View>
                            </Title>
                            <RadioButton.Group onValueChange={newValue => setLocationOption(newValue as any)} value={locationOption}>
                                <RadioButton.Item label="My Home" value="home" color={colors.primary} labelStyle={{ color: colors.textDark }} />
                                <RadioButton.Item label="Current Location" value="current" color={colors.primary} labelStyle={{ color: colors.textDark }} />
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
                            <Title style={styles.cardTitle} className='mb-md'>
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

                    <View style={styles.searchButtonContainer}>
                        <NativeButton
                            title="Start Searching"
                            onPress={handleStartSearching}
                            color={colors.primary}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 24,
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
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
    dateInputContainer: {
        marginBottom: 12,
    },
    searchButtonContainer: {
        marginTop: 8,
    },
});

export default SearchIndexScreen; // Renamed export 