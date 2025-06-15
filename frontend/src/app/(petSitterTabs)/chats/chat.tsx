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

interface Message {
    id: string;
    text?: string;
    imageUri?: string;
    imageUrl?: string; // Add this for backend-served images
    sender: 'user' | 'owner';
    timestamp: Date;
    bookingDetails?: BookingConfirmationDetails;
    messageType?: 'text' | 'image' | 'booking_confirmation';
}

interface BookingConfirmationDetails {
    chatId: string;
    ownerName: string;
    petNames: string[];
    fromDate: string;
    toDate: string;
    location: string;
    servicePackage: string;
    totalPrice: number;
    status: 'pending' | 'accepted' | 'declined';
}

const SOCKET_URL = 'http://localhost:3000';

const PetSitterChatScreen: React.FC = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const { chatId, sitterName: ownerNameFromNav, petName, bookingConfirmation: bookingConfirmationString } = params as {
        chatId: string;
        sitterName: string;
        petName?: string;
        bookingConfirmation?: string;
    };

    const ownerName = ownerNameFromNav || "Pet Owner";

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>('');
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);
    const [cameraReady, setCameraReady] = useState<boolean>(false);
    const socketRef = useRef<any>(null);
    const { user, token } = useAuthStore();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${ownerName} & ${petName || 'Pet'}`,
        });
    }, [navigation, ownerName, petName]);

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
                console.error('Failed to parse booking confirmation:', error);
            }
        }
    }, [bookingConfirmationString]);

    useEffect(() => {
        // Fetch messages from backend
        if (!token || !user) return;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://localhost:3000/chat/${chatId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch messages');
                const data = await res.json();
                // Map backend data to Message[]
                const mapped = data.map((m: any) => ({
                    id: m.id.toString(),
                    text: m.content,
                    sender: m.sender_id === user.id ? 'user' : 'owner',
                    timestamp: new Date(m.timestamp),
                    messageType: 'text',
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
                        text: msg.content,
                        sender: msg.sender_id === user.id ? 'user' : 'owner',
                        timestamp: new Date(msg.timestamp),
                        messageType: 'text',
                    },
                    ...prev,
                ]);
            });
            socketRef.current.on('chat history', (payload: any) => {
                const mapped = payload.messages.map((m: any) => ({
                    id: m.id.toString(),
                    text: m.content,
                    sender: m.sender_id === user.id ? 'user' : 'owner',
                    timestamp: new Date(m.timestamp),
                    messageType: 'text',
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
            socketRef.current.emit('chat message', {
                conversationId: chatId,
                content: inputText.trim(),
            });
        }
        setInputText('');
    };

    const handleSendImage = async (imageUri: string) => {
        try {
            // Log the imageUri and file object for debugging
            const fileObj = {
                uri: imageUri,
                name: 'chat-image.jpg',
                type: 'image/jpeg',
            };
            console.log('Uploading image with file object:', fileObj);
            if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('file://')) {
                console.warn('Image URI is invalid or not a file:// URI:', imageUri);
            }
            const formData = new FormData();
            formData.append('image', fileObj as any);
            const res = await fetch('http://localhost:3000/chat/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Image upload failed');
            const data = await res.json();
            if (socketRef.current) {
                socketRef.current.emit('chat message', {
                    conversationId: chatId,
                    content: '',
                    imageUrl: data.url,
                });
            }
            setShowCamera(false);
        } catch (err) {
            Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
            setShowCamera(false);
        }
    };

    const handleBook = () => {
        const petNamesArray = petName ? [petName] : [];
        router.push({
            pathname: '/(petSitterTabs)/chats/bookingDetails',
            params: {
                chatId: chatId,
                ownerName: ownerName,
                petNames: JSON.stringify(petNamesArray)
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
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 }); // Do NOT use base64: true
                if (photo?.uri && typeof photo.uri === 'string' && photo.uri.startsWith('file://')) {
                    handleSendImage(photo.uri);
                } else if (photo?.base64) {
                    // Convert base64 to file and upload
                    const fileUri = FileSystem.cacheDirectory + 'chat-image.jpg';
                    // Remove prefix if present
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
                if (msg.id === messageId && msg.bookingDetails && msg.sender === 'owner') {
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
        const responseText = `Booking ${response} by you (sitter).`;
        const responseMessage: Message = {
            id: `resp-${Date.now()}`,
            text: responseText,
            sender: 'user',
            timestamp: new Date(),
            messageType: 'text',
        };
        setMessages(prevMessages => [responseMessage, ...prevMessages]);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUserMessage = item.sender === 'user';

        if (item.messageType === 'booking_confirmation' && item.bookingDetails) {
            const details = item.bookingDetails;
            return (
                <View style={[styles.messageBubble, isUserMessage ? styles.userMessage : styles.sitterMessage, styles.bookingCardContainer]}>
                    <Card style={styles.bookingCard}>
                        <Card.Content>
                            <Title style={styles.bookingTitle}>Booking Proposal</Title>
                            <Text style={styles.bookingText}>For: {details.ownerName}</Text>
                            <View style={styles.petChipsContainer_Chat}>
                                {details.petNames.map(name => (
                                    <Chip key={name} icon="paw" style={styles.petChip_Chat} textStyle={styles.petChipText_Chat}>{name}</Chip>
                                ))}
                            </View>
                            <Text style={styles.bookingText}>Dates: {details.fromDate} to {details.toDate}</Text>
                            <Text style={styles.bookingText}>Location: {details.location === 'owner_home' ? "Owner\'s Home" : details.location === 'sitter_home' ? "Sitter\'s Home" : details.location}</Text>
                            <Text style={styles.bookingText}>Package: {details.servicePackage}</Text>
                            <Text style={styles.bookingPrice}>Total: ${details.totalPrice.toFixed(2)}</Text>

                            {details.status === 'pending' && item.sender === 'owner' && (
                                <View style={styles.bookingActions}>
                                    <PaperButton mode="contained" onPress={() => handleBookingResponse(item.id, 'accepted')} style={styles.acceptButton} labelStyle={styles.buttonLabel}>
                                        <CheckCircle size={16} color={colors.white} /> Accept
                                    </PaperButton>
                                    <PaperButton mode="outlined" onPress={() => handleBookingResponse(item.id, 'declined')} style={styles.declineButton} labelStyle={styles.buttonLabelDark}>
                                        <XCircle size={16} color={colors.textDark} /> Decline
                                    </PaperButton>
                                </View>
                            )}
                            {details.status === 'pending' && item.sender === 'user' && (
                                <Text style={styles.pendingOwnerActionText}>Waiting for owner to respond...</Text>
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
            <View style={[styles.messageBubble, isUserMessage ? styles.userMessage : styles.sitterMessage]}>
                {item.text ? (
                    <Text style={[styles.messageText, isUserMessage ? styles.userMessageText : styles.sitterMessageText]}>
                        {item.text}
                    </Text>
                ) : null}
                {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.chatImage} />
                ) : null}
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.chatImage} />
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
                        <IconButton icon={() => <Briefcase color={colors.primary} size={24} />} onPress={handleBook} />
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
    userMessage: {
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
    userMessageText: {
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
    userMessagebookingCard: {
    },
    sitterMessagebookingCard: {
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
    pendingOwnerActionText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
    }
});

export default PetSitterChatScreen;