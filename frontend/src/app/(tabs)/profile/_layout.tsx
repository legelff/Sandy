import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../../theme'; // Adjust path as needed

export default function ProfileStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="add-pet"
                options={{
                    headerTitle: () => <Text style={{ color: colors.textDark, fontSize: 17, fontWeight: '600' }}>Add New Pet</Text>,
                    headerTintColor: colors.primary,
                    headerStyle: { backgroundColor: colors.background },
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
        </Stack>
    );
} 