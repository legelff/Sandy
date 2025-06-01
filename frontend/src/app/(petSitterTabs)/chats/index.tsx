import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../theme'; // Adjusted import path

/**
 * PetSitterChatsScreen is the main chats screen for pet sitters.
 */
const PetSitterChatsScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Chats (Pet Sitter)</Text>
                <Text style={styles.placeholderText}>Chat functionality for pet sitters.</Text>
                {/* TODO: Implement Pet Sitter chat UI and logic */}
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

export default PetSitterChatsScreen; 