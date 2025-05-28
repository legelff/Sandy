import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ChatItemCard, { ChatItem } from '../../components/chats/ChatItemCard';
import { colors } from '../../theme';

// Placeholder data for chats
const DUMMY_CHATS: ChatItem[] = [
    {
        id: 'chat1',
        sitterName: 'Alice Wonderland',
        petName: 'Buddy',
    },
    {
        id: 'chat2',
        sitterName: 'Bob The Builder',
        petName: 'Lucy',
    },
    {
        id: 'chat3',
        sitterName: 'Diana Prince',
        petName: 'Charlie',
    },
];

const ChatsScreen: React.FC = () => {
    const router = useRouter();
    const [chats, setChats] = useState<ChatItem[]>(DUMMY_CHATS);

    const handleNavigateToChat = (chatId: string, sitterName: string) => {
        // Navigate to an individual chat screen, passing chatId and sitterName
        // This screen (e.g., /chats/[chatId].tsx) would need to be created.
        // router.push(`/chats/${chatId}?sitterName=${encodeURIComponent(sitterName)}`);
        router.push({
            pathname: '/(tabs)/chats/conversation', // Placeholder for actual chat screen route
            params: { chatId, sitterName }
        });
        console.log(`Navigating to chat with ${sitterName} (ID: ${chatId})`);
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
                        <ChatItemCard chatItem={item} onPress={handleNavigateToChat} />
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
        paddingVertical: 16, // Add some vertical padding
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

export default ChatsScreen; 