import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

/**
 * PetSitterHomeScreen displays the main dashboard for pet sitters.
 * It shows pets currently in their care and their pet sitting history.
 */
const PetSitterHomeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.header}>Pet Sitter Dashboard</Text>

                {/* Section: Pets currently in care by sitter */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Pets Currently In My Care</Text>
                    {/* TODO: Replace with actual component to list pets in care */}
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Pet 1 (Buddy - Dog)</Text>
                        <Text style={styles.placeholderText}>Owner: Alice Wonderland</Text>
                    </View>
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Pet 2 (Mittens - Cat)</Text>
                        <Text style={styles.placeholderText}>Owner: Bob The Builder</Text>
                    </View>
                </View>

                {/* Section: Pet Sitting History */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Pet Sitting History</Text>
                    {/* TODO: Replace with actual component to list pet sitting history */}
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Previously cared for: Max (Dog) - Owner: Carol Danvers</Text>
                    </View>
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Previously cared for: Nemo (Fish) - Owner: David Copperfield</Text>
                    </View>
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
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 24,
        textAlign: 'center',
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 16,
    },
    placeholderItem: {
        backgroundColor: colors.background, // A slightly different background for items
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
    },
    placeholderText: {
        fontSize: 16,
        color: colors.textDark,
    },
});

export default PetSitterHomeScreen; 