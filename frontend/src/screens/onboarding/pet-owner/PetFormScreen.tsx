import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Button,
    ScrollView,
    Platform,
    Alert,
    TouchableOpacity,
    Image,
    Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInput as PaperTextInput, Menu, Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { PlusCircle } from 'lucide-react-native';
import { colors, spacing } from '../../../theme';
import { useOnboardingStore, Pet } from '../../../store/onboardingStore';

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
    vaccinations: boolean;
    sterilized: boolean;
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
    vaccinations: false,
    sterilized: false,
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
    const params = useLocalSearchParams<{ petToEdit?: string; originalPetId?: string; fromAddPets?: string }>();
    const { addPet, updatePet, pets } = useOnboardingStore();

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
                const petDataFromParams = JSON.parse(params.petToEdit) as PetFormData & { id: string; activities?: string; needs?: string; energyLevel?: string | number; comfortLevel?: string | number; vaccinations?: boolean; sterilized?: boolean };

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
                    vaccinations: petDataFromParams.vaccinations === undefined ? false : petDataFromParams.vaccinations,
                    sterilized: petDataFromParams.sterilized === undefined ? false : petDataFromParams.sterilized,
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

    const handleChange = (field: keyof PetFormData, value: string | number | boolean) => {
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
        if (!formData.name || !formData.species) {
            Alert.alert('Missing Information', 'Please fill in at least the pet\'s name and species.');
            return;
        }

        const petData: Pet = {
            ...formData,
            id: isEditing && editingPetId ? editingPetId : `pet_${Date.now()}`,
        };

        if (isEditing) {
            updatePet(petData);
            console.log('Pet updated in store:', petData);
        } else {
            addPet(petData);
            console.log('Pet added to store (first pet flow):', petData);
        }

        if (params.fromAddPets) {
            console.log('Navigating from PetFormScreen back to /onboarding/pet-owner/add-pets (replace)');
            router.replace('/onboarding/pet-owner/add-pets');
        } else {
            console.log('Navigating from PetFormScreen to /onboarding/pet-owner/add-pets (push)');
            router.push('/onboarding/pet-owner/add-pets');
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const renderImageUploadBox = (photoSlot: 'photo1Url' | 'photo2Url' | 'photo3Url', additionalStyle?: any) => {
        const imageUri = formData[photoSlot];
        return (
            <TouchableOpacity
                className="w-24 h-24 border border-dashed border-gray-400 rounded-md items-center justify-center bg-gray-100 m-1"
                onPress={() => handleChoosePhoto(photoSlot)}
            >
                {imageUri ? (
                    <Image source={{ uri: imageUri }} className="w-full h-full rounded-md" />
                ) : (
                    <PlusCircle size={32} color={colors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <PaperProvider theme={MD3LightTheme}>
            <ScrollView className="bg-background" contentContainerStyle={{ paddingBottom: spacing.lg }}>
                <View className="p-md mt-8">
                    <Text className="text-2xl font-bold mb-md text-center text-text-dark">
                        {isEditing ? 'Edit Pet Details' : 'Tell us about your Pet'}
                    </Text>

                    <View className="flex-row justify-around mb-md">
                        {renderImageUploadBox('photo1Url')}
                        {renderImageUploadBox('photo2Url')}
                        {renderImageUploadBox('photo3Url')}
                    </View>

                    <PaperTextInput
                        label="Pet's Name"
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        style={{ marginBottom: spacing.md }}
                        mode="outlined"
                        theme={{ colors: { primary: colors.primary } }}
                    />

                    <Menu
                        visible={speciesMenuVisible}
                        onDismiss={closeSpeciesMenu}
                        anchor={
                            <TouchableOpacity onPress={openSpeciesMenu} className="border border-gray-400 p-4 rounded-md bg-white flex-row justify-between items-center">
                                <Text className={formData.species ? "text-text-dark" : "text-gray-500"}>{formData.species || "Select Pet Species"}</Text>
                                <Text className="text-text-dark">{'>'}</Text>
                            </TouchableOpacity>
                        }>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {COMMON_PET_SPECIES.map((item) => (
                                <Menu.Item key={item} onPress={() => handleSpeciesSelect(item)} title={item} />
                            ))}
                        </ScrollView>
                    </Menu>

                    <Menu
                        visible={breedMenuVisible && !!formData.species}
                        onDismiss={closeBreedMenu}
                        anchor={
                            <TouchableOpacity onPress={openBreedMenu} className="border border-gray-400 p-4 rounded-md mt-md bg-white flex-row justify-between items-center" disabled={!formData.species}>
                                <Text className={formData.breed ? "text-text-dark" : "text-gray-500"}>{formData.breed || "Select Pet Breed"}</Text>
                                <Text className="text-text-dark">{'>'}</Text>
                            </TouchableOpacity>
                        }>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {availableBreeds.map((item) => (
                                <Menu.Item key={item} onPress={() => handleBreedSelect(item)} title={item} />
                            ))}
                        </ScrollView>
                    </Menu>

                    <PaperTextInput
                        label="Age (e.g., 2 years, 6 months)"
                        value={formData.age}
                        onChangeText={(text) => handleChange('age', text)}
                        style={{ marginTop: spacing.md, marginBottom: spacing.md }}
                        mode="outlined"
                        theme={{ colors: { primary: colors.primary } }}
                    />

                    <PaperTextInput
                        label="Personality (e.g., playful, calm, shy)"
                        value={formData.personality}
                        onChangeText={(text) => handleChange('personality', text)}
                        style={{ marginBottom: spacing.md }}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        theme={{ colors: { primary: colors.primary } }}
                    />

                    <PaperTextInput
                        label="Favorite Activities & Special Needs"
                        value={formData.activitiesAndNeeds}
                        onChangeText={(text) => handleChange('activitiesAndNeeds', text)}
                        style={{ marginBottom: spacing.md }}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        theme={{ colors: { primary: colors.primary } }}
                    />

                    <View className="mb-md">
                        <Text className="text-base text-text-dark">
                            Energy Level: {formData.energyLevel}/10
                        </Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={10}
                            step={1}
                            value={formData.energyLevel}
                            onValueChange={(val) => handleChange('energyLevel', val)}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor={colors.primary}
                        />
                    </View>

                    <View className="mb-md">
                        <Text className="text-base text-text-dark">
                            Comfort Level with Strangers: {formData.comfortLevel}/10
                        </Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={10}
                            step={1}
                            value={formData.comfortLevel}
                            onValueChange={(val) => handleChange('comfortLevel', val)}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor={colors.primary}
                        />
                    </View>

                    {/* Vaccination Switch */}
                    <View className="flex-row justify-between items-center mb-md p-2.5 bg-white rounded-md border border-gray-200">
                        <Text className="text-base text-text-dark">Vaccinated</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={formData.vaccinations ? colors.primary : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(val) => handleChange('vaccinations', val)}
                            value={formData.vaccinations}
                        />
                    </View>

                    {/* Sterilization Switch */}
                    <View className="flex-row justify-between items-center mb-lg p-2.5 bg-white rounded-md border border-gray-200">
                        <Text className="text-base text-text-dark">Sterilized</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={formData.sterilized ? colors.primary : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(val) => handleChange('sterilized', val)}
                            value={formData.sterilized}
                        />
                    </View>

                    <View className="mt-md">
                        <Button title={isEditing ? "Save Changes" : "Add Pet"} onPress={handleSubmit} color={colors.primary} />
                    </View>
                    <View className="mt-md">
                        <Button title="Cancel" onPress={handleCancel} color={colors.primary} />
                    </View>
                </View>
            </ScrollView>
        </PaperProvider>
    );
};

export default PetFormScreen; 