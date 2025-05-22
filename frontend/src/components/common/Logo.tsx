import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StyledText } from './StyledText';
import { colors, typography } from '../../theme/theme';
import { PawPrint } from 'lucide-react-native';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    dark?: boolean;
}

export const Logo = ({ size = 'md', dark = false }: LogoProps) => {
    const getSize = () => {
        switch (size) {
            case 'sm':
                return { fontSize: 24, iconSize: 20 };
            case 'lg':
                return { fontSize: 48, iconSize: 40 };
            default:
                return { fontSize: 32, iconSize: 28 };
        }
    };

    const { fontSize, iconSize } = getSize();

    return (
        <View style={styles.container}>
            <PawPrint
                size={iconSize}
                color={dark ? colors.textDark : colors.primary}
                style={styles.icon}
            />
            <StyledText
                style={[
                    styles.text,
                    { fontSize, color: dark ? colors.textDark : colors.primary },
                ]}>
                Sandy
            </StyledText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontWeight: "700",
    },
});
