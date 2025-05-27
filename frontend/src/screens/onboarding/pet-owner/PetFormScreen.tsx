import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInput as PaperTextInput, Menu, Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { PlusCircle } from 'lucide-react-native';

// Interface for form data remains the same
export interface PetFormData {
    name: string;
    species: string;
    breed: string;
    age: string;
    personality: string;
    activitiesAndNeeds: string;
    energyLevel: number;
    comfortLevel: number;
    photo1Url?: string;
    photo2Url?: string;
    photo3Url?: string;
}

const initialFormState: PetFormData = {
    name: '',
    species: '',
    breed: '',
    age: '',
    personality: '',
    activitiesAndNeeds: '',
    energyLevel: 5,
    comfortLevel: 5,
    photo1Url: '',
    photo2Url: '',
    photo3Url: '',
};

const COMMON_PET_SPECIES = [
    'Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Guinea Pig',
    'Turtle', 'Snake', 'Lizard', 'Ferret', 'Mouse', 'Rat',
    'Chinchilla', 'Hedgehog', 'Sugar Glider', 'Horse', 'Chicken', 'Duck', 'Other'
];

const SPECIES_BREEDS: Record<string, string[]> = {
    Dog: [
        'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog', 'Poodle',
        'Beagle', 'Rottweiler', 'Dachshund', 'German Shorthaired Pointer', 'Yorkshire Terrier', 'Other'
    ],
    Cat: [
        'Domestic Shorthair', 'Siamese', 'Persian', 'Maine Coon', 'Ragdoll',
        'Bengal', 'Abyssinian', 'Sphynx', 'British Shorthair', 'Scottish Fold', 'Other'
    ],
    Rabbit: [
        'Netherland Dwarf', 'Mini Lop', 'Holland Lop', 'Flemish Giant', 'Rex',
        'Lionhead', 'Angora Rabbit', 'Dutch Rabbit', 'Mini Rex', 'Californian Rabbit', 'Other'
    ],
    Horse: [
        'American Quarter Horse', 'Arabian', 'Thoroughbred', 'Appaloosa', 'Morgan',
        'Paint Horse', 'Warmblood', 'Andalusian', 'Tennessee Walking Horse', 'Shetland Pony', 'Other'
    ],
    Bird: [
        'Budgerigar (Parakeet)', 'Cockatiel', 'Canary', 'Finch', 'Lovebird',
        'African Grey Parrot', 'Amazon Parrot', 'Macaw', 'Cockatoo', 'Other'
    ],
    Fish: [
        'Goldfish', 'Betta', 'Guppy', 'Angelfish', 'Tetra',
        'Molly', 'Platy', 'Cichlid', 'Koi', 'Other'
    ],
    Hamster: [
        'Syrian (Golden)', 'Dwarf Winter White Russian', 'Dwarf Campbell Russian', 'Roborovski', 'Chinese', 'Other'
    ],
    'Guinea Pig': [
        'American', 'Abyssinian', 'Peruvian', 'Silkie (Sheltie)', 'Teddy',
        'Texel', 'Coronet', 'Baldwin', 'Skinny Pig', 'Other'
    ],
    Turtle: [
        'Red-Eared Slider', 'African Sideneck', 'Box Turtle', 'Painted Turtle', 'Map Turtle',
        'Musk Turtle', 'Reeves\'s Turtle', 'Snapping Turtle', 'Softshell Turtle', 'Other'
    ],
    Snake: [
        'Ball Python', 'Corn Snake', 'King Snake', 'Boa Constrictor', 'Garter Snake',
        'Milk Snake', 'Hognose Snake', 'Green Tree Python', 'Rosy Boa', 'Other'
    ],
    Lizard: [
        'Leopard Gecko', 'Bearded Dragon', 'Crested Gecko', 'Blue-Tongued Skink', 'Iguana',
        'Chameleon', 'Monitor Lizard', 'Anole', 'Uromastyx', 'Other'
    ],
    Ferret: [
        'Sable', 'Albino', 'Cinnamon', 'Dark-Eyed White', 'Blaze',
        'Panda', 'Silver', 'Champagne', 'Chocolate', 'Other'
    ],
    Mouse: [
        'Fancy Mouse', 'House Mouse', 'Deer Mouse', // Often differentiated by color/coat too
        'Satin Mouse', 'Rex Mouse', 'Hairless Mouse', 'Other'
    ],
    Rat: [
        'Fancy Rat (Dumbo)', 'Fancy Rat (Standard Ear)', 'Norway Rat (Wild Type)', // Often differentiated by color/markings
        'Hooded Rat', 'Berkshire Rat', 'Rex Rat', 'Hairless Rat', 'Other'
    ],
    Chinchilla: [ // Primarily color mutations
        'Standard Gray', 'Beige', 'White (Wilson White/Pink White)', 'Ebony (Heterozygous/Homozygous)',
        'Violet', 'Sapphire', 'Black Velvet', 'Tan', 'Blue Diamond', 'Other'
    ],
    Hedgehog: [ // African Pygmy is the most common type by far
        'African Pygmy Hedgehog', 'Algerian Hedgehog', 'Egyptian Long-Eared Hedgehog', 'Indian Long-Eared Hedgehog', 'Other'
    ],
    'Sugar Glider': [ // Mostly color morphs
        'Classic (Standard Grey)', 'White-Face Blonde', 'Leucistic (True Platinum)', 'Albino', 'Mosaic',
        'Platinum', 'Creamino', 'Black Beauty', 'Red Series', 'Other'
    ],
    Chicken: [
        'Rhode Island Red', 'Leghorn (White)', 'Plymouth Rock (Barred)', 'Orpington (Buff)', 'Silkie',
        'Wyandotte', 'Brahma', 'Cochin', 'Australorp', 'Sussex', 'Other'
    ],
    Duck: [
        'Pekin', 'Mallard', 'Rouen', 'Khaki Campbell', 'Indian Runner',
        'Muscovy', 'Cayuga', 'Call Duck', 'Swedish Blue', 'Other'
    ]
};
// Note: The species 'Other' from COMMON_PET_SPECIES will default to ['N/A', 'Other'] for breeds
// via the getBreedsForSpecies function, which is desired.

const getBreedsForSpecies = (species: string): string[] => {
    return SPECIES_BREEDS[species] || ['N/A', 'Other'];
};

const PetFormScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ petToEdit?: string; originalPetId?: string }>();

    const [formData, setFormData] = useState<PetFormData>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPetId, setEditingPetId] = useState<string | null>(null);

    const [speciesMenuVisible, setSpeciesMenuVisible] = useState(false);
    const openSpeciesMenu = () => setSpeciesMenuVisible(true);
    const closeSpeciesMenu = () => setSpeciesMenuVisible(false);

    const [breedMenuVisible, setBreedMenuVisible] = useState(false);
    const openBreedMenu = () => formData.species && setBreedMenuVisible(true);
    const closeBreedMenu = () => setBreedMenuVisible(false);

    const [availableBreeds, setAvailableBreeds] = useState<string[]>(['N/A', 'Other']);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
    }, []);

    useEffect(() => {
        if (params.petToEdit) {
            try {
                const petDataFromParams = JSON.parse(params.petToEdit) as PetFormData & { id: string; activities?: string; needs?: string; energyLevel?: string | number; comfortLevel?: string | number };

                let combinedActivitiesNeeds = '';
                if (petDataFromParams.activitiesAndNeeds) {
                    combinedActivitiesNeeds = petDataFromParams.activitiesAndNeeds;
                } else {
                    const activitiesPart = petDataFromParams.activities || '';
                    const needsPart = petDataFromParams.needs || '';
                    if (activitiesPart && needsPart) {
                        combinedActivitiesNeeds = `${activitiesPart}\n\nNeeds: ${needsPart}`;
                    } else {
                        combinedActivitiesNeeds = activitiesPart || needsPart;
                    }
                }

                // Handle potential string values from older data for sliders, defaulting to 5
                const energyLevel = typeof petDataFromParams.energyLevel === 'number' ? petDataFromParams.energyLevel : (parseInt(String(petDataFromParams.energyLevel), 10) || 5);
                const comfortLevel = typeof petDataFromParams.comfortLevel === 'number' ? petDataFromParams.comfortLevel : (parseInt(String(petDataFromParams.comfortLevel), 10) || 5);

                setFormData({
                    name: petDataFromParams.name || '',
                    species: petDataFromParams.species || '',
                    breed: petDataFromParams.breed || '',
                    age: petDataFromParams.age || '',
                    personality: petDataFromParams.personality || '',
                    activitiesAndNeeds: combinedActivitiesNeeds,
                    energyLevel: energyLevel,
                    comfortLevel: comfortLevel,
                    photo1Url: petDataFromParams.photo1Url || '',
                    photo2Url: petDataFromParams.photo2Url || '',
                    photo3Url: petDataFromParams.photo3Url || '',
                });
                setIsEditing(true);
                setEditingPetId(petDataFromParams.id);
                if (petDataFromParams.species) {
                    setAvailableBreeds(getBreedsForSpecies(petDataFromParams.species));
                }
            } catch (e) {
                console.error("Failed to parse pet data for editing:", e);
                Alert.alert("Error", "Could not load pet data for editing.");
                router.back();
            }
        } else {
            setFormData(initialFormState);
            setIsEditing(false);
            setEditingPetId(null);
            setAvailableBreeds(['N/A', 'Other']);
        }
    }, [params.petToEdit]);

    const handleChange = (field: keyof PetFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleChoosePhoto = async (photoSlot: 'photo1Url' | 'photo2Url' | 'photo3Url') => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5, // Compress image slightly
        });

        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            setFormData(prev => ({ ...prev, [photoSlot]: pickerResult.assets[0].uri }));
        }
    };

    const handleSpeciesSelect = (selectedSpecies: string) => {
        setFormData(prev => ({
            ...prev,
            species: selectedSpecies,
            breed: ''
        }));
        setAvailableBreeds(getBreedsForSpecies(selectedSpecies));
        closeSpeciesMenu();
    };

    const handleBreedSelect = (selectedBreed: string) => {
        setFormData(prev => ({ ...prev, breed: selectedBreed }));
        closeBreedMenu();
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            Alert.alert("Validation Error", "Pet name is required.");
            return;
        }
        if (!formData.species) {
            Alert.alert("Validation Error", "Please select a species.");
            return;
        }
        if (availableBreeds.length > 2 && !formData.breed && SPECIES_BREEDS[formData.species]) {
            Alert.alert("Validation Error", "Please select a breed.");
            return;
        }
        if (!formData.age.trim() || isNaN(Number(formData.age)) || Number(formData.age) < 0) {
            Alert.alert("Validation Error", "Please enter a valid age (must be a non-negative number).");
            return;
        }
        // Slider values are numbers, no specific validation needed here beyond type if already handled by component

        if (isEditing && editingPetId) {
            router.push({
                pathname: '/onboarding/pet-owner/add-pets',
                params: { updatedPetData: JSON.stringify(formData), petId: editingPetId, action: 'edit' },
            });
        } else {
            router.push({
                pathname: '/onboarding/pet-owner/add-pets',
                params: { newPetData: JSON.stringify(formData), action: 'add' },
            });
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const renderImageUploadBox = (photoSlot: 'photo1Url' | 'photo2Url' | 'photo3Url', additionalStyle?: any) => {
        const imageUri = formData[photoSlot];
        return (
            <TouchableOpacity onPress={() => handleChoosePhoto(photoSlot)} style={[styles.imageUploadBox, additionalStyle]}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <PlusCircle size={40} color="#cccccc" />
                        <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <PaperProvider theme={MD3LightTheme}>
            <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.pageTitle}>{isEditing ? 'Edit Pet' : 'Add New Pet'}</Text>

                <PaperTextInput label="Name *" value={formData.name} onChangeText={(t) => handleChange('name', t)} style={styles.input} mode="outlined" />

                <Menu
                    visible={speciesMenuVisible}
                    onDismiss={closeSpeciesMenu}
                    anchor={
                        <TouchableOpacity onPress={openSpeciesMenu}>
                            <PaperTextInput
                                label="Species *"
                                value={formData.species}
                                style={styles.input}
                                editable={false}
                                right={<PaperTextInput.Icon icon="menu-down" onPress={openSpeciesMenu} />}
                                mode="outlined"
                            />
                        </TouchableOpacity>
                    }
                >
                    <ScrollView style={{ maxHeight: 200 }}>
                        {COMMON_PET_SPECIES.map((specie) => (
                            <Menu.Item key={specie} onPress={() => handleSpeciesSelect(specie)} title={specie} />
                        ))}
                    </ScrollView>
                </Menu>

                <Menu
                    visible={breedMenuVisible}
                    onDismiss={closeBreedMenu}
                    anchor={
                        <TouchableOpacity onPress={openBreedMenu} disabled={!formData.species}>
                            <PaperTextInput
                                label="Breed *"
                                value={formData.breed}
                                style={styles.input}
                                editable={false}
                                disabled={!formData.species}
                                right={<PaperTextInput.Icon icon="menu-down" onPress={openBreedMenu} />}
                                mode="outlined"
                            />
                        </TouchableOpacity>
                    }
                >
                    <ScrollView style={{ maxHeight: 200 }}>
                        {availableBreeds.map((breedOption) => (
                            <Menu.Item key={breedOption} onPress={() => handleBreedSelect(breedOption)} title={breedOption} />
                        ))}
                    </ScrollView>
                </Menu>

                <PaperTextInput
                    label="Age (years) *"
                    value={formData.age}
                    onChangeText={(t) => handleChange('age', t)}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                />
                <PaperTextInput
                    label="Personality"
                    value={formData.personality}
                    onChangeText={(t) => handleChange('personality', t)}
                    style={styles.input}
                    multiline
                    numberOfLines={5}
                    mode="outlined"
                />
                <PaperTextInput
                    label="Favorite Activities & Needs"
                    value={formData.activitiesAndNeeds}
                    onChangeText={(t) => handleChange('activitiesAndNeeds', t)}
                    style={styles.input}
                    multiline
                    numberOfLines={6}
                    mode="outlined"
                />

                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Energy Level: {formData.energyLevel}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={formData.energyLevel}
                        onValueChange={(value) => handleChange('energyLevel', value)}
                        minimumTrackTintColor="#1FB2A6"
                        maximumTrackTintColor="#d3d3d3"
                        thumbTintColor="#1FB2A6"
                    />
                </View>

                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Comfort Level: {formData.comfortLevel}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={formData.comfortLevel}
                        onValueChange={(value) => handleChange('comfortLevel', value)}
                        minimumTrackTintColor="#1FB2A6"
                        maximumTrackTintColor="#d3d3d3"
                        thumbTintColor="#1FB2A6"
                    />
                </View>

                <Text style={styles.photoSectionTitle}>Pet Photos</Text>
                <View style={styles.imageGridContainer}>
                    <View style={styles.imageMainColumn}>
                        {renderImageUploadBox('photo1Url')}
                    </View>
                    <View style={styles.imageSecondaryColumn}>
                        {renderImageUploadBox('photo2Url', styles.imageSecondaryBoxTop)}
                        {renderImageUploadBox('photo3Url')}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button title="Cancel" onPress={handleCancel} color="#FF3B30" />
                    <Button title={isEditing ? 'Save Changes' : 'Add Pet'} onPress={handleSubmit} />
                </View>
            </ScrollView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        marginBottom: 20,
    },
    sliderContainer: {
        marginBottom: 20,
    },
    sliderLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    photoSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 0,
        marginBottom: 15,
    },
    imageGridContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        height: 220,
    },
    imageMainColumn: {
        flex: 2,
        marginRight: 10,
    },
    imageSecondaryColumn: {
        flex: 1,
        flexDirection: 'column',
        gap: 10,
    },
    imageUploadBox: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: 1,
    },
    imageSecondaryBoxTop: {
        marginBottom: 0,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#888',
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
    },
});

export default PetFormScreen; 