import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme';

export interface ChatItem {
    id: string; // Unique ID for the chat
    ownerName: string;
    sitterName: string;
    petName: string;
    isOwner?: boolean; // Optional: true if the user is the owner, false if sitter
    // lastMessage?: string; // Optional: for future preview
    // timestamp?: string;   // Optional: for future sorting/display
    // unreadCount?: number; // Optional: for future notification badge
}

interface ChatItemCardProps {
    chatItem: ChatItem;
    onPress: (chatId: string, ownerName: string) => void;
}

/**
 * ChatItemCard displays a single chat entry in the list.
 * @param {ChatItemCardProps} props - The props for the component.
 * @returns {React.ReactElement} The ChatItemCard component.
 */
const ChatItemCard: React.FC<ChatItemCardProps> = ({ chatItem, onPress }) => {
    console.log(chatItem)
    return (<TouchableOpacity onPress={() => onPress(chatItem.id, chatItem.isOwner ? chatItem.ownerName : chatItem.sitterName)}>
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.infoContainer}>
                    <Text style={styles.sitterName}>{chatItem.isOwner ? chatItem.ownerName : chatItem.sitterName}</Text>
                </View>
                <ChevronRight size={24} color={colors.primary} />
            </Card.Content>
        </Card>
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1.00,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16, // More padding for a cleaner look
        paddingHorizontal: 16,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Allow this to take up available space
    },
    sitterName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.textDark,
    },
    petName: {
        fontSize: 15,
        color: colors.textDark, // Slightly different color or style for pet name
        marginLeft: 8,
    },
});

export default ChatItemCard; 