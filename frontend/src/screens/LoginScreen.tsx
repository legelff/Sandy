import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { colors, spacing } from '../theme';

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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-background">
            <View className="justify-center p-md">
                <Text className="text-2xl font-bold mb-lg text-center text-text-dark">Login</Text>

                <PaperTextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => { setEmail(text); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    error={!!errors.email}
                />
                {errors.email && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.email}</Text>}

                <PaperTextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => { setPassword(text); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
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
                {errors.password && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.password}</Text>}

                <View className="mt-md mb-sm">
                    <Button title="Login" onPress={handleLogin} color={colors.primary} />
                </View>

                <TouchableOpacity onPress={onNavigateToRegister} className="mt-lg items-center">
                    <Text className="text-primary underline">Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default LoginScreen; 