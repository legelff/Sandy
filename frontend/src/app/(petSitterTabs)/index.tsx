import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { Heart, Users, Star, Clock } from 'lucide-react-native';

interface Pet {
    name: string;
    species: string;
    owner_id?: number;
    last_bpm?: number | null;
    rating?: number;
    status?: string;
}

interface SitterHomeData {
    name: string;
    subscription: string;
    pets: {
        active: Pet[];
        history: Pet[];
    };
}

/**
 * PetSitterHomeScreen displays the main dashboard for pet sitters.
 * It shows pets currently in their care and their pet sitting history.
 */
const PetSitterHomeScreen: React.FC = () => {
    const { user, token } = useAuthStore();
    const [homeData, setHomeData] = useState<SitterHomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHomeData = async () => {
        if (!user || !token) return;
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/home/sitter?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch home data');
            const data = await response.json();
            console.log('Sitter dashboard response:', data);
            setHomeData(data);
        } catch (err) {
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
    if (error || !homeData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'No data available'}</Text>
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
                        <Text style={styles.sectionTitle}>Pets Currently In My Care</Text>
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
                                <View style={styles.statusRowLeft}>
                                    <Heart size={16} color={colors.primary} />
                                    <Text style={styles.statusText}> {pet.status?.charAt(0).toUpperCase() + pet.status?.slice(1)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Clock size={48} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>No pets currently in care</Text>
                            <Text style={styles.emptySubText}>You'll see pets here when you have active bookings</Text>
                        </View>
                    )}
                </View>

                {/* Section: Pet Sitting History */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Star size={24} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Pet Sitting History</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{homeData.pets.history.length}</Text>
                        </View>
                    </View>
                    {homeData.pets.history.length > 0 ? (
                        homeData.pets.history.map((pet, index) => (
                            <View key={index} style={styles.petCard}>
                                <View style={styles.petCardHeader}>
                                    <Text style={styles.petName}>{pet.name}</Text>
                                    <View style={styles.speciesBadge}>
                                        <Text style={styles.speciesText}>{pet.species}</Text>
                                    </View>
                                </View>
                                <View style={styles.statusRowLeft}>
                                    <Star size={16} color={colors.primary} />
                                    <Text style={styles.statusText}> {pet.status?.charAt(0).toUpperCase() + pet.status?.slice(1)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Users size={48} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>No pet sitting history</Text>
                            <Text style={styles.emptySubText}>Completed bookings will appear here</Text>
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
        marginLeft: 0,
    },
    sectionContainer: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        paddingBottom: 8,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
    statusRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
    },
});

export default PetSitterHomeScreen; 