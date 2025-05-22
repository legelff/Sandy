import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyledText } from '../common/StyledText';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, layout } from '../../theme/theme';

interface HeaderComponentProps {
    title?: string;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
}

export const HeaderComponent = ({
    title,
    showBackButton = true,
    rightComponent,
}: HeaderComponentProps) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {showBackButton && (
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}>
                        <ChevronLeft size={24} color={colors.textDark} />
                    </Pressable>
                )}
                {title && (
                    <StyledText variant="h2" style={styles.title}>
                        {title}
                    </StyledText>
                )}
                <View style={styles.rightComponent}>
                    {rightComponent}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey300,
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
    },
    backButton: {
        marginRight: spacing.sm,
        padding: spacing.xs,
    },
    title: {
        flex: 1,
    },
    rightComponent: {
        marginLeft: spacing.sm,
    },
});
