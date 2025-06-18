import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput as RNTextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, IconButton, Button as PaperButton, Card, Chip, Title } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { colors } from '../../../theme';
import { Camera as CameraIcon, Send, Briefcase, CheckCircle, XCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import io from 'socket.io-client';
import { useAuthStore } from '../../../store/useAuthStore';
import * as FileSystem from 'expo-file-system';


interface MessageContent {
    type: 'text' | 'image' | 'booking_confirmation';
    text?: string;
    url?: string;
    bookingDetails?: BookingConfirmationDetails;
}

interface Message {
    id: string;
    content: MessageContent;
    sender: 'user' | 'owner';
    timestamp: Date;
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

const SOCKET_URL = `http://${process.env.EXPO_PUBLIC_METRO}:3000`;

// Helper function to safely parse message content
const parseMessageContent = (content: string): MessageContent => {
    try {
        // Try to parse as JSON first
        const parsed = JSON.parse(content);
        return parsed;
    } catch (error) {
        // If parsing fails, treat as plain text
        return {
            type: 'text',
            text: content
        };
    }
};

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

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>('');
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [cameraReady, setCameraReady] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);
    const socketRef = useRef<any>(null);
    const { user, token } = useAuthStore();
    const imageUpload = useRef<string | null>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: sitterName,
        });
    }, [navigation, sitterName]);

    useEffect(() => {
        if (bookingConfirmationString && typeof bookingConfirmationString === 'string') {
            try {
                const bookingDetails: BookingConfirmationDetails = JSON.parse(bookingConfirmationString);
                const content: MessageContent = {
                    type: 'booking_confirmation',
                    bookingDetails
                };
                const bookingMessage: Message = {
                    id: `booking-${Date.now()}`,
                    content: content,
                    sender: 'owner',
                    timestamp: new Date(),
                };
                setMessages(prevMessages => [bookingMessage, ...prevMessages]);
            } catch (error) {
                console.error("Failed to parse booking confirmation:", error);
            }
        }
    }, [bookingConfirmationString]);

    useEffect(() => {
        // Fetch messages from backend
        if (!token || !user) return;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/chat/${chatId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch messages');
                const data = await res.json();
                // Map backend data to Message[]
                const mapped = data.map((m: any) => ({
                    id: m.id.toString(),
                    content: parseMessageContent(m.content),
                    sender: m.sender_id === user.id ? 'owner' : 'user',
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(mapped.reverse());
            } catch (e) {
                setMessages([]);
            }
        };
        fetchMessages();
    }, [chatId, token, user]);

    useEffect(() => {
        // Connect to socket
        if (!token || !user) return;
        const connectSocket = async () => {
            socketRef.current = io(SOCKET_URL, {
                auth: { token },
            });
            socketRef.current.emit('join conversation', { conversationId: chatId });
            socketRef.current.on('chat message', (msg: any) => {
                setMessages(prev => [
                    {
                        id: msg.id.toString(),
                        content: parseMessageContent(msg.content),
                        sender: msg.sender_id === user.id ? 'owner' : 'user',
                        timestamp: new Date(msg.timestamp),
                    },
                    ...prev,
                ]);
            });
            socketRef.current.on('chat history', (payload: any) => {
                const mapped = payload.messages.map((m: any) => ({
                    id: m.id.toString(),
                    content: parseMessageContent(m.content),
                    sender: m.sender_id === user.id ? 'owner' : 'user',
                    timestamp: new Date(m.timestamp),
                }));
                setMessages(mapped.reverse());
            });
        };
        connectSocket();
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [chatId, token, user]);

    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;

        if (socketRef.current) {
            const content: MessageContent = {
                type: 'text',
                text: inputText.trim()
            };
            socketRef.current.emit('chat message', {
                conversationId: chatId,
                content: JSON.stringify(content)
            });
        }

        setInputText('');
    };

    const handleSendImage = async (imageUri: string, base64Data?: string) => {
        return new Promise((resolve, reject) => {
            try {
                let formData = new FormData();

                if (Platform.OS === 'web' && base64Data) {
                    // Clean and validate base64 data
                    const cleanBase64 = base64Data.split(';base64,').pop() || '';
                    try {
                        const byteCharacters = atob(cleanBase64);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'image/jpeg' });
                        formData.append('image', blob, 'chat-image.jpg');
                    } catch (e) {
                        console.error('Invalid base64:', e);
                        throw new Error('Invalid image data');
                    }
                } else {
                    // Native: use file URI
                    formData.append('image', {
                        uri: imageUri,
                        type: 'image/jpeg',
                        name: 'chat-image.jpg',
                    } as any);
                }

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `http://${process.env.EXPO_PUBLIC_METRO}:3000/chat/upload`); xhr.onload = function () {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.url && socketRef.current) {
                                // Ensure the URL uses the correct host and port
                                const imageUrl = data.url.replace('localhost:8081', `${process.env.EXPO_PUBLIC_METRO}:3000`);
                                const content: MessageContent = {
                                    type: 'image',
                                    url: imageUrl
                                };
                                socketRef.current.emit('chat message', {
                                    conversationId: chatId,
                                    content: JSON.stringify(content)
                                });
                                setShowCamera(false);
                                resolve({ ...data, url: imageUrl });
                            } else {
                                throw new Error('Invalid response format');
                            }
                        } catch (e) {
                            reject(new Error('Failed to parse response'));
                        }
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };

                xhr.onerror = function () {
                    reject(new Error('Network error'));
                };

                xhr.send(formData);
            } catch (error) {
                console.error('Error preparing upload:', error);
                Alert.alert('Upload Failed', 'Could not prepare image for upload.');
                setShowCamera(false);
                reject(error);
            }
        }).catch(error => {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
            setShowCamera(false);
        });
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
        if (cameraRef.current && cameraReady) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: Platform.OS === 'web' });
                if (Platform.OS === 'web' && photo?.base64) {
                    // Web: pass base64 data
                    handleSendImage('', 'data:image/jpeg;base64,' + photo.base64);
                } else if (photo?.uri && typeof photo.uri === 'string' && photo.uri.startsWith('file://')) {
                    handleSendImage(photo.uri);
                } else if (photo?.base64) {
                    // Native fallback (should not happen)
                    const fileUri = FileSystem.cacheDirectory + 'chat-image.jpg';
                    let base64Data = photo.base64;
                    if (base64Data.startsWith('data:image')) {
                        base64Data = base64Data.split(',')[1];
                    }
                    await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
                    handleSendImage(fileUri);
                } else {
                    console.warn('Camera did not return a file:// URI or base64:', photo);
                    Alert.alert('Camera Error', 'Could not get a valid file URI for the photo.');
                }
            } catch (error) {
                console.error('Failed to take picture:', error);
                Alert.alert('Camera Error', error?.message || 'Failed to take picture.');
            }
        } else {
            Alert.alert('Camera not ready', 'Please wait for the camera to initialize.');
        }
    };


    const handleBookingResponse = (messageId: string, response: 'accepted' | 'declined') => {
        setMessages(prevMessages =>
            prevMessages.map(msg => {
                if (msg.id === messageId && msg.content.type === 'booking_confirmation' && msg.content.bookingDetails && msg.sender === 'user') {
                    return {
                        ...msg,
                        content: {
                            ...msg.content,
                            bookingDetails: {
                                ...msg.content.bookingDetails,
                                status: response,
                            },
                        },
                    };
                }
                return msg;
            })
        );

        const responseContent: MessageContent = {
            type: 'text',
            text: `Booking ${response} by you (owner).`
        };

        const responseMessage: Message = {
            id: `resp-${Date.now()}`,
            content: responseContent,
            sender: 'owner',
            timestamp: new Date()
        };

        setMessages(prevMessages => [responseMessage, ...prevMessages]);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isOwnerMessage = item.sender === 'owner';

        if (item.content.type === 'booking_confirmation' && item.content.bookingDetails) {
            const details = item.content.bookingDetails;
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
                            <Text style={styles.bookingText}>Location: {details.location === 'owner_home' ? "Owner's Home" : details.location === 'sitter_home' ? "Sitter's Home" : details.location}</Text>
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
                {item.content.type === 'text' && item.content.text && (
                    <Text style={[styles.messageText, isOwnerMessage ? styles.ownerMessageText : styles.sitterMessageText]}>
                        {item.content.text}
                    </Text>
                )}
                {item.content.type === 'image' && item.content.url && (
                    <Image
                        source={{
                            uri: item.content.url.startsWith('http')
                                ? item.content.url
                                : `http://${process.env.EXPO_PUBLIC_METRO}:3000${item.content.url}`
                        }}
                        style={styles.chatImage}
                    />
                )}
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
                            onCameraReady={() => setCameraReady(true)}
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
    bookingConfirmation: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: colors.background,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    bookingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
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
    },
    bookingCardContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
    },
    bookingCard: {
        backgroundColor: colors.white,
        elevation: 2,
        borderRadius: 12,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.primary,
    },
});

export default PetOwnerChatScreen;