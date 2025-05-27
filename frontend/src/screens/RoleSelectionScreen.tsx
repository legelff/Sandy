import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Or your navigation hook

const RoleSelectionScreen = () => {
    const router = useRouter(); // Or useNavigation() depending on your setup

    const handleSelectRole = (role: string) => {
        console.log('Selected role:', role);
        if (role === 'Pet Owner') {
            router.push('/onboarding/pet-owner/subscription');
        } else if (role === 'Pet Sitter') {
            // Placeholder for Pet Sitter onboarding
            // router.push('/onboarding/pet-sitter/subscription');
            console.log('Pet Sitter onboarding to be implemented');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>How will you be using Sandy?</Text>

            <View style={styles.buttonContainer}>
                <Button title="I'm a Pet Owner" onPress={() => handleSelectRole('Pet Owner')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="I'm a Pet Sitter" onPress={() => handleSelectRole('Pet Sitter')} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 32,
        textAlign: 'center',
    },
    buttonContainer: {
        marginVertical: 10,
        width: '80%',
    }
});

export default RoleSelectionScreen; 