import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Title, Divider } from 'react-native-paper';
import { UserCircle, MapPin, Mail, Edit3, ShieldCheck, Award, LogOut } from 'lucide-react-native'; // Added ShieldCheck, Award for sitter specific info, LogOut for logout
import { colors } from '../../../theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';

// Placeholder data for pet sitter user
const DUMMY_SITTER_USER = {
    profilePictureUrl: 'https://placehold.co/400x400?text=Sitter', // Sitter specific placeholder
    name: "Sam Sitterson",
    email: 'sam.sitter@example.com',
    address: '456 Pet Street',
    city: 'Careville',
    postcode: 'CV456',
    bio: "Experienced and loving pet sitter with 5+ years of experience. I treat every pet like my own! Certified in pet first aid.",
    services: ["Dog Walking", "Overnight Sitting", "Cat Visits"],
    serviceArea: "Careville and surrounding areas (15km radius)",
    experienceLevel: "Expert (5+ years)",
    isVerified: true,
};

/**
 * PetSitterProfileScreen is the main profile screen for pet sitters.
 */
const PetSitterProfileScreen: React.FC = () => {
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [sitter, setSitter] = useState(DUMMY_SITTER_USER);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || !token) return;
            try {
                setLoading(true);
                const res = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/users/profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setSitter(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    address: data.street || prev.address,
                    city: data.city || prev.city,
                    postcode: data.postcode || prev.postcode,
                }));
            } catch (e) {
                // If error, keep placeholder data
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, token]);

    const handleEditProfile = () => {
        router.push({
            pathname: '/(petSitterTabs)/profile/edit-profile', // Updated path
            params: { userData: JSON.stringify(sitter) },
        });
    };

    const handleLogout = () => {
        // Implement your logout logic here
        // For example, navigate to the login screen
        router.replace('/login'); // Or your login route
        console.log("User logged out");
    };

    if (loading) {
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

    return (
        <PaperProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.container}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileImageContainer}>
                            {sitter.profilePictureUrl ? (
                                <Image source={{ uri: sitter.profilePictureUrl }} style={styles.profileImage} />
                            ) : (
                                <UserCircle size={120} color={colors.primary} />
                            )}
                        </View>
                        <Title style={styles.userName}>{sitter.name}</Title>
                        {sitter.isVerified && (
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
                            <Text style={styles.infoText}>{sitter.email}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.infoItem}>
                            <MapPin size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>{`${sitter.address}, ${sitter.city}, ${sitter.postcode}`}</Text>
                        </View>
                    </View>

                    {/* Sitter Specific Information Section */}
                    <View style={styles.sitterInfoSection}>
                        <Title style={styles.sectionTitle}>About Me</Title>
                        <Text style={styles.bioText}>{sitter.bio}</Text>
                        <Divider style={styles.divider} />

                        <Title style={styles.subSectionTitle}>Services Offered</Title>
                        {sitter.services.map((service, index) => (
                            <Text key={index} style={styles.serviceItem}>- {service}</Text>
                        ))}
                        <Divider style={styles.divider} />

                        <Title style={styles.subSectionTitle}>Service Area</Title>
                        <Text style={styles.infoText}>{sitter.serviceArea}</Text>
                        <Divider style={styles.divider} />

                        <View style={styles.infoItem}>
                            <Award size={20} color={colors.textDark} style={styles.infoIcon} />
                            <Text style={styles.infoText}>Experience: {sitter.experienceLevel}</Text>
                        </View>
                    </View>

                    {/* Removed Pets Section */}

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