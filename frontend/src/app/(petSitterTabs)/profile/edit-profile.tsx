import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Button,
    StyleSheet,
    Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInput as PaperTextInput, Provider as PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { UserCircle, Camera } from 'lucide-react-native';
import { colors, spacing } from '../../../theme';

// Interface for sitter profile data (can be extended)
interface SitterProfileData {
    profilePictureUrl?: string | null;
    name: string;
    email: string; // Email is read-only
    address: string;
    city: string;
    postcode: string;
    // Sitter specific fields that can be edited (add as needed)
    bio?: string;
    serviceArea?: string;
    experienceLevel?: string;
    // services?: string[]; // Editing arrays might need a more complex UI
}

const PetSitterEditProfileScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ userData?: string }>();
    const [formData, setFormData] = useState<SitterProfileData | null>(null);
    const [initialEmail, setInitialEmail] = useState('');

    useEffect(() => {
        if (Platform.OS !== 'web') {
            ImagePicker.requestMediaLibraryPermissionsAsync();
        }
    }, []);

    useEffect(() => {
        if (params.userData) {
            try {
                const parsedData = JSON.parse(params.userData) as SitterProfileData;
                setFormData(parsedData);
                setInitialEmail(parsedData.email);
            } catch (error) {
                console.error("Failed to parse sitter data for editing:", error);
                Alert.alert("Error", "Could not load sitter data.");
                router.back();
            }
        } else {
            Alert.alert("Error", "No sitter data provided.");
            router.back();
        }
    }, [params.userData]);

    const handleInputChange = (field: keyof Omit<SitterProfileData, 'email'>, value: string) => {
        if (formData) {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleChoosePhoto = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Denied", "You\'ve refused to allow this app to access your photos!");
            return;
        }
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0 && formData) {
            setFormData({ ...formData, profilePictureUrl: pickerResult.assets[0].uri });
        }
    };

    const handleSubmit = () => {
        if (!formData) return;
        if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim() || !formData.postcode.trim() || !formData.bio?.trim() || !formData.serviceArea?.trim() || !formData.experienceLevel?.trim()) {
            Alert.alert("Validation Error", "All fields must be filled.");
            return;
        }
        console.log("Updated sitter profile data:", formData);
        // TODO: Implement API call to update sitter profile
        Alert.alert("Profile Updated", "Your profile has been successfully updated.", [
            { text: "OK", onPress: () => router.replace('/(petSitterTabs)/profile/') } // Use replace to refresh profile page
        ]);
    };

    if (!formData) {
        return (
            <PaperProvider theme={MD3LightTheme}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true} color={colors.primary} size="large" />
                </View>
            </PaperProvider>
        );
    }

    return (
        <PaperProvider theme={MD3LightTheme}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.imagePickerContainer}>
                    <TouchableOpacity onPress={handleChoosePhoto} style={styles.profileImageWrapper}>
                        {formData.profilePictureUrl ? (
                            <Image source={{ uri: formData.profilePictureUrl }} style={styles.profileImage} />
                        ) : (
                            <UserCircle size={120} color={colors.primary} />
                        )}
                        <View style={styles.cameraIconContainer}>
                            <Camera size={24} color={colors.background} />
                        </View>
                    </TouchableOpacity>
                </View>

                <PaperTextInput
                    label="Name"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="Email"
                    value={initialEmail}
                    editable={false}
                    style={[styles.input, styles.disabledInput]}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="Street Address"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="City"
                    value={formData.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="Postcode"
                    value={formData.postcode}
                    onChangeText={(text) => handleInputChange('postcode', text)}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="Bio"
                    value={formData.bio || ''}
                    onChangeText={(text) => handleInputChange('bio', text)}
                    style={styles.input}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="Service Area (e.g., City, 10km radius)"
                    value={formData.serviceArea || ''}
                    onChangeText={(text) => handleInputChange('serviceArea', text)}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />
                <PaperTextInput
                    label="Experience Level (e.g., Beginner, 2+ years)"
                    value={formData.experienceLevel || ''}
                    onChangeText={(text) => handleInputChange('experienceLevel', text)}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: colors.primary } }}
                />

                <View style={styles.buttonContainer}>
                    <Button title="Save Changes" onPress={handleSubmit} color={colors.primary} />
                </View>
                <View style={[styles.buttonContainer, { marginTop: spacing.sm }]}>
                    <Button title="Cancel" onPress={() => router.back()} color={colors.textSecondary} />
                </View>
            </ScrollView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.md,
        paddingBottom: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    profileImageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: spacing.xs,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: colors.background,
    },
    input: {
        marginBottom: spacing.md,
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
    },
    buttonContainer: {
        marginTop: spacing.md,
    },
});

export default PetSitterEditProfileScreen; 