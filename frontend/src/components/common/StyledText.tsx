import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme/theme';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';
    color?: keyof typeof colors;
    bold?: boolean;
}

export const StyledText = ({
    variant = 'body',
    color = 'textDark',
    bold = false,
    style,
    ...props
}: TextProps) => {
    return (
        <RNText
            style={[
                styles[variant],
                { color: colors[color] },
                bold && { fontWeight: '700' },
                style,
            ]}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    h1: {
        fontSize: typography.fontSizeH1,
        fontWeight: '700',
        lineHeight: typography.fontSizeH1 * typography.lineHeightTight,
    },
    h2: {
        fontSize: typography.fontSizeH2,
        fontWeight: '700',
        lineHeight: typography.fontSizeH2 * typography.lineHeightTight,
    },
    h3: {
        fontSize: typography.fontSizeH3,
        fontWeight: '700',
        lineHeight: typography.fontSizeH3 * typography.lineHeightTight,
    },
    body: {
        fontSize: typography.fontSizeBody,
        lineHeight: typography.fontSizeBody * typography.lineHeightNormal,
    },
    caption: {
        fontSize: typography.fontSizeCaption,
        lineHeight: typography.fontSizeCaption * typography.lineHeightNormal,
    },
    small: {
        fontSize: typography.fontSizeSmall,
        lineHeight: typography.fontSizeSmall * typography.lineHeightNormal,
    },
});
