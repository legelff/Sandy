import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput as RNTextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Text, Title, IconButton, Button as PaperButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { colors } from '../../../theme';
import { Camera as CameraIcon, Send, Briefcase } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface Message {
    id: string;
    text?: string;
    imageUri?: string;
    sender: 'user' | 'sitter';
    timestamp: Date;
}

// Dummy messages for a given chat
const DUMMY_MESSAGES: Message[] = [
    { id: 'm1', text: 'Hello! I saw you liked my profile for Buddy.', sender: 'sitter', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'm2', text: 'Hi Alice! Yes, Buddy is very excited.', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
    { id: 'm3', text: 'Great! Do the proposed dates and service work for you?', sender: 'sitter', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    { id: 'm4', text: 'Yes, they look perfect!', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
];

const ChatScreen: React.FC = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const { chatId, sitterName, petName } = params as { chatId: string; sitterName: string; petName?: string };

    const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
    const [inputText, setInputText] = useState<string>('');
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${sitterName} & ${petName || 'Pet'}`,
        });
    }, [navigation, sitterName, petName]);

    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;
        const newMessage: Message = {
            id: `msg${Date.now()}`,
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setInputText('');
        console.log('Sent message:', newMessage);
    };

    const handleSendImage = (imageUri: string) => {
        const newMessage: Message = {
            id: `img${Date.now()}`,
            imageUri,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setShowCamera(false);
        console.log('Sent image:', newMessage);
    };

    const handleBook = () => {
        console.log(`Booking initiated for chat ID: ${chatId} with ${sitterName}`);
    };

    const handleOpenCamera = async () => {
        if (!permission) {
            return;
        }
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
                if (photo) {
                    handleSendImage(photo.uri);
                }
            } catch (error) {
                console.error("Failed to take picture: ", error);
                alert("Failed to take picture. Please try again.");
            }
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.sitterMessage]}>
            {item.text && (
                <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.sitterMessageText]}>
                    {item.text}
                </Text>
            )}
            {item.imageUri && (
                <Image source={{ uri: item.imageUri }} style={styles.chatImage} />
            )}
            <Text style={styles.messageTimestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    if (showCamera) {
        if (!permission || !permission.granted) {
            return (
                <View style={styles.centered}>
                    <Text>{!permission ? 'Loading permissions...' : 'Camera permission denied.'}</Text>
                    <PaperButton onPress={() => setShowCamera(false)}>Back to Chat</PaperButton>
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
                        <IconButton icon={() => <Send color={colors.primary} size={24} />} onPress={handleSendMessage} disabled={inputText.trim().length === 0 && !showCamera} />
                    </View>
                </KeyboardAvoidingView>

                {showCamera && permission && permission.granted && (
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
                )}
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
        backgroundColor: colors.white,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginHorizontal: 8,
        color: colors.textDark,
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    cameraButton: {
        width: 100,
        borderColor: colors.white,
    },
    captureButton: {
        backgroundColor: colors.white,
        borderRadius: 35,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen; 