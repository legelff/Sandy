import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigation.types';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { HeaderComponent } from '../components/layout/HeaderComponent';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { StyledText } from '../components/common/StyledText';
import { FooterLayout } from '../components/layout/FooterLayout';
import { colors, spacing, borderRadius } from '../theme/theme';
import { Plus } from 'lucide-react-native';

interface PetFormData {
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    description: string;
}

type AddEditPetScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEditPet'>;
type AddEditPetScreenRouteProp = RouteProp<RootStackParamList, 'AddEditPet'>;

export const AddEditPetScreen = () => {
    const navigation = useNavigation<AddEditPetScreenNavigationProp>();
    const route = useRoute<AddEditPetScreenRouteProp>();
    const isEditing = !!route.params?.petId;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PetFormData>({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        description: '',
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            // TODO: Implement save logic
            navigation.navigate('CreateProfileFlow');
        } catch (error) {
            // TODO: Handle error
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.species.trim() !== '' &&
            formData.breed.trim() !== ''
        );
    };

    return (
        <ScreenContainer>
            <HeaderComponent
                title={isEditing ? 'Edit Pet Details' : 'Add Pet Details'}
                showBackButton
            />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <StyledText
                        variant="body"
                        color="grey700"
                        style={styles.subtitle}>
                        Provide your pet's information.
                    </StyledText>

                    <View style={styles.imageSection}>
                        <StyledText variant="caption" color="grey700">
                            Pet Photos
                        </StyledText>
                        <View style={styles.imageGrid}>
                            <Button
                                variant="outline"
                                icon="Plus"
                                onPress={() => {
                                    // TODO: Implement image picker
                                }}
                                style={styles.addImageButton} title={''} />
                        </View>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Pet Name"
                            placeholder="Enter your pet's name"
                            value={formData.name}
                            onChangeText={(text) =>
                                setFormData({ ...formData, name: text })
                            }
                        />

                        <Input
                            label="Species"
                            placeholder="e.g., Dog, Cat, Bird"
                            value={formData.species}
                            onChangeText={(text) =>
                                setFormData({ ...formData, species: text })
                            }
                        />

                        <Input
                            label="Breed"
                            placeholder="e.g., Golden Retriever, Persian"
                            value={formData.breed}
                            onChangeText={(text) =>
                                setFormData({ ...formData, breed: text })
                            }
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Input
                                    label="Age"
                                    placeholder="Years"
                                    value={formData.age}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, age: text })
                                    }
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Input
                                    label="Weight"
                                    placeholder="kg"
                                    value={formData.weight}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, weight: text })
                                    }
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <Input
                            label="Description"
                            placeholder="Tell us about your pet's personality, needs, etc."
                            value={formData.description}
                            onChangeText={(text) =>
                                setFormData({ ...formData, description: text })
                            }
                            multiline
                            numberOfLines={4}
                            style={styles.textArea}
                        />
                    </View>

                    <FooterLayout>
                        <Button
                            variant="outline"
                            title="Cancel"
                            onPress={() => navigation.goBack()}
                        />
                        <Button
                            title={isEditing ? 'Save Changes' : 'Add Pet'}
                            onPress={handleSave}
                            loading={loading}
                            disabled={!isFormValid()}
                        />
                    </FooterLayout>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: spacing.md,
    },
    subtitle: {
        marginBottom: spacing.xl,
    },
    imageSection: {
        marginBottom: spacing.xl,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    addImageButton: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    form: {
        flex: 1,
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});
