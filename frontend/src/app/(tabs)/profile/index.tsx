import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Title, Divider } from 'react-native-paper';
import { UserCircle, MapPin, Mail, Edit3, PlusCircle, LogOut, Award, CheckCircle, DollarSign, PawPrint } from 'lucide-react-native';
import { colors } from '../../../theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';

const ProfileScreen: React.FC = () => {
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || !token) return;
            try {
                setLoading(true);
                const res = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (e) {
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, token]);

    const handleEditProfile = () => {
        router.push({
            pathname: '/(tabs)/profile/edit-profile',
            params: { userData: JSON.stringify(profile) },
        });
    };

    const handleLogout = () => {
        router.replace('/login');
    };

    const handleAddPet = () => {
        router.push('/(tabs)/profile/add-pet');
    };

    if (loading || !profile) {
        return (
            <PaperProvider>
                <SafeAreaView style={styles.safeArea}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ marginTop: 16, color: colors.primary, fontWeight: 'bold' }}>Loading profile...</Text>
                    </View>
                </SafeAreaView>
            </PaperProvider>
        );
    }

    const roleInfo = profile.roleInfo || {};
    const pets = profile.pets || [];
    const profilePictureUrl = profile.profilePictureUrl || 'https://placehold.co/600x400?text=Owner';

    return (
        <PaperProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.container}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileImageContainer}>
                            {profilePictureUrl ? (
                                <Image source={{ uri: profilePictureUrl }} style={styles.profileImage} />
                            ) : (
                                <UserCircle size={120} color={colors.primary} />
                            )}
                        </View>
                        <Title style={styles.userName}>{profile.name}</Title>
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
                            <Text style={styles.infoText}>{profile.email}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.infoItem}>
                            <MapPin size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>{`${profile.street}, ${profile.city}, ${profile.postcode}`}</Text>
                        </View>
                    </View>

                    {/* Subscription Section */}
                    <View style={styles.subscriptionSection}>
                        <Title style={styles.sectionTitle}>Subscription</Title>
                        <View style={styles.infoItem}>
                            <Award size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Subscription: {roleInfo.subscription_name || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <CheckCircle size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Ad Free: {roleInfo.is_ad_free ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <CheckCircle size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Extended: {roleInfo.extended ? 'Yes' : 'No'}</Text>
                        </View>
                        <Divider style={styles.divider} />
                    </View>

                    {/* Pets Section */}
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
                                    <View style={styles.petCard}>
                                        <View style={styles.petCardHeader}>
                                            <Image source={{ uri: 'https://placecats.com/300/200' }} style={styles.petImage} />
                                            <View style={{ marginLeft: 12, flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.petName}>{item.name}</Text>
                                                {item.breed ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                        <PawPrint size={16} color={'#27ae60'} style={{ marginRight: 4 }} />
                                                        <Text style={styles.petBreed}>{item.breed}</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </View>
                                    </View>
                                )}
                                keyExtractor={(item) => String(item.id)}
                                scrollEnabled={false}
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
    subscriptionSection: {
        backgroundColor: '#fff',
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 12,
    },
    petCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        paddingVertical: 6,
        paddingHorizontal: 6,
        minHeight: 0,
    },
    petCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingBottom: 6,
    },
    petImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    petName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
    },
    petBreed: {
        fontSize: 14,
        color: '#27ae60',
        fontWeight: '500',
    },
    petDetails: {
        fontSize: 14,
        color: colors.textLight,
    },
});

export default ProfileScreen; 