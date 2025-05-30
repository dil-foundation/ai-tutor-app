import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Import router from expo-router
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window'); // Get screen width for pagination dots

const Lesson1Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed for 4 pages (0, 1, 2, 3)

    const lessonPages = [
        // Page 1 Content
        <View key="page1" style={styles.pageContent}>
            <Text style={styles.alphabetLetter}>A (ae-pl)</Text>
            <Text style={styles.englishWord}>Apple</Text>
            <Text style={styles.arabicWord}>سیب</Text>

            <Text style={styles.alphabetLetter}>B (buk)</Text>
            <Text style={styles.englishWord}>Book</Text>
            <Text style={styles.arabicWord}>کتاب</Text>

            <Text style={styles.alphabetLetter}>C (ket)</Text>
            <Text style={styles.englishWord}>Cat</Text>
            <Text style={styles.arabicWord}>بلی</Text>

            <Text style={styles.alphabetLetter}>D (dor)</Text>
            <Text style={styles.englishWord}>Door</Text>
            <Text style={styles.arabicWord}>دروازه</Text>

            <Text style={styles.alphabetLetter}>E (e-le-fent)</Text>
            <Text style={styles.englishWord}>Elephant</Text>
            <Text style={styles.arabicWord}>ہاتھی</Text>

            <Text style={styles.alphabetLetter}>F (frend)</Text>
            <Text style={styles.englishWord}>Friend</Text>
            <Text style={styles.arabicWord}>دوست</Text>

            <Text style={styles.alphabetLetter}>G (gaa-id)</Text>
            <Text style={styles.englishWord}>Guide</Text>
            <Text style={styles.arabicWord}>لائبریری</Text>
        </View>,

        // Page 2 Content
        <View key="page2" style={styles.pageContent}>
            <Text style={styles.alphabetLetter}>H (haus)</Text>
            <Text style={styles.englishWord}>House</Text>
            <Text style={styles.arabicWord}>گھر</Text>

            <Text style={styles.alphabetLetter}>I (aais)</Text>
            <Text style={styles.englishWord}>Ice</Text>
            <Text style={styles.arabicWord}>برف</Text>

            <Text style={styles.alphabetLetter}>J (joos)</Text>
            <Text style={styles.englishWord}>Juice</Text>
            <Text style={styles.arabicWord}>رس</Text>

            <Text style={styles.alphabetLetter}>K (king)</Text>
            <Text style={styles.englishWord}>King</Text>
            <Text style={styles.arabicWord}>بادشاہ</Text>

            <Text style={styles.alphabetLetter}>L (lait)</Text>
            <Text style={styles.englishWord}>Light</Text>
            <Text style={styles.arabicWord}>روشنی</Text>

            <Text style={styles.alphabetLetter}>M (moon)</Text>
            <Text style={styles.englishWord}>Moon</Text>
            <Text style={styles.arabicWord}>چاند</Text>

            <Text style={styles.alphabetLetter}>N (neim)</Text>
            <Text style={styles.englishWord}>Name</Text>
            <Text style={styles.arabicWord}>نام</Text>
        </View>,

        // Page 3 Content
        <View key="page3" style={styles.pageContent}>
            <Text style={styles.alphabetLetter}>O (or-inj)</Text>
            <Text style={styles.englishWord}>Orange</Text>
            <Text style={styles.arabicWord}>سنگتره</Text>

            <Text style={styles.alphabetLetter}>P (pen)</Text>
            <Text style={styles.englishWord}>Pen</Text>
            <Text style={styles.arabicWord}>قلم</Text>

            <Text style={styles.alphabetLetter}>Q (kween)</Text>
            <Text style={styles.englishWord}>Queen</Text>
            <Text style={styles.arabicWord}>ملکہ</Text>

            <Text style={styles.alphabetLetter}>R (rein)</Text>
            <Text style={styles.englishWord}>Rain</Text>
            <Text style={styles.arabicWord}>بارش</Text>

            <Text style={styles.alphabetLetter}>S (san)</Text>
            <Text style={styles.englishWord}>Sun</Text>
            <Text style={styles.arabicWord}>سورج</Text>

            <Text style={styles.alphabetLetter}>T (Tree)</Text>
            <Text style={styles.englishWord}>Tree</Text>
            <Text style={styles.arabicWord}>درخت</Text>

            <Text style={styles.alphabetLetter}>U (um-bre-la)</Text>
            <Text style={styles.englishWord}>Umbrella</Text>
            <Text style={styles.arabicWord}>چھتری</Text>
        </View>,

        // Page 4 Content (Last Page)
        <View key="page4" style={styles.pageContent}>
            <Text style={styles.alphabetLetter}>V (van)</Text>
            <Text style={styles.englishWord}>Van</Text>
            <Text style={styles.arabicWord}>وین</Text>

            <Text style={styles.alphabetLetter}>W (waa-ter)</Text>
            <Text style={styles.englishWord}>Water</Text>
            <Text style={styles.arabicWord}>پانی</Text>

            <Text style={styles.alphabetLetter}>X (eks-ray)</Text>
            <Text style={styles.englishWord}>X-Ray</Text>
            <Text style={styles.arabicWord}>ایکس رے</Text>

            <Text style={styles.alphabetLetter}>Y (ye-lo)</Text>
            <Text style={styles.englishWord}>Yellow</Text>
            <Text style={styles.arabicWord}>پیلا</Text>

            <Text style={styles.alphabetLetter}>Z (zee-bra)</Text>
            <Text style={styles.englishWord}>Zebra</Text>
            <Text style={styles.arabicWord}>زیبرا</Text>
        </View>,
    ];

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            if(router.canGoBack()) router.back();
            console.log('Exiting Lesson 1');
        }
    };

    const handleNextOrFinish = () => {
        if (currentPageIndex < lessonPages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            console.log('Lesson 1 Finished!');
            router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lesson 1: The English Alphabet!</Text>
                    <View style={{ width: 24 }} /> {/* Spacer */}
                </View>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {lessonPages.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentPageIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false} 
                >
                    {lessonPages[currentPageIndex]}
                </ScrollView>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextOrFinish}
                >
                    <Text style={styles.nextButtonText}>
                        {currentPageIndex === lessonPages.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0, 
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1, 
        textAlign: 'center',
        marginRight: 32, 
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E0E0E0', 
    },
    paginationDot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#007AFF', 
    },
    inactiveDot: {
        backgroundColor: '#C7C7CC', 
    },
    scrollView: {
        flex: 1, 
    },
    scrollViewContentContainer: {
        alignItems: 'center', 
        paddingVertical: 20, 
    },
    pageContent: {
        alignItems: 'center',
        paddingHorizontal: 20, 
        width: width * 0.9, 
    },
    alphabetLetter: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: '#007AFF', 
        marginBottom: 4, 
        marginTop: 16, 
    },
    englishWord: {
        fontSize: 22, 
        color: '#000', 
        marginBottom: 2, 
    },
    arabicWord: {
        fontSize: 20, 
        color: '#555', 
        marginBottom: 20, 
    },
    nextButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25, 
        alignSelf: 'center', 
        marginBottom: 20, 
        width: '80%', 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    nextButtonText: {
        color: '#FFFFFF', 
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Lesson1Screen; 