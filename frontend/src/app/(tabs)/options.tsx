import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text as RNText } from 'react-native'; // Using RNText for the empty list message
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, Title } from 'react-native-paper';
import LikedSitterCard, { LikedSitter } from '../../components/options/LikedSitterCard';
import { colors } from '../../theme';

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
    const [likedSitters, setLikedSitters] = useState<LikedSitter[]>(DUMMY_LIKED_SITTERS);

    const handleDeleteSitter = (idToDelete: string) => {
        setLikedSitters(prevSitters => prevSitters.filter(sitter => sitter.id !== idToDelete));
        // TODO: In a real app, also call an API to remove this from the backend.
        console.log('Deleted sitter option:', idToDelete);
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
                        <LikedSitterCard sitterOption={item} onDelete={handleDeleteSitter} />
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
        backgroundColor: colors.background, // Ensure header bg matches screen, or make it distinct
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
        marginTop: 50, // Adjust as needed
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