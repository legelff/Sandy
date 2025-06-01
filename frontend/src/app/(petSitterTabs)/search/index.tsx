import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform, TransformsStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate,
    runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import BookingRequestCard, { BookingRequest } from '../../../components/search/BookingRequestCard'; // Adjusted import
import { colors } from '../../../theme';
import { XCircle, Heart, CheckCircle } from 'lucide-react-native'; // Added CheckCircle for accept

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.4;

// Dummy Booking Request Data - replace with actual data fetched
const DUMMY_BOOKING_REQUESTS: BookingRequest[] = [
    {
        id: 'req1',
        requesterName: 'Alice Wonderland',
        requesterImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
        petNames: ['Fluffy (Dog)', 'Whiskers (Cat)'],
        distance: '2 km away',
        location: 'City Park Area',
        rating: 4.8,
        bookingStartDate: '2023-11-10',
        bookingEndDate: '2023-11-12',
        petPersonalities: ['Friendly', 'Playful', 'Needs regular walks']
    },
    {
        id: 'req2',
        requesterName: 'Bob The Builder',
        requesterImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvcnRyYWl0fGVufDB8fDB8fHww&w=1000&q=80',
        petNames: ['Buddy (Dog)'],
        distance: '5 km away',
        location: 'Suburbia Gardens',
        rating: 4.5,
        bookingStartDate: '2023-11-15',
        bookingEndDate: '2023-11-17',
        petPersonalities: ['Calm', 'Loves cuddles', 'Good with children']
    },
    {
        id: 'req3',
        requesterName: 'Charlie Brown',
        // No image for Charlie
        petNames: ['Goldie (Fish)'],
        distance: '1.5 km away',
        location: 'Downtown Apartments',
        bookingStartDate: '2023-11-20',
        bookingEndDate: '2023-11-21',
        petPersonalities: ['Low maintenance']
    },
];

/**
 * PetSitterRequestScreen displays incoming booking requests for pet sitters in a swipeable card interface.
 */
const PetSitterRequestScreen: React.FC = () => {
    const router = useRouter();
    // const params = useLocalSearchParams(); // If you need to filter requests based on some params

    const [requests, setRequests] = useState<BookingRequest[]>(DUMMY_BOOKING_REQUESTS);
    const [currentIndex, setCurrentIndex] = useState(0);

    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);

    const currentRequest = requests[currentIndex];

    const onSwipeComplete = useCallback((action: 'accepted' | 'rejected') => {
        console.log(action === 'accepted' ? 'Accepted:' : 'Rejected:', requests[currentIndex]?.requesterName, requests[currentIndex]?.id);
        // TODO: Implement backend call to accept/reject the request
        setCurrentIndex(prevIndex => prevIndex + 1);
        translateX.value = 0; // Reset for next card
        rotate.value = 0;
    }, [currentIndex, requests, translateX, rotate]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            rotate.value = interpolate(event.translationX, [-screenWidth / 2, screenWidth / 2], [-15, 15], Extrapolate.CLAMP);
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const accepted = event.translationX > 0;
                translateX.value = withSpring(Math.sign(event.translationX) * screenWidth * 1.5, {}, () => {
                    runOnJS(onSwipeComplete)(accepted ? 'accepted' : 'rejected');
                });
                rotate.value = withSpring(Math.sign(event.translationX) * 60);
            } else {
                translateX.value = withSpring(0);
                rotate.value = withSpring(0);
            }
        });

    const animatedCardStyle = useAnimatedStyle(() => {
        const transform: TransformsStyle['transform'] = [
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ];
        return {
            transform,
        };
    });

    const acceptOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1], Extrapolate.CLAMP),
    }));

    const rejectOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0], Extrapolate.CLAMP),
    }));

    if (!currentRequest) {
        return (
            <SafeAreaView style={styles.container_empty}>
                <Text style={styles.emptyText}>No more booking requests!</Text>
                <Text style={styles.emptySubText}>Check back later for new requests.</Text>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.deckContainer}>
                    {requests.map((request, index) => {
                        if (index < currentIndex) return null;
                        if (index === currentIndex) {
                            return (
                                <GestureDetector gesture={panGesture} key={request.id}>
                                    <Animated.View style={[styles.animatedCard, animatedCardStyle]}>
                                        <BookingRequestCard request={request} />
                                        <Animated.View style={[styles.overlayLabel, styles.acceptLabel, acceptOpacity]}>
                                            <CheckCircle size={80} color={colors.primary} fill={colors.primary} />
                                        </Animated.View>
                                        <Animated.View style={[styles.overlayLabel, styles.rejectLabel, rejectOpacity]}>
                                            <XCircle size={80} color="#dc2626" fill="#dc2626" />
                                        </Animated.View>
                                    </Animated.View>
                                </GestureDetector>
                            );
                        }
                        if (index === currentIndex + 1) {
                            return (
                                <Animated.View key={request.id} style={[styles.animatedCard, styles.nextCard]}>
                                    <BookingRequestCard request={request} />
                                </Animated.View>
                            );
                        }
                        return null;
                    }).reverse()}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container_empty: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    deckContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
    },
    animatedCard: {
        width: screenWidth * 0.9,
        height: screenHeight * 0.75, // Adjusted height for potentially more content
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    nextCard: {
        transform: [{ scale: 0.95 }, { translateY: 35 }], // Adjusted for new height
        zIndex: -1,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 16,
        color: colors.textDark,
        textAlign: 'center',
    },
    overlayLabel: {
        position: 'absolute',
        top: '40%',
        zIndex: 1000,
        elevation: Platform.OS === 'android' ? 1001 : undefined,
    },
    acceptLabel: {
        left: '20%',
        transform: [{ rotate: '-15deg' }],
    },
    rejectLabel: {
        right: '20%',
        transform: [{ rotate: '15deg' }],
    },
});

export default PetSitterRequestScreen; 