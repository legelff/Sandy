import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation.types';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Logo } from '../components/common/Logo';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { StyledText } from '../components/common/StyledText';
import { colors, spacing } from '../theme/theme';

interface RegisterFormData {
    fullName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
}

export const RegisterScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        email: '',
        password: '',
        agreeToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        try {
            setLoading(true);
            // TODO: Implement registration logic
            // For now, just navigate to CreateProfileFlow
            navigation.navigate('CreateProfileFlow');
        } catch (error) {
            // TODO: Handle error
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return (
            formData.fullName.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.length >= 6 &&
            formData.agreeToTerms
        );
    };

    return (
        <ScreenContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Logo size="lg" />
                        <StyledText variant="h2" style={styles.header}>
                            Welcome to Sandy!
                        </StyledText>
                        <StyledText
                            variant="body"
                            color="grey700"
                            style={styles.subheader}>
                            A platform for your pets and certified caretakers.
                        </StyledText>
                    </View>

                    <View style={styles.formContainer}>
                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChangeText={(text) =>
                                setFormData({ ...formData, fullName: text })
                            }
                            leftIcon="User"
                        />

                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChangeText={(text) =>
                                setFormData({ ...formData, email: text })
                            }
                            autoCapitalize="none"
                            keyboardType="email-address"
                            leftIcon="Mail"
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(text) =>
                                setFormData({ ...formData, password: text })
                            }
                            secureTextEntry={!showPassword}
                            leftIcon="Lock"
                            rightIcon={showPassword ? 'Eye' : 'EyeOff'}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />

                        <View style={styles.checkboxContainer}>
                            <Button
                                variant="ghost"
                                title={
                                    formData.agreeToTerms
                                        ? '✓ I agree to the terms and conditions'
                                        : '○ I agree to the terms and conditions'
                                }
                                onPress={() =>
                                    setFormData({
                                        ...formData,
                                        agreeToTerms: !formData.agreeToTerms,
                                    })
                                }
                                style={styles.termsButton}
                            />
                        </View>

                        <Button
                            title="Register"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={!isFormValid()}
                            fullWidth
                        />
                    </View>

                    <View style={styles.footer}>
                        <StyledText variant="body" color="grey700">
                            Already have an account?{' '}
                        </StyledText>
                        <Button
                            title="Login"
                            variant="ghost"
                            onPress={() => navigation.navigate('Login')}
                        />
                    </View>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    header: {
        marginTop: spacing.md,
        textAlign: 'center',
    },
    subheader: {
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    checkboxContainer: {
        marginVertical: spacing.md,
    },
    termsButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 0,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
