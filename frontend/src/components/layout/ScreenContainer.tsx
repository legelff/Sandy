import React from 'react';
import { View, ViewProps, StyleSheet, ScrollView } from 'react-native';
import { colors, layout } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
    scrollable?: boolean;
    backgroundColor?: string;
    useSafeArea?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
    children,
    scrollable = true,
    backgroundColor = colors.background,
    useSafeArea = true,
    style,
    ...props
}) => {
    const Container = useSafeArea ? SafeAreaView : View;
    const Content = scrollable ? ScrollView : View;

    return (
        <Container style={[styles.safeArea, { backgroundColor }]} {...props}>
            <Content
                style={[styles.content, !scrollable && styles.fullHeight, style]}
                contentContainerStyle={scrollable && styles.scrollContent}>
                {children}
            </Content>
        </Container>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    fullHeight: {
        height: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        padding: layout.screenPadding,
    },
});
