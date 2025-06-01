import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

/**
 * PetSitterHomeScreen displays the main dashboard for pet sitters.
 */
const PetSitterHomeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Pet Sitter Dashboard</Text>
                <Text style={styles.placeholderText}>Welcome, Pet Sitter!</Text>
                {/* TODO: Implement Pet Sitter specific content */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 24,
        textAlign: 'center',
    },
    placeholderText: {
        fontSize: 18,
        color: colors.textDark,
        textAlign: 'center',
    },
});

export default PetSitterHomeScreen; 