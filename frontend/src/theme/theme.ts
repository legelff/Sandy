export const colors = {
    background: '#f6f6e9',
    primary: '#17724c',
    textLight: '#ffffff',
    textDark: '#000000',
    // Additional colors for better UI
    accent: '#2a9d8f',
    error: '#e63946',
    success: '#2ecc71',
    grey100: '#f8f9fa',
    grey300: '#dee2e6',
    grey500: '#adb5bd',
    grey700: '#495057',
    grey900: '#212529',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
};

export const typography = {
    // Font sizes
    fontSizeH1: 28,
    fontSizeH2: 24,
    fontSizeH3: 20,
    fontSizeBody: 16,
    fontSizeCaption: 14,
    fontSizeSmall: 12,

    // Font weights
    fontWeightRegular: "400",
    fontWeightMedium: "500",
    fontWeightBold: "700",

    // Line heights
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
};

export const iconSizes = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
};

export const layout = {
    screenPadding: spacing.md,
    maxContentWidth: 500,
};

export const animation = {
    timing: {
        fast: 200,
        normal: 300,
        slow: 500,
    },
};
