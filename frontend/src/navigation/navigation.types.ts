export type RootStackParamList = {
    // Auth Stack
    Login: undefined;
    Register: undefined;
    CreateProfileFlow: undefined;
    AddEditPet: {
        petId?: string;
        isNew?: boolean;
    };

    // Pet Owner Stack
    HomeOwner: undefined;
    SearchOwnerFilters: undefined;
    SearchOwnerResults: undefined;
    SitterProfile: { sitterId: string };
    PetProfile: { petId: string };

    // Pet Sitter Stack
    HomeSitter: undefined;
    SearchSitter: undefined;
    OwnerProfile: { ownerId: string };

    // Common Screens
    Messages: undefined;
    Chat: { chatId: string };
    Profile: undefined;
    Settings: undefined;
};

// Navigation prop types
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
