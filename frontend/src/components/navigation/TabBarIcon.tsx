import React from 'react';
import { Home, Search, Settings, MessageCircle, User } from 'lucide-react-native';
import { colors } from '../../theme'; // Corrected import

interface TabBarIconProps {
    routeName: string;
    focused: boolean;
    color: string;
    size: number;
}

/**
 * TabBarIcon component renders the icon for each tab in the bottom tab navigator.
 * @param {TabBarIconProps} props - The props for the component.
 * @returns {React.ReactElement} The icon component.
 */
const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, focused, color, size }) => {
    let IconComponent;

    switch (routeName) {
        case 'Home':
            IconComponent = Home;
            break;
        case 'Search':
            IconComponent = Search;
            break;
        case 'Options':
            IconComponent = Settings;
            break;
        case 'Chats':
            IconComponent = MessageCircle;
            break;
        case 'Profile':
            IconComponent = User;
            break;
        default:
            IconComponent = Home; // Default icon
    }

    return <IconComponent color={focused ? colors.primary : color} size={size} />;
};

export default TabBarIcon; 