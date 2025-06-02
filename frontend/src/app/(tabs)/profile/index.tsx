import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Title, Paragraph, Divider } from 'react-native-paper';
import { UserCircle, MapPin, Mail, Edit3, PlusCircle, LogOut } from 'lucide-react-native';
import PetListItem, { PetProfileItem } from '../../../components/profile/PetListItem';
import { colors } from '../../../theme';
import { useRouter } from 'expo-router';

// Placeholder data for user
const DUMMY_USER = {
    profilePictureUrl: 'https://placehold.co/600x400', // Replace with actual image URI or null
    name: "Catherine 'Cat' Owner",
    email: 'cat.owner@example.com',
    address: '123 Kitten Street',
    city: 'Meowville',
    postcode: 'MV123',
};

// Placeholder data for pets
const DUMMY_PETS: PetProfileItem[] = [
    {
        id: 'pet1',
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Siamese',
        age: 3,
        profilePictureUrl: 'https://placecats.com/300/200',
    },
    {
        id: 'pet2',
        name: 'Shadow',
        species: 'Dog',
        breed: 'Labrador',
        age: 5,
        profilePictureUrl: 'https://placedog.net/100/100',
    },
    {
        id: 'pet3',
        name: 'Goldie',
        species: 'Fish',
        breed: 'Goldfish',
        age: 1,
        // No profile picture for fishy
    },
];

const ProfileScreen: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState(DUMMY_USER);
    const [pets, setPets] = useState<PetProfileItem[]>(DUMMY_PETS);

    const handleEditProfile = () => {
        // console.log('Edit profile clicked');
        // Navigate to edit profile screen or open modal
        router.push({
            pathname: '/(tabs)/profile/edit-profile',
            params: { userData: JSON.stringify(user) }, // Pass current user data
        });
    };

    const handleLogout = () => {
        // Implement your logout logic here
        // For example, navigate to the login screen
        router.replace('/login'); // Or your login route
        console.log("User logged out");
    };

    const handleAddPet = () => {
        router.push('/(tabs)/profile/add-pet');
    };

    const handleEditPet = (petId: string) => {
        console.log(`Edit pet clicked: ${petId}`);
        // Navigate to edit pet screen or open modal, passing petId
    };

    const handleDeletePet = (petId: string) => {
        console.log(`Delete pet clicked: ${petId}`);
        setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
        // Call API to delete pet
    };

    return (
        <PaperProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.container}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileImageContainer}>
                            {user.profilePictureUrl ? (
                                <Image source={{ uri: user.profilePictureUrl }} style={styles.profileImage} />
                            ) : (
                                <UserCircle size={120} color={colors.primary} />
                            )}
                        </View>
                        <Title style={styles.userName}>{user.name}</Title>
                        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                            <Edit3 size={18} color={colors.primary} />
                            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.editProfileButton, styles.logoutButton]} onPress={handleLogout}>
                            <LogOut size={18} color={colors.danger} />
                            <Text style={[styles.editProfileButtonText, styles.logoutButtonText]}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfoSection}>
                        <View style={styles.infoItem}>
                            <Mail size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>{user.email}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.infoItem}>
                            <MapPin size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>{`${user.address}, ${user.city}, ${user.postcode}`}</Text>
                        </View>
                    </View>

                    <View style={styles.petsSection}>
                        <View style={styles.petsHeaderContainer}>
                            <Title style={styles.petsTitle}>Your Pets</Title>
                            <TouchableOpacity style={styles.addPetButton} onPress={handleAddPet}>
                                <PlusCircle size={22} color={colors.primary} />
                                <Text style={styles.addPetButtonText}>Add Pet</Text>
                            </TouchableOpacity>
                        </View>
                        {pets.length > 0 ? (
                            <FlatList
                                data={pets}
                                renderItem={({ item }) => (
                                    <PetListItem
                                        pet={item}
                                        onEdit={handleEditPet}
                                        onDelete={handleDeletePet}
                                    />
                                )}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false} // To ensure ScrollView handles scrolling
                                contentContainerStyle={styles.petsListContainer}
                            />
                        ) : (
                            <Text style={styles.noPetsText}>You haven't added any pets yet.</Text>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 8,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.primary + '20', // Primary color with some transparency
    },
    editProfileButtonText: {
        marginLeft: 6,
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: colors.danger + '20',
        marginTop: 10, // Add some space above the logout button
    },
    logoutButtonText: {
        color: colors.danger,
    },
    userInfoSection: {
        backgroundColor: '#fff',
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoIcon: {
        marginRight: 12,
    },
    infoText: {
        fontSize: 15,
        color: colors.textDark,
        flexShrink: 1, // Allow text to wrap
    },
    divider: {
        marginVertical: 4,
    },
    petsSection: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 20, // Add some padding at the bottom
    },
    petsHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 12,
    },
    petsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    addPetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.primary + '20',
        borderRadius: 20,
    },
    addPetButtonText: {
        marginLeft: 6,
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    petsListContainer: {
        // No specific styles needed here for now
    },
    noPetsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: colors.textLight,
    },
});

export default ProfileScreen; 