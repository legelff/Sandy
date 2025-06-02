import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { colors, spacing } from '../theme';
import { useAuthStore } from '../store/useAuthStore';

interface LoginScreenProps {
    onNavigateToRegister: () => void;
}

// Basic email validation regex (can be shared in a utils file later)
const emailRegex = /^\S+@\S+\.\S+$/;

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
    const router = useRouter();
    const setAuthData = useAuthStore((state) => state.setAuthData);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        setGeneralError(null);
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!password) newErrors.password = 'Password is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (validate()) {
            setIsLoading(true);
            setGeneralError(null);
            try {
                // on emulator: keep this, this is how route is formatted
                // on browser: change to http://localhost:3000/auth/login
                const response = await fetch('http://192.168.1.52:3000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok && data.status === 200 && data.user && data.token) {
                    // console.log('Login successful:', data);
                    setAuthData(data.user, data.token);

                    // Navigate based on role
                    if (data.user.role === 'owner') {
                        router.replace('/(tabs)/'); // Navigates to the index file in (tabs)
                    } else if (data.user.role === 'sitter') {
                        router.replace('/(petSitterTabs)/'); // Navigates to the index file in (petSitterTabs)
                    } else {
                        console.error('Unknown user role:', data.user.role);
                        setGeneralError('Login successful, but could not determine user role for navigation.');
                        // Optionally, navigate to a default or error page
                    }
                } else {
                    if (data.errType === 'Email') {
                        setErrors(prev => ({ ...prev, email: data.message }));
                    } else if (data.errType === 'Password') {
                        setErrors(prev => ({ ...prev, password: data.message }));
                    } else if (data.message) {
                        setGeneralError(data.message);
                    } else {
                        setGeneralError('Login failed. Please try again.');
                    }
                    console.error('Login failed:', data);
                }
            } catch (error) {
                console.error('Login API error:', error);
                setGeneralError('An unexpected error occurred. Please check your connection and try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            // console.log('Login form is invalid:', errors);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-background">
            <View className="justify-center p-md">
                <Text className="text-2xl font-bold mb-lg text-center text-text-dark">Login</Text>

                {generalError && (
                    <View className="bg-red-100 border border-red-400 text-red-700 px-md py-sm rounded relative mb-md" role="alert">
                        <Text className="font-bold">Error</Text>
                        <Text className="block sm:inline">{generalError}</Text>
                    </View>
                )}

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
                    <Button title={isLoading ? "Logging in..." : "Login"} onPress={handleLogin} color={colors.primary} disabled={isLoading} />
                </View>

                <TouchableOpacity onPress={onNavigateToRegister} className="mt-lg items-center" disabled={isLoading}>
                    <Text className="text-primary underline">Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default LoginScreen; 