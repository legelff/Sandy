import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme'; // Adjusted import path

/**
 * HomeScreen (formerly DashboardScreen) displays the main dashboard for the user.
 * It shows different sections based on the user type (Pet Owner or Pet Sitter).
 * For Pet Owners: Pets currently in care, Inactive pets, Sent care requests.
 */
const HomeScreen: React.FC = () => {
    // TODO: Add logic to differentiate between Pet Owner and Pet Sitter dashboards
    // For now, implementing the Pet Owner dashboard structure.

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.header}>Dashboard</Text>

                {/* Section: Pets currently in care by sitter */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Pets Currently In Care</Text>
                    {/* TODO: Replace with actual component to list pets */}
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Pet 1 (Fluffy - Dog)</Text>
                        <Text style={styles.placeholderText}>Sitter: Jane Doe</Text>
                    </View>
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Pet 2 (Whiskers - Cat)</Text>
                        <Text style={styles.placeholderText}>Sitter: John Smith</Text>
                    </View>
                </View>

                {/* Section: Inactive pets */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Inactive Pets</Text>
                    {/* TODO: Replace with actual component to list inactive pets */}
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Pet 3 (Goldie - Fish)</Text>
                    </View>
                </View>

                {/* Section: Sent pet care requests */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Sent Pet Care Requests</Text>
                    {/* TODO: Replace with actual component to list sent requests */}
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Request to Sitter X (Pending)</Text>
                    </View>
                    <View style={styles.placeholderItem}>
                        <Text style={styles.placeholderText}>Request to Sitter Y (Accepted)</Text>
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

export default HomeScreen; 