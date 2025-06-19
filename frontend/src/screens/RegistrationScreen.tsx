import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { colors, spacing } from '../theme';
import { useOnboardingStore } from '../store/onboardingStore';

interface RegistrationScreenProps {
    onNavigateToLogin: () => void;
}

// Basic email validation regex
const emailRegex = /^\S+@\S+\.\S+$/;

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onNavigateToLogin }) => {
    const router = useRouter();
    const { setRegistrationData } = useOnboardingStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');

    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!name.trim()) newErrors.name = 'Name is required.';
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!password) newErrors.password = 'Password is required.';
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
        if (!street.trim()) newErrors.street = 'Street address is required.';
        if (!city.trim()) newErrors.city = 'City is required.';
        if (!postcode.trim()) newErrors.postcode = 'Postcode is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            const registrationDetails = { name, email, password, street, city, postcode };
            setRegistrationData(registrationDetails);
            // console.log('Form is valid, data saved to store:', registrationDetails);
            router.push('/role-selection');
        } else {
            // console.log('Form is invalid:', errors);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-background">
            <View className="justify-center p-md">
                <Text className="text-2xl font-bold mb-lg text-center text-text-dark">Create Account</Text>

                <PaperTextInput
                    label="Name"
                    value={name}
                    onChangeText={(text) => { setName(text); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
                    mode="outlined"
                    error={!!errors.name}
                />
                {errors.name && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.name}</Text>}

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

                <PaperTextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
                    secureTextEntry={!showConfirmPassword}
                    mode="outlined"
                    error={!!errors.confirmPassword}
                    right={
                        <PaperTextInput.Icon
                            icon={showConfirmPassword ? () => <EyeOff color="gray" size={24} /> : () => <Eye color="gray" size={24} />}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    }
                />
                {errors.confirmPassword && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.confirmPassword}</Text>}

                <PaperTextInput
                    label="Street Address"
                    value={street}
                    onChangeText={(text) => { setStreet(text); if (errors.street) setErrors(prev => ({ ...prev, street: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
                    mode="outlined"
                    error={!!errors.street}
                />
                {errors.street && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.street}</Text>}

                <PaperTextInput
                    label="City"
                    value={city}
                    onChangeText={(text) => { setCity(text); if (errors.city) setErrors(prev => ({ ...prev, city: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
                    mode="outlined"
                    error={!!errors.city}
                />
                {errors.city && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.city}</Text>}

                <PaperTextInput
                    label="Postcode"
                    value={postcode}
                    onChangeText={(text) => { setPostcode(text); if (errors.postcode) setErrors(prev => ({ ...prev, postcode: undefined })); }}
                    style={{ marginBottom: spacing.sm }}
                    mode="outlined"
                    error={!!errors.postcode}
                />
                {errors.postcode && <Text className="text-red-500 text-xs mb-sm ml-sm">{errors.postcode}</Text>}

                <View className="mt-md mb-sm">
                    <Button title="Next" onPress={handleNext} color={colors.primary} />
                </View>

                <TouchableOpacity onPress={onNavigateToLogin} className="mt-lg items-center">
                    <Text className="text-primary underline">Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default RegistrationScreen; 