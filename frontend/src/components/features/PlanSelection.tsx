import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { StyledText } from '../common/StyledText';
import { Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

export interface PlanFeature {
    text: string;
    included: boolean;
}

export interface Plan {
    id: string;
    title: string;
    price: number;
    features: PlanFeature[];
}

interface PlanSelectionProps {
    plans: Plan[];
    selectedPlanId: string | null;
    onSelect: (planId: string) => void;
}

export const PlanSelection = ({
    plans,
    selectedPlanId,
    onSelect,
}: PlanSelectionProps) => {
    return (
        <View style={styles.container}>
            {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;

                return (
                    <Pressable
                        key={plan.id}
                        style={[styles.planCard, isSelected && styles.selectedCard]}
                        onPress={() => onSelect(plan.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={`${plan.title} - $${plan.price} per month`}>
                        <View style={styles.headerContainer}>
                            <View>
                                <StyledText
                                    variant="h3"
                                    color={isSelected ? 'primary' : 'textDark'}>
                                    {plan.title}
                                </StyledText>
                                <StyledText
                                    variant="h2"
                                    color={isSelected ? 'primary' : 'textDark'}
                                    style={styles.price}>
                                    ${plan.price}
                                    <StyledText
                                        variant="body"
                                        color="grey700"
                                        style={styles.perMonth}>
                                        {' '}
                                        / month
                                    </StyledText>
                                </StyledText>
                            </View>
                        </View>

                        <View style={styles.featuresContainer}>
                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <Check
                                        size={16}
                                        color={
                                            feature.included ? colors.primary : colors.grey500
                                        }
                                        style={styles.checkIcon}
                                    />
                                    <StyledText
                                        variant="body"
                                        color={feature.included ? 'textDark' : 'grey500'}
                                        style={styles.featureText}>
                                        {feature.text}
                                    </StyledText>
                                </View>
                            ))}
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
    planCard: {
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    price: {
        marginTop: spacing.xs,
    },
    perMonth: {
        fontSize: 14,
    },
    featuresContainer: {
        gap: spacing.sm,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIcon: {
        marginRight: spacing.sm,
    },
    featureText: {
        flex: 1,
    },
});
