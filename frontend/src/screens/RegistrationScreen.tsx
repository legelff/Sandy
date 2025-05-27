import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

interface RegistrationScreenProps {
    onNavigateToLogin: () => void;
}

// Basic email validation regex
const emailRegex = /^\S+@\S+\.\S+$/;

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onNavigateToLogin }) => {
    const router = useRouter();
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
            console.log('Form is valid:', { name, email, password, street, city, postcode });
            router.push('/role-selection');
        } else {
            console.log('Form is invalid:', errors);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Create Account</Text>

                <PaperTextInput
                    label="Name"
                    value={name}
                    onChangeText={(text) => { setName(text); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.name}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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

                <PaperTextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                    style={styles.input}
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
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                <PaperTextInput
                    label="Street Address"
                    value={street}
                    onChangeText={(text) => { setStreet(text); if (errors.street) setErrors(prev => ({ ...prev, street: undefined })); }}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.street}
                />
                {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}

                <PaperTextInput
                    label="City"
                    value={city}
                    onChangeText={(text) => { setCity(text); if (errors.city) setErrors(prev => ({ ...prev, city: undefined })); }}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.city}
                />
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

                <PaperTextInput
                    label="Postcode"
                    value={postcode}
                    onChangeText={(text) => { setPostcode(text); if (errors.postcode) setErrors(prev => ({ ...prev, postcode: undefined })); }}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.postcode}
                />
                {errors.postcode && <Text style={styles.errorText}>{errors.postcode}</Text>}

                <Button title="Next" onPress={handleNext} />

                <TouchableOpacity onPress={onNavigateToLogin} style={styles.toggleLink}>
                    <Text style={styles.toggleText}>Already have an account? Login</Text>
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

export default RegistrationScreen; 