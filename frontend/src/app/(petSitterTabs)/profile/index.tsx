import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Title, Divider } from 'react-native-paper';
import { UserCircle, MapPin, Mail, Edit3, ShieldCheck, Award, LogOut, CalendarCheck2, DollarSign, CheckCircle, XCircle, BookOpenCheck } from 'lucide-react-native';
import { colors } from '../../../theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';

const PetSitterProfileScreen: React.FC = () => {
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
            pathname: '/(petSitterTabs)/profile/edit-profile',
            params: { userData: JSON.stringify(profile) },
        });
    };

    const handleLogout = () => {
        router.replace('/login');
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
    const availability = profile.availability || [];
    const isVerified = true; // You can add logic for verification if needed
    const profilePictureUrl = profile.profilePictureUrl || 'https://placehold.co/400x400?text=Sitter';

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
                        {isVerified && (
                            <View style={styles.verifiedBadge}>
                                <ShieldCheck size={16} color={colors.white} />
                                <Text style={styles.verifiedText}>Verified Sitter</Text>
                            </View>
                        )}
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

                    {/* Sitter Subscription & Experience */}
                    <View style={styles.sitterInfoSection}>
                        <Title style={styles.sectionTitle}>Subscription & Experience</Title>
                        <View style={styles.infoItem}>
                            <BookOpenCheck size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Subscription: {roleInfo.subscription_name || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Award size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Experience: {roleInfo.experience_years ? `${roleInfo.experience_years} years` : '-'}</Text>
                        </View>
                        {roleInfo.personality_and_motivation && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoText}>{roleInfo.personality_and_motivation}</Text>
                            </View>
                        )}
                        <Divider style={styles.divider} />
                        <View style={styles.infoItem}>
                            <DollarSign size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Booking Fee: {roleInfo.booking_fee ? `€${roleInfo.booking_fee}` : '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <CheckCircle size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Insurance: {roleInfo.has_insurance ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <CheckCircle size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Training: {roleInfo.has_training ? 'Yes' : 'No'}</Text>
                        </View>
                        <Divider style={styles.divider} />
                    </View>

                    {/* Sitter Availability */}
                    <View style={styles.sitterInfoSection}>
                        <Title style={styles.sectionTitle}>Availability</Title>
                        {availability.length > 0 ? (
                            availability.map((slot: any, idx: number) => (
                                <View key={idx} style={styles.infoItem}>
                                    <CalendarCheck2 size={18} color={colors.primary} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{slot.day_of_week}: {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>No availability set.</Text>
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
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    verifiedText: {
        color: colors.white,
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '600',
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.primary + '20',
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
    sitterInfoSection: {
        backgroundColor: '#fff',
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 12,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        marginTop: 12,
        marginBottom: 8,
    },
    bioText: {
        fontSize: 15,
        color: colors.textDark,
        lineHeight: 22,
    },
    serviceItem: {
        fontSize: 15,
        color: colors.textDark,
        marginBottom: 4,
        marginLeft: 8,
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
        flexShrink: 1,
    },
    divider: {
        marginVertical: 12,
    },
});

export default PetSitterProfileScreen; 