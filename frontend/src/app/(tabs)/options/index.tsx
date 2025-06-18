import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text as RNText, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, Title } from 'react-native-paper';
import LikedSitterCard, { LikedSitter } from '../../../components/options/LikedSitterCard'; // Adjusted path
import { colors } from '../../../theme'; // Adjusted path
import { useRouter, useFocusEffect } from 'expo-router'; // Added useFocusEffect

import { useAuthStore } from '../../../store/useAuthStore';


const OptionsScreen: React.FC = () => {
    const router = useRouter(); // Initialize router
    const user = useAuthStore((state) => state.user);
    const [likedSitters, setLikedSitters] = useState<LikedSitter[]>([]);

    const fetchLikedSitters = async () => {
        try {
            console.log('User in OptionsScreen:', user);
            const userId = user.id;
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/options?user_id=${userId}&street=Lange%20Ridderstraat%2044&city=Mechelen&postcode=2800`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Fetch failed');

            const mapped: LikedSitter[] = data.saved.map((b: any) => ({
                id: b.save_id.toString(),
                sitterUserId: b.sitter_user_id.toString(),
                sitterName: b.sitter_name,
                distance: `${b.distance} km away`,
                rating: b.average_rating,
                selectedPets: b.selected_pets,
                fromDate: new Date(b.start_date).toLocaleDateString('en-CA'), // Outputs YYYY-MM-DD
                toDate: new Date(b.end_date).toLocaleDateString('en-CA'),

                relevancyScore: b.personality_match_score, // You can change this logic
                servicePackage: b.service_package || 'Basic',
            }));

            setLikedSitters(mapped);
        } catch (err) {
            console.error('❌ Error fetching liked sitters:', err);
        }
    };

    // Refresh data every time the tab is focused
    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                fetchLikedSitters();
            }
        }, [user])
    );

    const handleDeleteSitter = (idToDelete: string) => {
        setLikedSitters(prevSitters => prevSitters.filter(sitter => sitter.id !== idToDelete));
        console.log('Deleted sitter option:', idToDelete);
    };

    const handlePressSitterCard = (sitter: LikedSitter) => {
        router.push({
            pathname: '/(tabs)/options/details',
            params: { sitterData: JSON.stringify(sitter) },

        });
        console.log('Pressed sitter card:', sitter);
    };

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Title style={styles.headerTitle}>Your Liked Sitters</Title>
                    <Text style={styles.headerSubtitle}>
                        Review your saved options and manage your requests.
                    </Text>
                </View>

                <FlatList
                    data={likedSitters}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handlePressSitterCard(item)}>
                            <LikedSitterCard sitterOption={item} onDelete={handleDeleteSitter} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <RNText style={styles.emptyText}>No liked sitters yet!</RNText>
                            <RNText style={styles.emptySubText}>Swipe right on sitters in the search screen to add them here.</RNText>
                        </View>
                    )}
                />
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: colors.textDark,
        textAlign: 'center',
    },
    listContentContainer: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.textDark,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default OptionsScreen; 