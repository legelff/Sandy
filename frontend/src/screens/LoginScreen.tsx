import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

interface LoginScreenProps {
    onNavigateToRegister: () => void;
}

// Basic email validation regex (can be shared in a utils file later)
const emailRegex = /^\S+@\S+\.\S+$/;

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!password) newErrors.password = 'Password is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = () => {
        if (validate()) {
            console.log('Login form is valid:', { email, password });
            // Actual login logic will go here
            // router.replace('/(tabs)/home'); 
        } else {
            console.log('Login form is invalid:', errors);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Login</Text>

                <PaperTextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => { setEmail(text); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    error={!!errors.email}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <PaperTextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => { setPassword(text); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    error={!!errors.password}
                    right={
                        <PaperTextInput.Icon
                            icon={showPassword ? () => <EyeOff color="gray" size={24} /> : () => <Eye color="gray" size={24} />}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    }
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <Button title="Login" onPress={handleLogin} />

                <TouchableOpacity onPress={onNavigateToRegister} style={styles.toggleLink}>
                    <Text style={styles.toggleText}>Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 8,
    },
    toggleLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen; 