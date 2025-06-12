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
import SitterCard from './SitterCard';
import { colors } from '../../../theme';
import { XCircle, Heart } from 'lucide-react-native'; // Icons for swipe actions

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.4;



type Sitter = {
    sitter_user_id: number;
    sitter_id: number;
    name: string;
    distance: number;
    pictures: string[];
    average_rating: number;
    supported_pets: string[];
    personality: string;
    personality_match_score: number;
};


const SearchResultsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams(); // To potentially get search criteria

    const [sitters, setSitters] = useState<Sitter[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);

    const currentSitter = sitters[currentIndex];

    // Load sitters from query params
    useEffect(() => {
  if (params.sitters) {
    try {
      const parsedSitters = JSON.parse(params.sitters as string);
      console.log('Parsed sitters:', parsedSitters);
      setSitters((prev) => {
        const prevJson = JSON.stringify(prev);
        const nextJson = JSON.stringify(parsedSitters);
        return prevJson !== nextJson ? parsedSitters : prev;
      });
    } catch (e) {
      console.error('Invalid sitters JSON', e);
    }
  }
}, [params.sitters]);



    const onSwipeComplete = useCallback(async (liked: boolean) => {
    const currentSitter = sitters[currentIndex];

    
        if (liked) {
            const payload = {
                user_id: params.userId,
                sitter_user_id: currentSitter.sitter_user_id,
                start_date: params.fromDate,
                end_date: params.toDate,
                selected_pets: params.selectedPets
                    ? JSON.parse(params.selectedPets as string).map((pet: any) => pet.id)
                    : [],
                street: params.street || 'Default Street',
                city: params.city || 'Default City',
                postcode: params.postcode || '0000',
                };
            console.log('Booking payload:', payload);
            try {
                const response = await fetch(`http://${process.env.EXPO_PUBLIC_METRO}:3000/search/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Failed to save booking');
                }

                const data = await response.json();
                console.log('Booking saved successfully:', data);
                // You can show a success toast or notification here
            } catch (error) {
                console.error('Error saving booking:', error);
                // You can show an error toast or notification here
            } 
        }

        console.log(liked ? 'Liked:' : 'Disliked:', currentSitter?.name);
        setCurrentIndex(prevIndex => prevIndex + 1);
        translateX.value = 0;
        rotate.value = 0;
    }, [currentIndex, sitters, translateX, rotate, params]);

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
                                <GestureDetector gesture={panGesture} key={sitter.sitter_id}>
                                    <Animated.View style={[styles.animatedCard, animatedCardStyle]}>
                                                  <SitterCard
                                                    sitter={{
                                                    id: sitter.sitter_user_id.toString(),
                                                    personality_match_score: sitter.personality_match_score,
                                                    name: sitter.name,
                                                    imageUrl: sitter.pictures?.[0] || 'https://via.placeholder.com/400x600.png?text=Pet+Sitter',
                                                    distance: sitter.distance.toFixed(1) + ' km',
                                                    rating: sitter.average_rating,
                                                    supportedPets: sitter.supported_pets,
                                                    personality: sitter.personality
                                                    }}
                                                />
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
                                <Animated.View key={sitter.sitter_id} style={[styles.animatedCard, styles.nextCard]}>
                                    <SitterCard
                                        sitter={{
                                            id: sitter.sitter_user_id.toString(),
                                            name: sitter.name,
                                            personality_match_score: sitter.personality_match_score,
                                            imageUrl: sitter.pictures?.[0] || 'https://via.placeholder.com/400x600.png?text=Pet+Sitter',
                                            distance: `${sitter.distance.toFixed(1)} km`,
                                            rating: sitter.average_rating,
                                            supportedPets: sitter.supported_pets,
                                            personality: sitter.personality
                                        }}/>

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