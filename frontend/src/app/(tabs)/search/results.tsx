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
import SitterCard, { Sitter } from '../../../components/search/SitterCard';
import { colors } from '../../../theme';
import { XCircle, Heart } from 'lucide-react-native'; // Icons for swipe actions

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.4;

// Dummy Sitter Data - replace with actual data fetched based on search criteria
const DUMMY_SITTERS: Sitter[] = [
    { id: '1', name: 'Alice Wonderland', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D&w=1000&q=80', distance: '2 km', rating: 4.8, supportedPets: ['Dogs', 'Cats'], personality: 'Friendly & Energetic' },
    { id: '2', name: 'Bob The Builder', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D&w=1000&q=80', distance: '5 km', rating: 4.5, supportedPets: ['Dogs'], personality: 'Calm & Patient' },
    { id: '3', name: 'Charlie Brown', imageUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D&w=1000&q=80', distance: '1.5 km', rating: 4.9, supportedPets: ['Cats', 'Birds'], personality: 'Playful & Caring' },
    { id: '4', name: 'Diana Prince', imageUrl: 'https://images.unsplash.com/photo-1500099817043-b746da694ada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvcnRyYWl0JTIwd29tYW58ZW58MHx8MHx8fDA%3D&w=1000&q=80', distance: '3 km', rating: 4.7, supportedPets: ['Dogs', 'Small Animals'], personality: 'Reliable & Loving' },
];

const SearchResultsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams(); // To potentially get search criteria

    const [sitters, setSitters] = useState<Sitter[]>(DUMMY_SITTERS);
    const [currentIndex, setCurrentIndex] = useState(0);

    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);

    const currentSitter = sitters[currentIndex];

    const onSwipeComplete = useCallback((liked: boolean) => {
        console.log(liked ? 'Liked:' : 'Disliked:', sitters[currentIndex]?.name);
        setCurrentIndex(prevIndex => prevIndex + 1);
        translateX.value = 0; // Reset for next card
        rotate.value = 0;
    }, [currentIndex, sitters, translateX, rotate]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            rotate.value = interpolate(event.translationX, [-screenWidth / 2, screenWidth / 2], [-15, 15], Extrapolate.CLAMP);
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const liked = event.translationX > 0;
                translateX.value = withSpring(Math.sign(event.translationX) * screenWidth * 1.5, {}, () => {
                    runOnJS(onSwipeComplete)(liked);
                });
                rotate.value = withSpring(Math.sign(event.translationX) * 60);
            } else {
                translateX.value = withSpring(0);
                rotate.value = withSpring(0);
            }
        });

    const animatedCardStyle = useAnimatedStyle(() => {
        // Explicitly type the transform array
        const transform: TransformsStyle['transform'] = [
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ];
        return {
            transform,
        };
    });

    const likeOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1], Extrapolate.CLAMP),
    }));

    const nopeOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0], Extrapolate.CLAMP),
    }));

    if (!currentSitter) {
        return (
            <SafeAreaView style={styles.container_empty}>
                <Text style={styles.emptyText}>No more sitters found!</Text>
                <Text style={styles.emptySubText}>Try adjusting your search criteria.</Text>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>{/* Required for gesture handler */}
            <SafeAreaView style={styles.container}>
                <View style={styles.deckContainer}>
                    {sitters.map((sitter, index) => {
                        if (index < currentIndex) return null; // Don't render swiped cards
                        if (index === currentIndex) {
                            return (
                                <GestureDetector gesture={panGesture} key={sitter.id}>
                                    <Animated.View style={[styles.animatedCard, animatedCardStyle]}>
                                        <SitterCard sitter={sitter} />
                                        <Animated.View style={[styles.overlayLabel, styles.likeLabel, likeOpacity]}>
                                            <Heart size={80} color="green" fill="green" />
                                        </Animated.View>
                                        <Animated.View style={[styles.overlayLabel, styles.nopeLabel, nopeOpacity]}>
                                            <XCircle size={80} color="red" fill="red" />
                                        </Animated.View>
                                    </Animated.View>
                                </GestureDetector>
                            );
                        }
                        // Render next card underneath for a stack effect (simplified)
                        if (index === currentIndex + 1) {
                            return (
                                <Animated.View key={sitter.id} style={[styles.animatedCard, styles.nextCard]}>
                                    <SitterCard sitter={sitter} />
                                </Animated.View>
                            );
                        }
                        return null;
                    }).reverse() /* Render top card last */}
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
        // height: screenHeight * 0.75, // Constrain height of deck area
    },
    animatedCard: {
        width: screenWidth * 0.9,
        height: screenHeight * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', // Important for stacking
    },
    nextCard: {
        transform: [{ scale: 0.95 }, { translateY: 30 }], // Simple stack effect
        zIndex: -1, // Ensure it's behind the current card
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
        elevation: Platform.OS === 'android' ? 1001 : undefined, // for Android
    },
    likeLabel: {
        left: '20%',
        transform: [{ rotate: '-15deg' }],
    },
    nopeLabel: {
        right: '20%',
        transform: [{ rotate: '15deg' }],
    },
});

export default SearchResultsScreen; 