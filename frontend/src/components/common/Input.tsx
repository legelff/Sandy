import React, { forwardRef } from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    StyleSheet,
    Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme/theme';
import { StyledText } from './StyledText';
import * as Icons from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Icons;
    rightIcon?: keyof typeof Icons;
    onRightIconPress?: () => void;
    containerStyle?: any;
}

export const Input = forwardRef<TextInput, InputProps>(
    (
        {
            label,
            error,
            leftIcon,
            rightIcon,
            onRightIconPress,
            style,
            containerStyle,
            ...props
        },
        ref
    ) => {
        const LeftIcon = leftIcon ? Icons[leftIcon] as React.ElementType : null;
        const RightIcon = rightIcon ? Icons[rightIcon] as React.ElementType : null;

        return (
            <View style={[styles.container, containerStyle]}>
                {label && (
                    <StyledText variant="caption" style={styles.label}>
                        {label}
                    </StyledText>
                )}
                <View
                    style={[
                        styles.inputContainer,
                        error && styles.inputError,
                        props.editable === false && styles.inputDisabled,
                    ]}>
                    {LeftIcon && React.createElement(LeftIcon, {
                        size: 20,
                        color: colors.grey500,
                        style: styles.leftIcon
                    })}
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            leftIcon && styles.inputWithLeftIcon,
                            rightIcon && styles.inputWithRightIcon,
                            style,
                        ]}
                        placeholderTextColor={colors.grey500}
                        {...props}
                    />
                    {RightIcon && (
                        <Pressable
                            onPress={onRightIconPress}
                            style={styles.rightIconContainer}>
                            <RightIcon size={20} color={colors.grey500} />
                        </Pressable>
                    )}
                </View>
                {error && (
                    <StyledText variant="small" color="error" style={styles.errorText}>
                        {error}
                    </StyledText>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
    },
    label: {
        marginBottom: spacing.xs,
        color: colors.grey700,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.grey300,
        borderRadius: borderRadius.md,
        backgroundColor: colors.textLight,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSizeBody,
        color: colors.textDark,
    },
    inputWithLeftIcon: {
        paddingLeft: spacing.xs,
    },
    inputWithRightIcon: {
        paddingRight: spacing.xs,
    },
    leftIcon: {
        marginLeft: spacing.md,
    },
    rightIconContainer: {
        padding: spacing.md,
    },
    inputError: {
        borderColor: colors.error,
    },
    inputDisabled: {
        backgroundColor: colors.grey100,
        borderColor: colors.grey300,
    },
    errorText: {
        marginTop: spacing.xs,
    },
});
