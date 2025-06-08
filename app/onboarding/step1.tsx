import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';

import React from 'react';
import {
    GestureResponderEvent,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Define your navigation types (customize based on your stack)
type RootStackParamList = {
    Chat: undefined;
    // Add other screens here if needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QuickConversationScreen: React.FC = () => {
    const router = useRouter();
    const navigation = useNavigation<NavigationProp>();

    const handleBeginChat = (event: GestureResponderEvent) => {
        router.push('/onboarding/step2');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
                    </TouchableOpacity>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <View style={{ width: 24 }} /> {/* Spacer to balance header layout */}
                </View>

                {/* Title & Subtitle */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Let's Get Started With a{'\n'}Quick Conversation
                    </Text>
                    <Text style={styles.subtitle}>
                        Our AI Tutor will chat with you to understand{'\n'}your English level.
                    </Text>
                </View>

                {/* Illustration */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('./../../assets/images/illus.png')} // Update this path to your image
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button} onPress={handleBeginChat}>
                    <Text style={styles.buttonText}>Begin Chat</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default QuickConversationScreen;
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 20,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginTop: 20
//     },
//     welcomeText: {
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     textContainer: {
//         marginTop: 30,
//         alignItems: 'center',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: '800',
//         textAlign: 'center',
//         color: '#1a1a1a',
//     },
//     subtitle: {
//         fontSize: 14,
//         color: '#555',
//         marginTop: 12,
//         textAlign: 'center',
//         lineHeight: 20,
//     },
//     imageWrapper: {
//         marginTop: 30,
//         padding: 20,
//         borderRadius: 16,
//         alignItems: 'center',
//     },
//     image: {
//         width: '100%',
//         height: 250,
//     },
//     button: {
//         marginTop: 30,
//         backgroundColor: '#d1ecf9',
//         paddingVertical: 16,
//         borderRadius: 999,
//         alignItems: 'center',
//         width: "90%",
//         alignSelf: 'center'
//     },
//     buttonText: {
//         color: '#000',
//         fontWeight: '600',
//         fontSize: 16,
//     },
// });
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111629',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 40
    },
    welcomeText: {
        fontSize: 16,
        fontFamily: 'Lexend-SemiBold',
        color: '#D2D5E1',
    },
    textContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Lexend-ExtraBold',
        textAlign: 'center',
        color: '#93E893',
    },
    subtitle: {
        fontSize: 14,
        color: '#D2D5E1',
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Lexend-Regular',
    },
    imageWrapper: {
        marginTop: 30,
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
    },
    image: {
        width: '100%',
        height: 250,
    },
    button: {
        marginTop: 30,
        backgroundColor: '#93E893',
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: 'center',
    },
    buttonText: {
        color: '#111629',
        fontFamily: 'Lexend-SemiBold',
        fontSize: 16,
    },
});