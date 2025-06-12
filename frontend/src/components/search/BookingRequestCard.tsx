import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing } from '../../theme'; // Removed typography
import { MapPin, CalendarDays, PawPrint, Smile, Star } from 'lucide-react-native';

export interface BookingRequest {
  id: string;
  requesterName: string;
  requesterImageUrl?: string;
  petNames: string[];
  distance: string;
  location: string;
  rating?: number;
  bookingStartDate: string;
  bookingEndDate: string;
  petPersonalities: string[];
}


interface BookingRequestCardProps {
    request: BookingRequest;
}

/**
 * BookingRequestCard displays information about a pet sitting booking request.
 */
const BookingRequestCard: React.FC<BookingRequestCardProps> = ({ request }) => {
    return (
        <View style={styles.cardContainer}>
            <Image
                source={request.requesterImageUrl ? { uri: request.requesterImageUrl } : { uri: 'https://placecats.com/300/200' }} // Updated placeholder
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.requesterName}>{request.requesterName}'s Request</Text>

                <View style={styles.detailRow}>
                    <PawPrint size={16} color={colors.primary} style={styles.icon} />
                    <Text style={styles.detailText}>Pets: {request.petNames.join(', ')}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MapPin size={16} color={colors.primary} style={styles.icon} />
                    <Text style={styles.detailText}>{request.distance} - {request.location}</Text>
                </View>

                {request.rating !== undefined && (
                    <View style={styles.detailRow}>
                        <Star size={16} color={colors.primary} style={styles.icon} />
                        <Text style={styles.detailText}>Owner Rating: {request.rating.toFixed(1)} / 5</Text>
                    </View>
                )}


                <View style={styles.detailRow}>
                    <CalendarDays size={16} color={colors.primary} style={styles.icon} />
                    <Text style={styles.detailText}>Dates: {request.bookingStartDate} to {request.bookingEndDate}</Text>
                </View>

                {request.petPersonalities.length > 0 && (
                    <View style={styles.detailRow}>
                        <Smile size={16} color={colors.primary} style={styles.icon} />
                        <Text style={styles.detailText}>Pet personality: {request.petPersonalities.join(', ')}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white, // Changed to colors.white
        borderRadius: 12,
        padding: spacing.md,
        marginHorizontal: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: spacing.md,
        backgroundColor: colors.background,
    },
    infoContainer: {
        flex: 1,
    },
    requesterName: {
        fontSize: 18, // Default font size
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    icon: {
        marginRight: spacing.sm,
    },
    detailText: {
        fontSize: 14, // Default font size
        color: colors.textSecondary, // Changed to colors.textSecondary
        flexShrink: 1,
    },
});

export default BookingRequestCard; 