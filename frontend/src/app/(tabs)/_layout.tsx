import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import TabBarIcon from '../../components/navigation/TabBarIcon'; // Adjusted import path
import { colors } from '../../theme'; // Adjusted import path

/**
 * TabsLayout component sets up the bottom tab navigator using Expo Router.
 * This file defines the layout for the tabs group.
 * @returns {React.ReactElement} The bottom tab navigator.
 */
const TabsLayout: React.FC = () => {
    const pathname = usePathname(); // Get current path

    // Determine if the search results screen is active
    const isSearchResultsActive = pathname === '/(tabs)/search/results';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index" // This will correspond to app/(tabs)/index.tsx
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
                name="options" // This will correspond to app/(tabs)/options.tsx
                options={{
                    title: 'Options',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabBarIcon routeName="Options" focused={focused} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chats" // This will correspond to app/(tabs)/chats.tsx
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabBarIcon routeName="Chats" focused={focused} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile" // This will correspond to app/(tabs)/profile.tsx
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

export default TabsLayout; 