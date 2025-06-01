import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../../theme';

/**
 * PetSitterProfileLayout defines the layout for the profile stack navigator for pet sitters.
 */
export default function PetSitterProfileStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="edit-profile"
                options={{
                    headerTitle: () => <Text style={{ color: colors.textDark, fontSize: 17, fontWeight: '600' }}>Edit Profile</Text>,
                    headerTintColor: colors.primary,
                    headerStyle: { backgroundColor: colors.background },
                }}
            />
            {/* No "add-pet" screen for pet sitters */}
        </Stack>
    );
} 