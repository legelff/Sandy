import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme'; // Adjusted import path
import { useAuthStore } from '../../store/useAuthStore';
import { Home, Heart, Clock, CheckCircle, Star, Users, Calendar } from 'lucide-react-native';

interface Pet {
    id?: number;
    name: string;
    species: string;
    sitter_id?: number;
    last_bpm?: number | null;
    owner_id?: number;
    rating?: number;
}

interface HomeData {
    name: string;
    subscription: string;
    pets: {
        active: Pet[];
        requested: Pet[];
        inactive: Pet[];
        history?: Pet[];
    };
}

/**
 * HomeScreen (formerly DashboardScreen) displays the main dashboard for the user.
 * It shows different sections based on the user type (Pet Owner or Pet Sitter).
 * For Pet Owners: Pets currently in care, Inactive pets, Sent care requests.
 * For Pet Sitters: Active pets, Historical pets with ratings.
 */
const HomeScreen: React.FC = () => {
    const { user, token } = useAuthStore();
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHomeData = async () => {
        if (!user || !token) return;

        try {
            setLoading(true);
            setError(null);

            // Determine if user is owner or sitter based on role
            const endpoint = user.role === 'sitter' ? '/sitter' : '';
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/home${endpoint}?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch home data');
            }

            const data = await response.json();
            setHomeData(data);
        } catch (err) {
            console.error('Error fetching home data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, [user, token]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading your dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!homeData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No data available</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerContent}>
                        <Text style={styles.header}>Welcome back, {homeData.name.split(' ')[0]}!</Text>
                    </View>
                </View>

                {/* Section: Pets currently in care by sitter */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Heart size={24} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Pets Currently In Care</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{homeData.pets.active.length}</Text>
                        </View>
                    </View>
                    {homeData.pets.active.length > 0 ? (
                        homeData.pets.active.map((pet, index) => (
                            <View key={index} style={styles.petCard}>
                                <View style={styles.petCardHeader}>
                                    <Text style={styles.petName}>{pet.name}</Text>
                                    <View style={styles.speciesBadge}>
                                        <Text style={styles.speciesText}>{pet.species}</Text>
                                    </View>
                                </View>
                                <View style={styles.petCardDetails}>
                                    <Text style={styles.petDetails}>Sitter ID: {pet.sitter_id}</Text>
                                    {pet.last_bpm && (
                                        <Text style={styles.petDetails}>Last BPM: {pet.last_bpm}</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No pets currently in care</Text>
                            <Text style={styles.emptySubText}>Your pets will appear here when they're with a sitter</Text>
                        </View>
                    )}
                </View>

                {/* Section: Inactive pets */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Users size={24} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Inactive Pets</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{homeData.pets.inactive.length}</Text>
                        </View>
                    </View>
                    {homeData.pets.inactive.length > 0 ? (
                        homeData.pets.inactive.map((pet, index) => (
                            <View key={index} style={styles.petCard}>
                                <View style={styles.petCardHeader}>
                                    <Text style={styles.petName}>{pet.name}</Text>
                                    <View style={styles.speciesBadge}>
                                        <Text style={styles.speciesText}>{pet.species}</Text>
                                    </View>
                                </View>
                                <View style={styles.statusContainer}>
                                    <Clock size={16} color={colors.primary} />
                                    <Text style={styles.statusText}> Inactive</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Users size={48} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>No inactive pets</Text>
                            <Text style={styles.emptySubText}>All your pets are currently active</Text>
                        </View>
                    )}
                </View>

                {/* Section: Sent pet care requests */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Calendar size={24} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Sent Pet Care Requests</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{homeData.pets.requested.length}</Text>
                        </View>
                    </View>
                    {homeData.pets.requested.length > 0 ? (
                        homeData.pets.requested.map((pet, index) => (
                            <View key={index} style={styles.petCard}>
                                <View style={styles.petCardHeader}>
                                    <Text style={styles.petName}>{pet.name}</Text>
                                    <View style={styles.speciesBadge}>
                                        <Text style={styles.speciesText}>{pet.species}</Text>
                                    </View>
                                </View>
                                <View style={styles.statusContainer}>
                                    <CheckCircle size={16} color={colors.primary} />
                                    <Text style={styles.statusText}> Requested</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Calendar size={48} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>No pending requests</Text>
                            <Text style={styles.emptySubText}>Your booking requests will appear here</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollViewContent: {
        padding: 20,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: 12,
    },
    subscriptionBadge: {
        backgroundColor: colors.primary,
        padding: 4,
        borderRadius: 4,
        marginLeft: 12,
    },
    subscriptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionContainer: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        paddingBottom: 8,
        // Add shadow for a card-like effect (optional)
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.primary,
        marginLeft: 8,
    },
    countBadge: {
        backgroundColor: colors.primary,
        padding: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginLeft: 'auto',
    },
    countText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    petCard: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
    },
    petCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    petName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    speciesBadge: {
        backgroundColor: colors.primary,
        padding: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginLeft: 4,
        transform: [{ scale: 0.8 }],
    },
    speciesText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    petCardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    petDetails: {
        fontSize: 14,
        color: colors.textDark,
    },
    petRating: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    emptyCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.textDark,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        color: colors.primary,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.danger,
        marginTop: 20,
    },
});

export default HomeScreen; 