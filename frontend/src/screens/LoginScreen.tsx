import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation.types';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Logo } from '../components/common/Logo';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { StyledText } from '../components/common/StyledText';
import { colors, spacing } from '../theme/theme';

export const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            // TODO: Implement login logic
            // For now, just navigate to CreateProfileFlow
            navigation.navigate('CreateProfileFlow');
        } catch (error) {
            // TODO: Handle error
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Logo size="lg" />
                    <StyledText
                        variant="h3"
                        color="grey700"
                        style={styles.subtitle}>
                        Connect with trusted pet sitters
                    </StyledText>
                </View>

                <View style={styles.formContainer}>
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        leftIcon="Mail"
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        leftIcon="Lock"
                        rightIcon={showPassword ? 'Eye' : 'EyeOff'}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <Button
                        title="Log In"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={!email || !password}
                        fullWidth
                    />

                    <StyledText
                        variant="small"
                        color="grey700"
                        style={styles.forgotPassword}>
                        Forgot Password?
                    </StyledText>
                </View>

                <View style={styles.footer}>
                    <StyledText variant="body" color="grey700">
                        Don't have an account?{' '}
                    </StyledText>
                    <Button
                        title="Sign Up"
                        variant="ghost"
                        onPress={() => navigation.navigate('Register')}
                    />
                </View>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    subtitle: {
        marginTop: spacing.md,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    forgotPassword: {
        textAlign: 'center',
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
