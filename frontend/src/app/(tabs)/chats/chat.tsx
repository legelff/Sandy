import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput as RNTextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, IconButton, Button as PaperButton, Card, Chip, Title } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { colors } from '../../../theme';
import { Camera as CameraIcon, Send, Briefcase, CheckCircle, XCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface Message {
    id: string;
    text?: string;
    imageUri?: string;
    sender: 'user' | 'owner';
    timestamp: Date;
    bookingDetails?: BookingConfirmationDetails;
    messageType?: 'text' | 'image' | 'booking_confirmation';
}

interface BookingConfirmationDetails {
    chatId?: string;
    sitterName?: string;
    ownerName?: string;
    petNames: string[];
    fromDate: string;
    toDate: string;
    location: string;
    servicePackage: string;
    totalPrice: number;
    status: 'pending' | 'accepted' | 'declined';
}

// Dummy messages for a given chat (Pet Owner with Pet Sitter)
const DUMMY_MESSAGES: Message[] = [
    { id: 'm1', text: 'Hi John, can you look after Buddy next week?', sender: 'owner', timestamp: new Date(Date.now() - 1000 * 60 * 5), messageType: 'text' },
    { id: 'm2', text: "Hi! Yes, I should be available. What dates?", sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 4), messageType: 'text' },
];

const PetOwnerChatScreen: React.FC = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();

    const { chatId, userName: sitterNameFromNav, petName, bookingConfirmation: bookingConfirmationString } = params as {
        chatId: string;
        userName: string;
        petName?: string;
        bookingConfirmation?: string;
    };

    const sitterName = sitterNameFromNav || "Pet Sitter";

    const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
    const [inputText, setInputText] = useState<string>('');
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: sitterName,
        });
    }, [navigation, sitterName]);

    useEffect(() => {
        if (bookingConfirmationString && typeof bookingConfirmationString === 'string') {
            try {
                const bookingDetails: BookingConfirmationDetails = JSON.parse(bookingConfirmationString);
                const bookingMessage: Message = {
                    id: `booking-${Date.now()}`,
                    sender: 'owner',
                    timestamp: new Date(),
                    bookingDetails: bookingDetails,
                    messageType: 'booking_confirmation',
                };
                setMessages(prevMessages => [bookingMessage, ...prevMessages]);
            } catch (error) {
                console.error("Failed to parse booking confirmation:", error);
            }
        }
    }, [bookingConfirmationString]);

    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;
        const newMessage: Message = {
            id: `msg${Date.now()}`,
            text: inputText.trim(),
            sender: 'owner',
            timestamp: new Date(),
            messageType: 'text',
        };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setInputText('');
    };

    const handleSendImage = (imageUri: string) => {
        const newMessage: Message = {
            id: `img${Date.now()}`,
            imageUri,
            sender: 'owner',
            timestamp: new Date(),
            messageType: 'image',
        };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setShowCamera(false);
    };

    const handleOpenBookingForm = () => {
        router.push({
            pathname: '/(tabs)/chats/bookingDetailsOwner',
            params: {
                chatId: chatId,
                sitterName: sitterName
            },
        });
    };

    const handleOpenCamera = async () => {
        if (!permission) return;
        if (!permission.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                alert("Camera permission is required to take photos.");
                return;
            }
        }
        setShowCamera(true);
    };

    const handleTakePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
                if (photo?.uri) {
                    handleSendImage(photo.uri);
                }
            } catch (error) {
                console.error("Failed to take picture: ", error);
                alert("Failed to take picture. Please try again.");
            }
        }
    };

    const handleBookingResponse = (messageId: string, response: 'accepted' | 'declined') => {
        setMessages(prevMessages =>
            prevMessages.map(msg => {
                if (msg.id === messageId && msg.bookingDetails && msg.sender === 'user') {
                    return {
                        ...msg,
                        bookingDetails: {
                            ...msg.bookingDetails,
                            status: response,
                        },
                    };
                }
                return msg;
            })
        );
        const responseText = `Booking ${response}.`;
        const responseMessage: Message = {
            id: `resp-${Date.now()}`,
            text: responseText,
            sender: 'owner',
            timestamp: new Date(),
            messageType: 'text',
        };
        setMessages(prevMessages => [responseMessage, ...prevMessages]);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isOwnerMessage = item.sender === 'owner';

        if (item.messageType === 'booking_confirmation' && item.bookingDetails) {
            const details = item.bookingDetails;
            return (
                <View style={[styles.messageBubble, isOwnerMessage ? styles.ownerMessage : styles.sitterMessage, styles.bookingCardContainer]}>
                    <Card style={styles.bookingCard}>
                        <Card.Content>
                            <Title style={styles.bookingTitle}>Booking Proposal</Title>
                            {isOwnerMessage ? (
                                <Text style={styles.bookingText}>To: {details.sitterName || 'Pet Sitter'}</Text>
                            ) : (
                                <Text style={styles.bookingText}>From: {details.ownerName || 'Pet Owner'}</Text>
                            )}
                            <View style={styles.petChipsContainer_Chat}>
                                {details.petNames.map(name => (
                                    <Chip key={name} icon="paw" style={styles.petChip_Chat} textStyle={styles.petChipText_Chat}>{name}</Chip>
                                ))}
                            </View>
                            <Text style={styles.bookingText}>Dates: {details.fromDate} to {details.toDate}</Text>
                            <Text style={styles.bookingText}>Location: {details.location === 'owner_home' ? "Owner\'s Home" : details.location === 'sitter_home' ? "Sitter\'s Home" : details.location}</Text>
                            <Text style={styles.bookingText}>Package: {details.servicePackage}</Text>
                            <Text style={styles.bookingPrice}>Total: ${details.totalPrice.toFixed(2)}</Text>

                            {details.status === 'pending' && !isOwnerMessage && (
                                <View style={styles.bookingActions}>
                                    <PaperButton mode="contained" onPress={() => handleBookingResponse(item.id, 'accepted')} style={styles.acceptButton} labelStyle={styles.buttonLabel}>
                                        <CheckCircle size={16} color={colors.white} /> Accept
                                    </PaperButton>
                                    <PaperButton mode="outlined" onPress={() => handleBookingResponse(item.id, 'declined')} style={styles.declineButton} labelStyle={styles.buttonLabelDark}>
                                        <XCircle size={16} color={colors.textDark} /> Decline
                                    </PaperButton>
                                </View>
                            )}
                            {details.status === 'pending' && isOwnerMessage && (
                                <Text style={styles.pendingResponseText}>Waiting for Sitter to respond...</Text>
                            )}
                            {details.status === 'accepted' && (
                                <Text style={styles.statusTextAccepted}>Booking Accepted!</Text>
                            )}
                            {details.status === 'declined' && (
                                <Text style={styles.statusTextDeclined}>Booking Declined.</Text>
                            )}
                        </Card.Content>
                    </Card>
                </View>
            );
        }

        return (
            <View style={[styles.messageBubble, isOwnerMessage ? styles.ownerMessage : styles.sitterMessage]}>
                {item.text ? (
                    <Text style={[styles.messageText, isOwnerMessage ? styles.ownerMessageText : styles.sitterMessageText]}>
                        {item.text}
                    </Text>
                ) : null}
                {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.chatImage} />
                ) : null}
                <Text style={styles.messageTimestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (showCamera) {
        if (permission?.granted) {
            return (
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showCamera}
                    onRequestClose={() => setShowCamera(false)}
                >
                    <View style={styles.cameraContainer}>
                        <CameraView
                            style={styles.cameraPreview}
                            ref={cameraRef}
                            facing={"back"}
                            flash={"off"}
                            autofocus="on"
                        />
                        <View style={styles.cameraControls}>
                            <PaperButton onPress={() => setShowCamera(false)} mode="outlined" style={styles.cameraButton} labelStyle={{ color: colors.white }}>Cancel</PaperButton>
                            <IconButton icon="camera" size={36} onPress={handleTakePicture} iconColor={colors.primary} style={styles.captureButton} />
                            <View style={{ width: 100 }} />
                        </View>
                    </View>
                </Modal>
            );
        } else {
            return (
                <View style={styles.centered}>
                    <Text>{!permission ? 'Requesting camera permissions...' : 'Camera permission is required to use this feature.'}</Text>
                    {permission && !permission.granted && (
                        <PaperButton onPress={requestPermission} mode="contained" style={{ marginTop: 10 }}>Grant Permission</PaperButton>
                    )}
                    <PaperButton onPress={() => setShowCamera(false)} style={{ marginTop: 10 }}>Back to Chat</PaperButton>
                </View>
            );
        }
    }

    return (
        <PaperProvider>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        inverted
                    />
                    <View style={styles.inputContainer}>
                        <IconButton icon={() => <Briefcase color={colors.primary} size={24} />} onPress={handleOpenBookingForm} />
                        <IconButton icon={() => <CameraIcon color={colors.primary} size={24} />} onPress={handleOpenCamera} />
                        <RNTextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                        />
                        <IconButton icon={() => <Send color={colors.primary} size={24} />} onPress={handleSendMessage} disabled={inputText.trim().length === 0} />
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    messagesList: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    messageBubble: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
        marginBottom: 8,
        maxWidth: '80%',
    },
    ownerMessage: {
        backgroundColor: colors.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    sitterMessage: {
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        borderColor: colors.primary,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 16,
    },
    ownerMessageText: {
        color: colors.textLight,
    },
    sitterMessageText: {
        color: colors.textDark,
    },
    chatImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 4,
        alignSelf: 'center',
    },
    messageTimestamp: {
        fontSize: 10,
        color: colors.textSecondary,
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: colors.background,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginHorizontal: 8,
        fontSize: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : undefined,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    cameraPreview: {
        flex: 1,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    cameraButton: {
        borderColor: colors.white,
    },
    captureButton: {
        backgroundColor: colors.white,
    },
    bookingCardContainer: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    bookingCard: {
        width: '100%',
        elevation: 3,
        backgroundColor: colors.white,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    bookingText: {
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 4,
    },
    petChipsContainer_Chat: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
    },
    petChip_Chat: {
        marginRight: 5,
        marginBottom: 5,
        backgroundColor: colors.primary,
    },
    petChipText_Chat: {
        color: colors.white,
        fontSize: 12,
    },
    bookingPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 8,
        marginBottom: 12,
    },
    bookingActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    acceptButton: {
        backgroundColor: colors.primary,
        flex: 1,
        marginRight: 5,
    },
    declineButton: {
        borderColor: colors.textDark,
        borderWidth: 1,
        flex: 1,
        marginLeft: 5,
    },
    buttonLabel: {
        color: colors.white,
        fontSize: 14,
    },
    buttonLabelDark: {
        color: colors.textDark,
        fontSize: 14,
    },
    statusTextAccepted: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginTop: 10,
    },
    statusTextDeclined: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textDark,
        textAlign: 'center',
        marginTop: 10,
    },
    pendingResponseText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
    }
});

export default PetOwnerChatScreen; 