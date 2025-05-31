import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text as RNText, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, Title } from 'react-native-paper';
import LikedSitterCard, { LikedSitter } from '../../../components/options/LikedSitterCard'; // Adjusted path
import { colors } from '../../../theme'; // Adjusted path
import { useRouter } from 'expo-router'; // Added useRouter

// Placeholder data for liked sitters
const DUMMY_LIKED_SITTERS: LikedSitter[] = [
    {
        id: 's1',
        sitterName: 'Alice Wonderland',
        distance: '2 km away',
        rating: 4.8,
        selectedPets: ['Buddy (Dog)', 'Lucy (Cat)'],
        fromDate: '2024-07-01',
        toDate: '2024-07-05',
        relevancyScore: 92,
    },
    {
        id: 's2',
        sitterName: 'Bob The Builder',
        distance: '5 km away',
        rating: 4.5,
        selectedPets: ['Charlie (Dog)'],
        fromDate: '2024-07-10',
        toDate: '2024-07-12',
        relevancyScore: 85,
    },
    {
        id: 's3',
        sitterName: 'Diana Prince',
        distance: '3 km away',
        rating: 4.7,
        selectedPets: ['Whiskers (Cat)'],
        fromDate: '2024-08-01',
        toDate: '2024-08-03',
        relevancyScore: 88,
    },
];

const OptionsScreen: React.FC = () => {
    const router = useRouter(); // Initialize router
    const [likedSitters, setLikedSitters] = useState<LikedSitter[]>(DUMMY_LIKED_SITTERS);

    const handleDeleteSitter = (idToDelete: string) => {
        setLikedSitters(prevSitters => prevSitters.filter(sitter => sitter.id !== idToDelete));
        console.log('Deleted sitter option:', idToDelete);
    };

    const handlePressSitterCard = (sitter: LikedSitter) => {
        router.push({
            pathname: '/(tabs)/options/details',
            params: { sitterData: JSON.stringify(sitter) },
        });
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