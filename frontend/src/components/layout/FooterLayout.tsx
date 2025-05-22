import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';
import { Logo } from '../common/Logo';

interface FooterLayoutProps {
    showLogo?: boolean;
    children: React.ReactNode;
}

export const FooterLayout = ({
    showLogo = false,
    children,
}: FooterLayoutProps) => {
    return (
        <View style={styles.container}>
            {children}
            {showLogo && (
                <View style={styles.logoContainer}>
                    <Logo size="sm" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    logoContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: -1,
    },
});
