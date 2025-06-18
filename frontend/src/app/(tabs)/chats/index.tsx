import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ChatItemCard, { ChatItem } from '../../../components/chats/ChatItemCard'; // Adjusted path
import { colors } from '../../../theme'; // Adjusted path
import { useAuthStore } from '../../../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';

const ChatsListScreen: React.FC = () => {
    const router = useRouter();
    const [chats, setChats] = useState<ChatItem[]>([]);
    const { user, token } = useAuthStore();

    const fetchChats = useCallback(async () => {
        if (!token || !user) return;
        try {
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/chat`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch chats');
            const data = await res.json();
            // Map backend data to ChatItem[]
            const mappedChats = data.map((c: any) => ({
                id: c.id.toString(),
                ownerName: c.user1_id === user.id ? c.user2_name : c.user1_name,
                sitterName: c.user1_id === user.id ? c.user1_name : c.user2_name,
                petName: c.pet_name || '',
                isOwner: true,
            }));
            setChats(mappedChats);
        } catch (e) {
            setChats([]);
        }
    }, [token, user]);

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [fetchChats])
    );

    const handleNavigateToChat = (chatId: string, sitterName: string, petName?: string) => {
        router.push({
            pathname: '/(tabs)/chats/chat', // Navigate to the new chat screen
            params: { chatId, sitterName, petName }
        });
        console.log(`Navigating to chat with ${sitterName} (ID: ${chatId}), Pet: ${petName}`);
    };

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Title style={styles.headerTitle}>Your Conversations</Title>
                    <Text style={styles.headerSubtitle}>
                        Continue your chats with pet sitters.
                    </Text>
                </View>

                <FlatList
                    data={chats}
                    renderItem={({ item }) => (
                        // Pass petName to handler
                        <ChatItemCard chatItem={item} onPress={(id, sName) => handleNavigateToChat(id, sName, item.petName)} />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <RNText style={styles.emptyText}>No active chats yet.</RNText>
                            <RNText style={styles.emptySubText}>Accepted requests will appear here.</RNText>
                        </View>
                    )}
                />
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: colors.textDark,
        textAlign: 'center',
    },
    listContentContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.textDark,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default ChatsListScreen; // Renamed export