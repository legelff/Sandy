import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation.types';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { StyledText } from '../components/common/StyledText';
import { Button } from '../components/common/Button';
import { FooterLayout } from '../components/layout/FooterLayout';
import { ProfileTypeSelection } from '../components/features/ProfileTypeSelection';
import { PlanSelection } from '../components/features/PlanSelection';
import { ownerPlans, sitterPlans } from '../constants/plans';
import { spacing } from '../theme/theme';

type ProfileType = 'owner' | 'sitter' | null;
type Step = 1 | '2A' | '2B';

interface StepConfig {
    title: string;
    subtitle: string;
}

export const CreateProfileFlowScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [profileType, setProfileType] = useState<ProfileType>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const steps: Record<Step, StepConfig> = {
        1: {
            title: 'Complete your profile',
            subtitle: 'Who are you?',
        },
        '2A': {
            title: 'Complete your profile',
            subtitle: 'Choose a plan which fits your needs',
        },
        '2B': {
            title: 'Complete your profile',
            subtitle: 'Choose a plan which fits your needs',
        },
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(profileType === 'owner' ? '2A' : '2B');
        } else if (currentStep === '2A') {
            navigation.navigate('AddEditPet', { isNew: true });
        } else if (currentStep === '2B') {
            // TODO: Navigate to sitter profile details
            navigation.navigate('HomeSitter');
        }
    };

    const handleBackStep = () => {
        if (currentStep === '2A' || currentStep === '2B') {
            setCurrentStep(1);
            setSelectedPlanId(null);
        }
    };

    const isNextEnabled = () => {
        if (currentStep === 1) {
            return profileType !== null;
        }
        return selectedPlanId !== null;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ProfileTypeSelection
                        selectedType={profileType}
                        onSelect={setProfileType}
                    />
                );
            case '2A':
                return (
                    <PlanSelection
                        plans={ownerPlans}
                        selectedPlanId={selectedPlanId}
                        onSelect={setSelectedPlanId}
                    />
                );
            case '2B':
                return (
                    <PlanSelection
                        plans={sitterPlans}
                        selectedPlanId={selectedPlanId}
                        onSelect={setSelectedPlanId}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ScreenContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <StyledText variant="h2" style={styles.title}>
                            {steps[currentStep].title}
                        </StyledText>
                        <StyledText
                            variant="body"
                            color="grey700"
                            style={styles.subtitle}>
                            {steps[currentStep].subtitle}
                        </StyledText>
                    </View>

                    <View style={styles.contentContainer}>
                        {renderStepContent()}
                    </View>

                    <FooterLayout showLogo>
                        <Button
                            variant="outline"
                            title="Back"
                            onPress={handleBackStep}
                            disabled={currentStep === 1}
                        />
                        <Button
                            title="Next"
                            onPress={handleNextStep}
                            disabled={!isNextEnabled()}
                        />
                    </FooterLayout>
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
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    title: {
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
});
