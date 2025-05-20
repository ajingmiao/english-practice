// English word to phonetic transcription dictionary
// This is a simplified version with common words used in the application

export const phoneticDictionary: Record<string, string> = {
  // 主题单词
  "bird": "bɜːrd",
  "hair": "heər",
  "star": "stɑːr",
  "red": "red",
  "girl": "gɜːrl",
  "go": "gəʊ",
  "door": "dɔːr",
  "free": "friː",
  
  // bird 主题相关单词
  "a": "ə",
  "is": "ɪz",
  "flying": "ˈflaɪɪŋ",
  "in": "ɪn",
  "the": "ðə",
  "sky": "skaɪ",
  "and": "ænd",
  "singing": "ˈsɪŋɪŋ",
  
  // hair 主题相关单词
  "her": "hɜːr",
  "long": "lɒŋ",
  "black": "blæk",
  "very": "ˈveri",
  "beautiful": "ˈbjuːtɪfʊl",
  
  // star 主题相关单词
  "shining": "ˈʃaɪnɪŋ",
  "little": "ˈlɪtl",
  "dark": "dɑːrk",
  
  // red 主题相关单词
  "it's": "ɪts",
  "apple": "ˈæpl",
  "on": "ɒn",
  "table": "ˈteɪbl",
  "big": "bɪg",
  "looks": "lʊks",
  "sweet": "swiːt",
  
  // girl 主题相关单词
  "smiling": "ˈsmaɪlɪŋ",
  "happy": "ˈhæpi",
  "at": "æt",
  "friend": "frend",
  "park": "pɑːrk",
  
  // go 主题相关单词
  "out": "aʊt",
  "i": "aɪ",
  "to": "tuː",
  "play": "pleɪ",
  "with": "wɪð",
  "my": "maɪ",
  "friends": "frendz",
  
  // door 主题相关单词
  "open": "ˈəʊpən",
  "now": "naʊ",
  "cat": "kæt",
  "walking": "ˈwɔːkɪŋ",
  
  // free 主题相关单词
  "am": "æm",
  "today": "təˈdeɪ",
  "outside": "ˌaʊtˈsaɪd",
  "so": "səʊ",
  "will": "wɪl"
};

/**
 * Get phonetic transcription for a word
 * @param word The English word to get phonetic transcription for
 * @returns The phonetic transcription with slashes or empty string if not found
 */
export function getPhoneticTranscription(word: string): string {
  const normalizedWord = word.toLowerCase().trim();
  const phonetic = phoneticDictionary[normalizedWord] || "";
  return phonetic ? `/${phonetic}/` : "";
}
