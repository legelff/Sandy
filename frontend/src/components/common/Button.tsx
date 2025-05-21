import React from 'react';
import {
    Pressable,
    PressableProps,
    StyleSheet,
    View,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';
import { StyledText } from './StyledText';
import * as Icons from 'lucide-react-native';

export interface ButtonProps extends PressableProps {
    title: string;
    variant?: 'solid' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    icon?: keyof typeof Icons;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
}

export const Button = ({
    title,
    variant = 'solid',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    ...props
}: ButtonProps) => {
    const Icon = icon ? (Icons[icon] as React.ElementType) : null;

    return (
        <Pressable
            style={({ pressed }): ViewStyle[] => [
                styles.base,
                styles[variant],
                styles[`${size}Height`],
                fullWidth && styles.fullWidth,
                pressed && styles[`${variant}Pressed`],
                disabled && styles.disabled,
                style as ViewStyle,
            ].filter(Boolean) as ViewStyle[]}
            disabled={disabled || loading}
            {...props}>
            <View style={[styles.content, styles[`${size}Padding`]]}>
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'solid' ? colors.textLight : colors.primary}
                        size="small"
                    />
                ) : (
                    <>
                        {Icon && iconPosition === 'left' && (
                            <Icon
                                size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
                                color={variant === 'solid' ? colors.textLight : colors.primary}
                                style={styles.leftIcon}
                            />
                        )}
                        <StyledText
                            style={[
                                styles.text,
                                styles[`${size}Text`],
                                {
                                    color:
                                        variant === 'solid' ? colors.textLight : colors.primary,
                                },
                            ]}>
                            {title}
                        </StyledText>
                        {Icon && iconPosition === 'right' && (
                            <Icon
                                size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
                                color={variant === 'solid' ? colors.textLight : colors.primary}
                                style={styles.rightIcon}
                            />
                        )}
                    </>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    solid: {
        backgroundColor: colors.primary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    destructive: {
        backgroundColor: colors.error,
    },
    solidPressed: {
        backgroundColor: colors.grey700,
    },
    outlinePressed: {
        backgroundColor: colors.grey100,
    },
    ghostPressed: {
        backgroundColor: colors.grey100,
    },
    destructivePressed: {
        backgroundColor: colors.error,
        opacity: 0.8,
    },
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        alignSelf: 'stretch',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '500',
    },
    leftIcon: {
        marginRight: spacing.xs,
    },
    rightIcon: {
        marginLeft: spacing.xs,
    },
    smHeight: {
        height: 32,
    },
    mdHeight: {
        height: 40,
    },
    lgHeight: {
        height: 48,
    },
    smPadding: {
        paddingHorizontal: spacing.sm,
    },
    mdPadding: {
        paddingHorizontal: spacing.md,
    },
    lgPadding: {
        paddingHorizontal: spacing.lg,
    },
    smText: {
        fontSize: typography.fontSizeSmall,
    },
    mdText: {
        fontSize: typography.fontSizeBody,
    },
    lgText: {
        fontSize: typography.fontSizeH3,
    },
});
