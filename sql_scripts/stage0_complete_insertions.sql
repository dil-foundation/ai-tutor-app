-- =============================================================================
-- STAGE 0: BEGINNER LESSONS - COMPLETE DATA INSERTIONS
-- =============================================================================
-- This script contains all exercises (lessons) and topics for Stage 0.
-- Run this after the main hierarchy structure script.
-- =============================================================================

-- Get the id for Stage 0
DO $$
DECLARE
    stage_0_id INTEGER;
BEGIN
    SELECT id INTO stage_0_id FROM public.ai_tutor_content_hierarchy WHERE level = 'stage' AND stage_number = 0;

    -- Stage 0 Exercises (Lessons)
    INSERT INTO public.ai_tutor_content_hierarchy 
        (level, hierarchy_path, parent_id, title, title_urdu, description, description_urdu, exercise_number, exercise_type, exercise_order) 
    VALUES
        ('exercise', '0.1', stage_0_id, 'Lesson 1: Basic Greetings', 'سبق 1: بنیادی سلام', 'Learn essential greetings for everyday conversations.', 'روزمرہ کی گفتگو کے لیے ضروری سلام سیکھیں۔', 1, 'lesson', 1),
        ('exercise', '0.2', stage_0_id, 'Lesson 2: Common Questions', 'سبق 2: عام سوالات', 'Practice asking and answering common questions.', 'عام سوالات پوچھنے اور جواب دینے کی مشق کریں۔', 2, 'lesson', 2),
        ('exercise', '0.3', stage_0_id, 'Lesson 3: Numbers and Time', 'سبق 3: نمبر اور وقت', 'Learn to say numbers and tell time in English.', 'انگریزی میں نمبر বলতে اور وقت بتانا سیکھیں۔', 3, 'lesson', 3),
        ('exercise', '0.4', stage_0_id, 'Lesson 4: Days and Months', 'سبق 4: دن اور مہینے', 'Master the days of the week and months of the year.', 'ہفتے کے دنوں اور سال کے مہینوں میں مہارت حاصل کریں۔', 4, 'lesson', 4),
        ('exercise', '0.5', stage_0_id, 'Lesson 5: Family and People', 'سبق 5: خاندان اور لوگ', 'Learn vocabulary for family members and people.', 'خاندان کے افراد اور لوگوں کے لیے الفاظ سیکھیں۔', 5, 'lesson', 5)
    ON CONFLICT (hierarchy_path) DO NOTHING;
END $$;

-- =============================================================================
-- STAGE 0, LESSON 1: BASIC GREETINGS (ALPHABET) TOPICS
-- =============================================================================
DO $$
DECLARE
    lesson_1_id INTEGER;
BEGIN
    SELECT id INTO lesson_1_id FROM public.ai_tutor_content_hierarchy WHERE level = 'exercise' AND hierarchy_path = '0.1';

    INSERT INTO public.ai_tutor_content_hierarchy 
        (level, hierarchy_path, parent_id, title, title_urdu, description, topic_number, topic_data, topic_order, category, difficulty) 
    VALUES
        ('topic', '0.1.1', lesson_1_id, 'A for Apple', 'اے فار ایپل', 'Learn the letter A', 1, '{"english": "Apple", "urdu": "سیب", "pronunciation": "ae-pl", "audio": "Apple.mp3"}', 1, 'alphabet', 'beginner'),
        ('topic', '0.1.2', lesson_1_id, 'B for Book', 'بی فار بک', 'Learn the letter B', 2, '{"english": "Book", "urdu": "کتاب", "pronunciation": "buk", "audio": "Book.mp3"}', 2, 'alphabet', 'beginner'),
        ('topic', '0.1.3', lesson_1_id, 'C for Cat', 'سی فار کیٹ', 'Learn the letter C', 3, '{"english": "Cat", "urdu": "بلی", "pronunciation": "ket", "audio": "Cat.mp3"}', 3, 'alphabet', 'beginner'),
        ('topic', '0.1.4', lesson_1_id, 'D for Door', 'ڈی فار ڈور', 'Learn the letter D', 4, '{"english": "Door", "urdu": "دروازہ", "pronunciation": "dor", "audio": "Door.mp3"}', 4, 'alphabet', 'beginner'),
        ('topic', '0.1.5', lesson_1_id, 'E for Elephant', 'ای فار ایلیفینٹ', 'Learn the letter E', 5, '{"english": "Elephant", "urdu": "ہاتھی", "pronunciation": "e-le-fent", "audio": "Elephant.mp3"}', 5, 'alphabet', 'beginner'),
        ('topic', '0.1.6', lesson_1_id, 'F for Friend', 'ایف فار فرینڈ', 'Learn the letter F', 6, '{"english": "Friend", "urdu": "دوست", "pronunciation": "frend", "audio": "Friend.mp3"}', 6, 'alphabet', 'beginner'),
        ('topic', '0.1.7', lesson_1_id, 'G for Guide', 'جی فار گائیڈ', 'Learn the letter G', 7, '{"english": "Guide", "urdu": "رہنما", "pronunciation": "gaa-id", "audio": "Guide.mp3"}', 7, 'alphabet', 'beginner'),
        ('topic', '0.1.8', lesson_1_id, 'H for House', 'ایچ فار ہاؤس', 'Learn the letter H', 8, '{"english": "House", "urdu": "گھر", "pronunciation": "haus", "audio": "House.mp3"}', 8, 'alphabet', 'beginner'),
        ('topic', '0.1.9', lesson_1_id, 'I for Ice', 'آئی فار آئس', 'Learn the letter I', 9, '{"english": "Ice", "urdu": "برف", "pronunciation": "aais", "audio": "Ice.mp3"}', 9, 'alphabet', 'beginner'),
        ('topic', '0.1.10', lesson_1_id, 'J for Juice', 'جے فار جوس', 'Learn the letter J', 10, '{"english": "Juice", "urdu": "رس", "pronunciation": "joos", "audio": "Juice.mp3"}', 10, 'alphabet', 'beginner'),
        ('topic', '0.1.11', lesson_1_id, 'K for King', 'کے فار کنگ', 'Learn the letter K', 11, '{"english": "King", "urdu": "بادشاہ", "pronunciation": "king", "audio": "King.mp3"}', 11, 'alphabet', 'beginner'),
        ('topic', '0.1.12', lesson_1_id, 'L for Light', 'ایل فار لائٹ', 'Learn the letter L', 12, '{"english": "Light", "urdu": "روشنی", "pronunciation": "lait", "audio": "Light.mp3"}', 12, 'alphabet', 'beginner'),
        ('topic', '0.1.13', lesson_1_id, 'M for Moon', 'ایم فار مون', 'Learn the letter M', 13, '{"english": "Moon", "urdu": "چاند", "pronunciation": "moon", "audio": "Moon.mp3"}', 13, 'alphabet', 'beginner'),
        ('topic', '0.1.14', lesson_1_id, 'N for Name', 'این فار نیم', 'Learn the letter N', 14, '{"english": "Name", "urdu": "نام", "pronunciation": "neim", "audio": "Name.mp3"}', 14, 'alphabet', 'beginner'),
        ('topic', '0.1.15', lesson_1_id, 'O for Orange', 'او فار اورنج', 'Learn the letter O', 15, '{"english": "Orange", "urdu": "سنگتره", "pronunciation": "or-inj", "audio": "Orange.mp3"}', 15, 'alphabet', 'beginner'),
        ('topic', '0.1.16', lesson_1_id, 'P for Pen', 'پی فار پین', 'Learn the letter P', 16, '{"english": "Pen", "urdu": "قلم", "pronunciation": "pen", "audio": "Pen.mp3"}', 16, 'alphabet', 'beginner'),
        ('topic', '0.1.17', lesson_1_id, 'Q for Queen', 'کیو فار کوئین', 'Learn the letter Q', 17, '{"english": "Queen", "urdu": "ملکہ", "pronunciation": "kween", "audio": "Queen.mp3"}', 17, 'alphabet', 'beginner'),
        ('topic', '0.1.18', lesson_1_id, 'R for Rain', 'آر فار رین', 'Learn the letter R', 18, '{"english": "Rain", "urdu": "بارش", "pronunciation": "rein", "audio": "Rain.mp3"}', 18, 'alphabet', 'beginner'),
        ('topic', '0.1.19', lesson_1_id, 'S for Sun', 'ایس فار سن', 'Learn the letter S', 19, '{"english": "Sun", "urdu": "سورج", "pronunciation": "san", "audio": "Sun.mp3"}', 19, 'alphabet', 'beginner'),
        ('topic', '0.1.20', lesson_1_id, 'T for Tree', 'ٹی فار ٹری', 'Learn the letter T', 20, '{"english": "Tree", "urdu": "درخت", "pronunciation": "tree", "audio": "Tree.mp3"}', 20, 'alphabet', 'beginner'),
        ('topic', '0.1.21', lesson_1_id, 'U for Umbrella', 'یو فار امبریلا', 'Learn the letter U', 21, '{"english": "Umbrella", "urdu": "چھتری", "pronunciation": "um-bre-la", "audio": "Umbrella.mp3"}', 21, 'alphabet', 'beginner'),
        ('topic', '0.1.22', lesson_1_id, 'V for Van', 'وی فار وین', 'Learn the letter V', 22, '{"english": "Van", "urdu": "وین", "pronunciation": "van", "audio": "Van.mp3"}', 22, 'alphabet', 'beginner'),
        ('topic', '0.1.23', lesson_1_id, 'W for Water', 'ڈبلیو فار واٹر', 'Learn the letter W', 23, '{"english": "Water", "urdu": "پانی", "pronunciation": "waa-ter", "audio": "Water.mp3"}', 23, 'alphabet', 'beginner'),
        ('topic', '0.1.24', lesson_1_id, 'X for X-Ray', 'ایکس فار ایکس رے', 'Learn the letter X', 24, '{"english": "X-Ray", "urdu": "ایکس رے", "pronunciation": "eks-ray", "audio": "X-Ray.mp3"}', 24, 'alphabet', 'beginner'),
        ('topic', '0.1.25', lesson_1_id, 'Y for Yellow', 'وائی فار یلو', 'Learn the letter Y', 25, '{"english": "Yellow", "urdu": "پیلا", "pronunciation": "ye-lo", "audio": "Yellow.mp3"}', 25, 'alphabet', 'beginner'),
        ('topic', '0.1.26', lesson_1_id, 'Z for Zebra', 'زیڈ فار زیبرا', 'Learn the letter Z', 26, '{"english": "Zebra", "urdu": "زیبرا", "pronunciation": "zee-bra", "audio": "Zebra.mp3"}', 26, 'alphabet', 'beginner')
    ON CONFLICT (hierarchy_path) DO NOTHING;
END $$;

-- =============================================================================
-- STAGE 0, LESSON 2: COMMON QUESTIONS (PHONICS & SOUND CONFUSION) TOPICS
-- =============================================================================
DO $$
DECLARE
    lesson_2_id INTEGER;
BEGIN
    SELECT id INTO lesson_2_id FROM public.ai_tutor_content_hierarchy WHERE level = 'exercise' AND hierarchy_path = '0.2';

    INSERT INTO public.ai_tutor_content_hierarchy 
        (level, hierarchy_path, parent_id, title, title_urdu, description, topic_number, topic_data, topic_order, category, difficulty) 
    VALUES
        ('topic', '0.2.1', lesson_2_id, 'B vs. V', 'B بمقابلہ V', 'Practice B and V sounds.', 1, '{"title": "B as in Ball vs. V as in Van", "examples": ["Ball vs. Van", "Bat vs. Vast", "Boy vs. Voice"], "urdu_explanation": ["آواز لبوں کو بند کر کے ادا کی جاتی ہے. - B", "آواز دانتوں سے ہونٹ رگڑ کر ادا کی جاتی ہے. - V"], "audio": "B_vs_V.mp3"}', 1, 'phonics', 'beginner'),
        ('topic', '0.2.2', lesson_2_id, 'T vs. TH', 'T بمقابلہ TH', 'Practice T and TH sounds.', 2, '{"title": "T as in Time vs. TH as in Think", "examples": ["Time vs. Think", "Ten vs. Thank", "Toy vs. Thirst"], "urdu_explanation": ["زبان کو دانتوں کے پیچھے رکھ کر بولتے ہیں. - T", "میں زبان کو دانتوں کے بیچ رگڑ کر نرم آواز", "نکالی جاتی ہے. - TH"], "audio": "T_vs_TH.mp3"}', 2, 'phonics', 'beginner'),
        ('topic', '0.2.3', lesson_2_id, 'P vs. F', 'P بمقابلہ F', 'Practice P and F sounds.', 3, '{"title": "P as in Pen vs. F as in Fan", "examples": ["Pen vs. Fan", "Pin vs. Fin", "Pop vs. Fun"], "urdu_explanation": ["آواز ہونٹوں سے زوردار نکلتی ہے. - P", "آواز دانتوں اور ہونٹوں کے ہلکے رگڑ سے نکلتی ہے. - F"], "audio": "P_vs_F.mp3"}', 3, 'phonics', 'beginner'),
        ('topic', '0.2.4', lesson_2_id, 'D vs. T', 'D بمقابلہ T', 'Practice D and T sounds.', 4, '{"title": "D as in Dog vs. T as in Top", "examples": ["Dog vs. Top", "Day vs. Toy", "Dad vs. Tap"], "urdu_explanation": ["آواز نرم اور گہری ہوتی ہے. - D", "آواز سخت اور تیز ادا کی جاتی ہے. - T"], "audio": "D_vs_T.mp3"}', 4, 'phonics', 'beginner'),
        ('topic', '0.2.5', lesson_2_id, 'S vs. Z', 'S بمقابلہ Z', 'Practice S and Z sounds.', 5, '{"title": "S as in Sun vs. Z as in Zoo", "examples": ["Sun vs. Zoo", "Sip vs. Zip", "Sing vs. Zebra"], "urdu_explanation": ["آواز بغیر آواز کے سانس سے آتی ہے. - S", "آواز سانس اور آواز کے ساتھ ہوتی ہے. - Z، جیسے مکھی", "کی بھنبھناہٹ."], "audio": "S_vs_Z.mp3"}', 5, 'phonics', 'beginner'),
        ('topic', '0.2.6', lesson_2_id, 'K vs. G', 'K بمقابلہ G', 'Practice K and G sounds.', 6, '{"title": "K as in King vs. G as in Goat", "examples": ["King vs. Goat", "Kit vs. Gift", "Cold vs. Gold"], "urdu_explanation": ["آواز بغیر آواز کے ہوتی ہے، صرف سانس سے. - K", "آواز گلے سے آواز کے ساتھ نکلتی ہے. - G"], "audio": "K_vs_G.mp3"}', 6, 'phonics', 'beginner'),
        ('topic', '0.2.7', lesson_2_id, 'CH vs. SH', 'CH بمقابلہ SH', 'Practice CH and SH sounds.', 7, '{"title": "CH as in Chair vs. SH as in Ship", "examples": ["Chair vs. Ship", "Cheese vs. Sheet", "Chat vs. Shine"], "urdu_explanation": ["آواز ''چ'' جیسی ہوتی ہے. - CH", "آواز ''ش'' جیسی ہوتی ہے، زیادہ نرم اور لمبی. - SH"], "audio": "CH_vs_SH.mp3"}', 7, 'phonics', 'beginner'),
        ('topic', '0.2.8', lesson_2_id, 'J vs. Z', 'J بمقابلہ Z', 'Practice J and Z sounds.', 8, '{"title": "J as in Jam vs. Z as in Zip", "examples": ["Jam vs. Zip", "Joke vs. Zone", "Jump vs. Zebra"], "urdu_explanation": ["آواز ''ج'' جیسی ہوتی ہے. - J", "آواز سانس اور آواز کے ساتھ نکلتی ہے. - Z، جیسے", "بھنبھناہٹ."], "audio": "J_vs_Z.mp3"}', 8, 'phonics', 'beginner'),
        ('topic', '0.2.9', lesson_2_id, 'L vs. R', 'L بمقابلہ R', 'Practice L and R sounds.', 9, '{"title": "L as in Lion vs. R as in Rain", "examples": ["Lion vs. Rain", "Light vs. Right", "Lock vs. Rock"], "urdu_explanation": ["آواز زبان کو دانتوں کے پیچھے لگا کر نکالی جاتی ہے. - L", "آواز زبان کو موڑ کر نکالی جاتی ہے، گول انداز میں. - R"], "audio": "L_vs_R.mp3"}', 9, 'phonics', 'beginner'),
        ('topic', '0.2.10', lesson_2_id, 'Silent Letters', 'خاموش حروف', 'Learn about silent letters.', 10, '{"title": "Silent Letters (K, B, L)", "examples": ["K in ''Knife'' is silent → ''نائف''", "B in ''Lamb'' is silent → ''لیم''", "L in ''Half'' is silent → ''ہاف''"], "urdu_explanation": ["کچھ انگریزی الفاظ میں حروف نظر آتے ہیں مگر", " Silent Letters بولے نہیں جاتے. - ان کو", "کہتے ہیں."], "audio": "Silent_Letters.mp3"}', 10, 'phonics', 'beginner')
    ON CONFLICT (hierarchy_path) DO NOTHING;
END $$;

-- =============================================================================
-- STAGE 0, LESSON 3: NUMBERS AND TIME TOPICS
-- =============================================================================
DO $$
DECLARE
    lesson_3_id INTEGER;
BEGIN
    SELECT id INTO lesson_3_id FROM public.ai_tutor_content_hierarchy WHERE level = 'exercise' AND hierarchy_path = '0.3';

    INSERT INTO public.ai_tutor_content_hierarchy 
        (level, hierarchy_path, parent_id, title, title_urdu, description, topic_number, topic_data, topic_order, category, difficulty) 
    VALUES
        -- Numbers
        ('topic', '0.3.1', lesson_3_id, 'Number 1', 'نمبر 1', 'Learn the number 1', 1, '{"english": "One", "urdu": "ایک", "pronunciation": "wun", "audio": "One.mp3"}', 1, 'numbers', 'beginner'),
        ('topic', '0.3.2', lesson_3_id, 'Number 2', 'نمبر 2', 'Learn the number 2', 2, '{"english": "Two", "urdu": "دو", "pronunciation": "too", "audio": "Two.mp3"}', 2, 'numbers', 'beginner'),
        ('topic', '0.3.3', lesson_3_id, 'Number 3', 'نمبر 3', 'Learn the number 3', 3, '{"english": "Three", "urdu": "تین", "pronunciation": "three", "audio": "Three.mp3"}', 3, 'numbers', 'beginner'),
        ('topic', '0.3.4', lesson_3_id, 'Number 4', 'نمبر 4', 'Learn the number 4', 4, '{"english": "Four", "urdu": "چار", "pronunciation": "for", "audio": "Four.mp3"}', 4, 'numbers', 'beginner'),
        ('topic', '0.3.5', lesson_3_id, 'Number 5', 'نمبر 5', 'Learn the number 5', 5, '{"english": "Five", "urdu": "پانچ", "pronunciation": "faiv", "audio": "Five.mp3"}', 5, 'numbers', 'beginner'),
        ('topic', '0.3.6', lesson_3_id, 'Number 6', 'نمبر 6', 'Learn the number 6', 6, '{"english": "Six", "urdu": "چھ", "pronunciation": "siks", "audio": "Six.mp3"}', 6, 'numbers', 'beginner'),
        ('topic', '0.3.7', lesson_3_id, 'Number 7', 'نمبر 7', 'Learn the number 7', 7, '{"english": "Seven", "urdu": "سات", "pronunciation": "se-ven", "audio": "Seven.mp3"}', 7, 'numbers', 'beginner'),
        ('topic', '0.3.8', lesson_3_id, 'Number 8', 'نمبر 8', 'Learn the number 8', 8, '{"english": "Eight", "urdu": "آٹھ", "pronunciation": "eit", "audio": "Eight.mp3"}', 8, 'numbers', 'beginner'),
        ('topic', '0.3.9', lesson_3_id, 'Number 9', 'نمبر 9', 'Learn the number 9', 9, '{"english": "Nine", "urdu": "نو", "pronunciation": "nain", "audio": "Nine.mp3"}', 9, 'numbers', 'beginner'),
        ('topic', '0.3.10', lesson_3_id, 'Number 10', 'نمبر 10', 'Learn the number 10', 10, '{"english": "Ten", "urdu": "دس", "pronunciation": "ten", "audio": "Ten.mp3"}', 10, 'numbers', 'beginner'),
        -- Days of the Week
        ('topic', '0.3.11', lesson_3_id, 'Monday', 'پیر', 'Learn the day Monday', 11, '{"english": "Monday", "urdu": "پیر", "pronunciation": "mun-day", "audio": "Monday.mp3"}', 11, 'days', 'beginner'),
        ('topic', '0.3.12', lesson_3_id, 'Tuesday', 'منگل', 'Learn the day Tuesday', 12, '{"english": "Tuesday", "urdu": "منگل", "pronunciation": "tuz-day", "audio": "Tuesday.mp3"}', 12, 'days', 'beginner'),
        ('topic', '0.3.13', lesson_3_id, 'Wednesday', 'بدھ', 'Learn the day Wednesday', 13, '{"english": "Wednesday", "urdu": "بدھ", "pronunciation": "wenz-day", "audio": "Wednesday.mp3"}', 13, 'days', 'beginner'),
        ('topic', '0.3.14', lesson_3_id, 'Thursday', 'جمعرات', 'Learn the day Thursday', 14, '{"english": "Thursday", "urdu": "جمعرات", "pronunciation": "thurz-day", "audio": "Thursday.mp3"}', 14, 'days', 'beginner'),
        ('topic', '0.3.15', lesson_3_id, 'Friday', 'جمعہ', 'Learn the day Friday', 15, '{"english": "Friday", "urdu": "جمعہ", "pronunciation": "frai-day", "audio": "Friday.mp3"}', 15, 'days', 'beginner'),
        ('topic', '0.3.16', lesson_3_id, 'Saturday', 'ہفتہ', 'Learn the day Saturday', 16, '{"english": "Saturday", "urdu": "ہفتہ", "pronunciation": "sa-tur-day", "audio": "Saturday.mp3"}', 16, 'days', 'beginner'),
        ('topic', '0.3.17', lesson_3_id, 'Sunday', 'اتوار', 'Learn the day Sunday', 17, '{"english": "Sunday", "urdu": "اتوار", "pronunciation": "sun-day", "audio": "Sunday.mp3"}', 17, 'days', 'beginner'),
        -- Colors
        ('topic', '0.3.18', lesson_3_id, 'Red', 'سرخ', 'Learn the color Red', 18, '{"english": "Red", "urdu": "سرخ", "pronunciation": "red", "audio": "Red.mp3"}', 18, 'colors', 'beginner'),
        ('topic', '0.3.19', lesson_3_id, 'Blue', 'نیلا', 'Learn the color Blue', 19, '{"english": "Blue", "urdu": "نیلا", "pronunciation": "bloo", "audio": "Blue.mp3"}', 19, 'colors', 'beginner'),
        ('topic', '0.3.20', lesson_3_id, 'Green', 'سبز', 'Learn the color Green', 20, '{"english": "Green", "urdu": "سبز", "pronunciation": "green", "audio": "Green.mp3"}', 20, 'colors', 'beginner'),
        ('topic', '0.3.21', lesson_3_id, 'Yellow', 'پیلا', 'Learn the color Yellow', 21, '{"english": "Yellow", "urdu": "پیلا", "pronunciation": "ye-lo", "audio": "Yellow.mp3"}', 21, 'colors', 'beginner'),
        ('topic', '0.3.22', lesson_3_id, 'Black', 'کالا', 'Learn the color Black', 22, '{"english": "Black", "urdu": "کالا", "pronunciation": "blak", "audio": "Black.mp3"}', 22, 'colors', 'beginner'),
        ('topic', '0.3.23', lesson_3_id, 'White', 'سفید', 'Learn the color White', 23, '{"english": "White", "urdu": "سفید", "pronunciation": "wait", "audio": "White.mp3"}', 23, 'colors', 'beginner'),
        -- Classroom Items
        ('topic', '0.3.24', lesson_3_id, 'Book', 'کتاب', 'Learn the item Book', 24, '{"english": "Book", "urdu": "کتاب", "pronunciation": "buk", "audio": "Book.mp3"}', 24, 'classroom', 'beginner'),
        ('topic', '0.3.25', lesson_3_id, 'Pen', 'قلم', 'Learn the item Pen', 25, '{"english": "Pen", "urdu": "قلم", "pronunciation": "pen", "audio": "Pen.mp3"}', 25, 'classroom', 'beginner'),
        ('topic', '0.3.26', lesson_3_id, 'Chair', 'کرسی', 'Learn the item Chair', 26, '{"english": "Chair", "urdu": "کرسی", "pronunciation": "chair", "audio": "Chair.mp3"}', 26, 'classroom', 'beginner'),
        ('topic', '0.3.27', lesson_3_id, 'Table', 'میز', 'Learn the item Table', 27, '{"english": "Table", "urdu": "میز", "pronunciation": "tei-bl", "audio": "Table.mp3"}', 27, 'classroom', 'beginner'),
        ('topic', '0.3.28', lesson_3_id, 'Bag', 'بستہ', 'Learn the item Bag', 28, '{"english": "Bag", "urdu": "بستہ", "pronunciation": "bag", "audio": "Bag.mp3"}', 28, 'classroom', 'beginner')
    ON CONFLICT (hierarchy_path) DO NOTHING;
END $$;

-- =============================================================================
-- STAGE 0, LESSON 4: DAYS AND MONTHS (VOCABULARY & PHRASES) TOPICS
-- =============================================================================
DO $$
DECLARE
    lesson_4_id INTEGER;
BEGIN
    SELECT id INTO lesson_4_id FROM public.ai_tutor_content_hierarchy WHERE level = 'exercise' AND hierarchy_path = '0.4';

    INSERT INTO public.ai_tutor_content_hierarchy 
        (level, hierarchy_path, parent_id, title, title_urdu, description, topic_number, topic_data, topic_order, category, difficulty) 
    VALUES
        -- Sight Words
        ('topic', '0.4.1', lesson_4_id, 'I', 'میں', 'Learn the word I', 1, '{"english": "I", "urdu": "میں", "pronunciation": "aai", "audio": "I.mp3"}', 1, 'sight-words', 'beginner'),
        ('topic', '0.4.2', lesson_4_id, 'You', 'آپ', 'Learn the word You', 2, '{"english": "You", "urdu": "آپ", "pronunciation": "yoo", "audio": "You.mp3"}', 2, 'sight-words', 'beginner'),
        ('topic', '0.4.3', lesson_4_id, 'He', 'وہ (مرد)', 'Learn the word He', 3, '{"english": "He", "urdu": "وہ (مرد)", "pronunciation": "hee", "audio": "He.mp3"}', 3, 'sight-words', 'beginner'),
        ('topic', '0.4.4', lesson_4_id, 'She', 'وہ (عورت)', 'Learn the word She', 4, '{"english": "She", "urdu": "وہ (عورت)", "pronunciation": "shee", "audio": "She.mp3"}', 4, 'sight-words', 'beginner'),
        ('topic', '0.4.5', lesson_4_id, 'It', 'یہ', 'Learn the word It', 5, '{"english": "It", "urdu": "یہ", "pronunciation": "it", "audio": "It.mp3"}', 5, 'sight-words', 'beginner'),
        ('topic', '0.4.6', lesson_4_id, 'We', 'ہم', 'Learn the word We', 6, '{"english": "We", "urdu": "ہم", "pronunciation": "wee", "audio": "We.mp3"}', 6, 'sight-words', 'beginner'),
        -- Greetings
        ('topic', '0.4.7', lesson_4_id, 'Hello', 'السلام علیکم', 'Learn the greeting Hello', 7, '{"english": "Hello", "urdu": "السلام علیکم", "pronunciation": "he-lo", "audio": "Hello.mp3"}', 7, 'greetings', 'beginner'),
        ('topic', '0.4.8', lesson_4_id, 'How are you?', 'تم کیسے ہو؟', 'Learn the phrase How are you?', 8, '{"english": "How are you?", "urdu": "تم کیسے ہو؟", "pronunciation": "how ar yoo", "audio": "How_are_you.mp3"}', 8, 'greetings', 'beginner'),
        ('topic', '0.4.9', lesson_4_id, 'My name is Ali', 'میرا نام علی ہے', 'Learn the phrase My name is Ali', 9, '{"english": "My name is Ali", "urdu": "میرا نام علی ہے", "pronunciation": "mai neim iz aa-lee", "audio": "My_name_is_Ali.mp3"}', 9, 'greetings', 'beginner'),
        -- Useful Phrases
        ('topic', '0.4.10', lesson_4_id, 'I''m doing well.', 'میں ٹھیک ہوں-', 'Learn the phrase I''m doing well.', 10, '{"english": "I''m doing well.", "urdu": "میں ٹھیک ہوں-", "pronunciation": "aaim doo-ing wel", "audio": "Im_doing_well.mp3"}', 10, 'phrases', 'beginner'),
        ('topic', '0.4.11', lesson_4_id, 'What''s your name?', 'تمہارا نام کیا ہے؟', 'Learn the phrase What''s your name?', 11, '{"english": "What''s your name?", "urdu": "تمہارا نام کیا ہے؟", "pronunciation": "wats yor neim", "audio": "Whats_your_name.mp3"}', 11, 'phrases', 'beginner'),
        ('topic', '0.4.12', lesson_4_id, 'Nice to meet you.', 'تم سے مل کر خوشی ہوئی-', 'Learn the phrase Nice to meet you.', 12, '{"english": "Nice to meet you.", "urdu": "تم سے مل کر خوشی ہوئی-", "pronunciation": "nais to meet yoo", "audio": "Nice_to_meet_you.mp3"}', 12, 'phrases', 'beginner'),
        -- UI Words
        ('topic', '0.4.13', lesson_4_id, 'Inbox', 'ان باکس', 'Learn the UI word Inbox', 13, '{"english": "Inbox", "urdu": "ان باکس", "pronunciation": "in-boks", "audio": "Inbox.mp3"}', 13, 'ui-words', 'beginner'),
        ('topic', '0.4.14', lesson_4_id, 'Settings', 'سیٹنگز', 'Learn the UI word Settings', 14, '{"english": "Settings", "urdu": "سیٹنگز", "pronunciation": "set-ings", "audio": "Settings.mp3"}', 14, 'ui-words', 'beginner'),
        ('topic', '0.4.15', lesson_4_id, 'Notifications', 'اطلاعات', 'Learn the UI word Notifications', 15, '{"english": "Notifications", "urdu": "اطلاعات", "pronunciation": "no-ti-fi-ka-shuns", "audio": "Notifications.mp3"}', 15, 'ui-words', 'beginner'),
        ('topic', '0.4.16', lesson_4_id, 'Options', 'اختیارات', 'Learn the UI word Options', 16, '{"english": "Options", "urdu": "اختیارات", "pronunciation": "op-shuns", "audio": "Options.mp3"}', 16, 'ui-words', 'beginner'),
        ('topic', '0.4.17', lesson_4_id, 'Select', 'منتخب کریں', 'Learn the UI word Select', 17, '{"english": "Select", "urdu": "منتخب کریں", "pronunciation": "se-lekt", "audio": "Select.mp3"}', 17, 'ui-words', 'beginner')
    ON CONFLICT (hierarchy_path) DO NOTHING;
END $$;

-- =============================================================================
-- STAGE 0, LESSON 5: FAMILY AND PEOPLE (APP NAVIGATION) TOPICS
-- =============================================================================
DO $$
DECLARE
    lesson_5_id INTEGER;
BEGIN
    SELECT id INTO lesson_5_id FROM public.ai_tutor_content_hierarchy WHERE level = 'exercise' AND hierarchy_path = '0.5';

    INSERT INTO public.ai_tutor_content_hierarchy 
        (level, hierarchy_path, parent_id, title, title_urdu, description, topic_number, topic_data, topic_order, category, difficulty) 
    VALUES
        ('topic', '0.5.1', lesson_5_id, 'Start', 'شروع کریں', 'Learn the navigation word Start', 1, '{"english": "Start", "urdu": "شروع کریں", "audio": "Start.mp3"}', 1, 'navigation', 'beginner'),
        ('topic', '0.5.2', lesson_5_id, 'Next', 'اگلا', 'Learn the navigation word Next', 2, '{"english": "Next", "urdu": "اگلا", "audio": "Next.mp3"}', 2, 'navigation', 'beginner'),
        ('topic', '0.5.3', lesson_5_id, 'Submit', 'جمع کرائیں', 'Learn the navigation word Submit', 3, '{"english": "Submit", "urdu": "جمع کرائیں", "audio": "Submit.mp3"}', 3, 'navigation', 'beginner'),
        ('topic', '0.5.4', lesson_5_id, 'Speak', 'بولیں', 'Learn the navigation word Speak', 4, '{"english": "Speak", "urdu": "بولیں", "audio": "Speak.mp3"}', 4, 'navigation', 'beginner'),
        ('topic', '0.5.5', lesson_5_id, 'Listen', 'سنیں', 'Learn the navigation word Listen', 5, '{"english": "Listen", "urdu": "سنیں", "audio": "Listen.mp3"}', 5, 'navigation', 'beginner'),
        ('topic', '0.5.6', lesson_5_id, 'Finish', 'ختم کریں', 'Learn the navigation word Finish', 6, '{"english": "Finish", "urdu": "ختم کریں", "audio": "Finish.mp3"}', 6, 'navigation', 'beginner')
    ON CONFLICT (hierarchy_path) DO NOTHING;
END $$;
