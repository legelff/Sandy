import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import TabBarIcon from '../../components/navigation/TabBarIcon'; // Adjusted import path
import { colors } from '../../theme'; // Adjusted import path

/**
 * PetSitterTabsLayout component sets up the bottom tab navigator for pet sitters.
 * @returns {React.ReactElement} The bottom tab navigator.
 */
const PetSitterTabsLayout: React.FC = () => {
    const pathname = usePathname(); // Get current path

    // Determine if the search results screen is active
    const isSearchResultsActive = pathname === '/(petSitterTabs)/search/results';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index" // This will correspond to app/(petSitterTabs)/index.tsx
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabBarIcon routeName="Home" focused={focused} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search" // This now points to the search stack navigator (search/_layout.tsx)
                options={{
                    title: 'Search',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabBarIcon routeName="Search" focused={focused} color={color} size={size} />
                    ),
                    tabBarStyle: { display: isSearchResultsActive ? 'none' : 'flex' }, // Hide tab bar for results screen
                }}
            />
            <Tabs.Screen
                name="chats" // This will correspond to app/(petSitterTabs)/chats.tsx
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabBarIcon routeName="Chats" focused={focused} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile" // This will correspond to app/(petSitterTabs)/profile.tsx
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabBarIcon routeName="Profile" focused={focused} color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default PetSitterTabsLayout; 