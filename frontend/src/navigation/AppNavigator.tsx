import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation.types';
import { LoginScreen, RegisterScreen, CreateProfileFlowScreen, AddEditPetScreen } from '../screens';
import { StyledText } from '../components/common/StyledText';
import { ScreenContainer } from '../components/layout/ScreenContainer';

// Placeholder component for screens that haven't been implemented yet
const ComingSoonScreen = ({ route }: any) => (
    <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <StyledText variant="h2">{route.name}</StyledText>
            <StyledText variant="body" style={{ marginTop: 8 }}>
                Coming soon...
            </StyledText>
        </View>
    </ScreenContainer>
);

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    // TODO: Add authentication state check
    const isAuthenticated = false;
    const userType = 'owner'; // or 'sitter'

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="CreateProfileFlow" component={CreateProfileFlowScreen} />
                        <Stack.Screen name="AddEditPet" component={AddEditPetScreen} />
                    </>
                ) : userType === 'owner' ? (
                    // Pet Owner Stack
                    <>
                        <Stack.Screen name="HomeOwner" component={ComingSoonScreen} />
                        <Stack.Screen name="SearchOwnerFilters" component={ComingSoonScreen} />
                        <Stack.Screen name="SearchOwnerResults" component={ComingSoonScreen} />
                        <Stack.Screen name="SitterProfile" component={ComingSoonScreen} />
                        <Stack.Screen name="PetProfile" component={ComingSoonScreen} />
                        <Stack.Screen name="Messages" component={ComingSoonScreen} />
                        <Stack.Screen name="Chat" component={ComingSoonScreen} />
                        <Stack.Screen name="Profile" component={ComingSoonScreen} />
                        <Stack.Screen name="Settings" component={ComingSoonScreen} />
                    </>
                ) : (
                    // Pet Sitter Stack
                    <>
                        <Stack.Screen name="HomeSitter" component={ComingSoonScreen} />
                        <Stack.Screen name="SearchSitter" component={ComingSoonScreen} />
                        <Stack.Screen name="OwnerProfile" component={ComingSoonScreen} />
                        <Stack.Screen name="Messages" component={ComingSoonScreen} />
                        <Stack.Screen name="Chat" component={ComingSoonScreen} />
                        <Stack.Screen name="Profile" component={ComingSoonScreen} />
                        <Stack.Screen name="Settings" component={ComingSoonScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
