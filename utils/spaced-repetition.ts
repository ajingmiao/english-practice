// Spaced repetition system for English practice

// Review intervals in days
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

// Types for progress tracking
export interface WordProgress {
  word: string;
  correctCount: number;
  incorrectCount: number;
  lastPracticed: number; // timestamp
  nextReview: number; // timestamp
  level: number; // 0-6 corresponding to intervals
  inReview: boolean;
}

export interface SentenceProgress {
  sentence: string;
  correctCount: number;
  incorrectCount: number;
  lastPracticed: number;
  nextReview: number;
  level: number;
  inReview: boolean;
  wordErrors: string[]; // words that were incorrect in this sentence
}

export interface UserProgress {
  words: Record<string, WordProgress>;
  sentences: Record<string, SentenceProgress>;
  currentExerciseIndex: number;
  currentStep: number;
  points: number; // 用户积分
}

// Initialize progress for a new word
export function initWordProgress(word: string): WordProgress {
  return {
    word,
    correctCount: 0,
    incorrectCount: 0,
    lastPracticed: Date.now(),
    nextReview: Date.now(), // immediate review
    level: 0,
    inReview: false,
  };
}

// Initialize progress for a new sentence
export function initSentenceProgress(sentence: string): SentenceProgress {
  return {
    sentence,
    correctCount: 0,
    incorrectCount: 0,
    lastPracticed: Date.now(),
    nextReview: Date.now(), // immediate review
    level: 0,
    inReview: false,
    wordErrors: [],
  };
}

// Initialize user progress
export function initUserProgress(): UserProgress {
  return {
    words: {},
    sentences: {},
    currentExerciseIndex: 0,
    currentStep: 0,
    points: 0, // 初始积分为0
  };
}

// Update word progress after practice
export function updateWordProgress(
  progress: WordProgress,
  isCorrect: boolean
): WordProgress {
  const now = Date.now();
  const updatedProgress = { ...progress };
  
  if (isCorrect) {
    updatedProgress.correctCount += 1;
    
    // Move to next level if correct
    if (updatedProgress.level < REVIEW_INTERVALS.length - 1) {
      updatedProgress.level += 1;
    }
  } else {
    updatedProgress.incorrectCount += 1;
    
    // Reset level if incorrect
    updatedProgress.level = Math.max(0, updatedProgress.level - 1);
  }
  
  updatedProgress.lastPracticed = now;
  
  // Calculate next review time based on level
  const intervalDays = REVIEW_INTERVALS[updatedProgress.level];
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  updatedProgress.nextReview = now + intervalMs;
  
  return updatedProgress;
}

// Update sentence progress after practice
export function updateSentenceProgress(
  progress: SentenceProgress,
  isCorrect: boolean,
  errorWords: string[] = []
): SentenceProgress {
  const now = Date.now();
  const updatedProgress = { ...progress };
  
  if (isCorrect) {
    updatedProgress.correctCount += 1;
    
    // Move to next level if correct
    if (updatedProgress.level < REVIEW_INTERVALS.length - 1) {
      updatedProgress.level += 1;
    }
    
    // Clear word errors if sentence is correct
    updatedProgress.wordErrors = [];
  } else {
    updatedProgress.incorrectCount += 1;
    
    // Reset level if incorrect
    updatedProgress.level = Math.max(0, updatedProgress.level - 1);
    
    // Update word errors
    updatedProgress.wordErrors = [...new Set([...updatedProgress.wordErrors, ...errorWords])];
  }
  
  updatedProgress.lastPracticed = now;
  
  // Calculate next review time based on level
  const intervalDays = REVIEW_INTERVALS[updatedProgress.level];
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  updatedProgress.nextReview = now + intervalMs;
  
  return updatedProgress;
}

// Get items due for review
export function getDueItems<T extends WordProgress | SentenceProgress>(
  items: Record<string, T>
): T[] {
  const now = Date.now();
  return Object.values(items).filter(item => item.nextReview <= now);
}

// Save progress to localStorage
export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem('englishPracticeProgress', JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

// Load progress from localStorage
export function loadProgress(): UserProgress {
  try {
    const savedProgress = localStorage.getItem('englishPracticeProgress');
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  
  return initUserProgress();
}
