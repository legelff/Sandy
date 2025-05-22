import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { StyledText } from '../common/StyledText';
import { User, PawPrint } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

interface ProfileTypeOption {
    id: 'owner' | 'sitter';
    title: string;
    description: string;
    icon: typeof User | typeof PawPrint;
}

interface ProfileTypeSelectionProps {
    selectedType: 'owner' | 'sitter' | null;
    onSelect: (type: 'owner' | 'sitter') => void;
}

const profileTypes: ProfileTypeOption[] = [
    {
        id: 'owner',
        title: 'I am a pet owner',
        description: 'I am looking for someone to take care of my pet.',
        icon: PawPrint,
    },
    {
        id: 'sitter',
        title: 'I am a pet sitter',
        description: "I am looking to take care of other people's pets.",
        icon: User,
    },
];

export const ProfileTypeSelection = ({
    selectedType,
    onSelect,
}: ProfileTypeSelectionProps) => {
    return (
        <View style={styles.container}>
            {profileTypes.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.id;

                return (
                    <Pressable
                        key={option.id}
                        style={[
                            styles.optionCard,
                            isSelected && styles.selectedCard,
                        ]}
                        onPress={() => onSelect(option.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={option.title}>
                        <View
                            style={[
                                styles.iconContainer,
                                isSelected && styles.selectedIconContainer,
                            ]}>
                            <Icon
                                size={24}
                                color={isSelected ? colors.textLight : colors.primary}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <StyledText
                                variant="h3"
                                color={isSelected ? 'primary' : 'textDark'}
                                style={styles.title}>
                                {option.title}
                            </StyledText>
                            <StyledText
                                variant="body"
                                color="grey700"
                                style={styles.description}>
                                {option.description}
                            </StyledText>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.textLight,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.grey300,
        ...shadows.sm,
    },
    selectedCard: {
        borderColor: colors.primary,
        backgroundColor: colors.background,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    selectedIconContainer: {
        backgroundColor: colors.primary,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: spacing.xs,
    },
    description: {
        flexWrap: 'wrap',
    },
});
