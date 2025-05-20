"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SentencePractice } from "@/components/sentence-practice"
import { WordLearning } from "@/components/word-learning"
import { ReviewSystem } from "@/components/review-system"
import {
  UserProgress,
  WordProgress,
  SentenceProgress,
  initUserProgress,
  initWordProgress,
  initSentenceProgress,
  updateWordProgress,
  updateSentenceProgress,
  saveProgress,
  loadProgress
} from "@/utils/spaced-repetition"
import { wordDictionary } from "@/utils/word-dictionary"

// Exercise data
const exerciseData = [
  {
    word: "bird",
    translation: "鸟",
    sentences: [
      { english: "A bird", chinese: "一只鸟" },
      { english: "A bird is flying", chinese: "一只鸟在飞" },
      { english: "A bird is flying in the sky", chinese: "一只鸟在天空中飞翔" },
      { english: "The bird is flying and singing", chinese: "这只鸟在飞翔和歌唱" },
    ],
  },
  {
    word: "hair",
    translation: "头发",
    sentences: [
      { english: "Her hair", chinese: "她的头发" },
      { english: "Her hair is long", chinese: "她的头发很长" },
      { english: "Her hair is long and black", chinese: "她的头发又长又黑" },
      { english: "Her hair is long black and very beautiful", chinese: "她的头发又长又黑，非常漂亮" },
    ],
  },
  {
    word: "star",
    translation: "星星",
    sentences: [
      { english: "A star", chinese: "一颗星星" },
      { english: "A star is shining", chinese: "一颗星星在闪烁" },
      { english: "A star is shining in the sky", chinese: "一颗星星在天空中闪烁" },
      { english: "A little star is shining in the dark sky", chinese: "一颗小星星在黑夜的天空中闪烁" },
    ],
  },
  {
    word: "red",
    translation: "红色的",
    sentences: [
      { english: "It's red", chinese: "它是红色的" },
      { english: "The apple is red", chinese: "这个苹果是红色的" },
      { english: "The red apple is on the table", chinese: "这颗红苹果在桌子上" },
      { english: "The red apple is big and looks very sweet", chinese: "这颗红苹果又大又看起来很甜" },
    ],
  },
  {
    word: "girl",
    translation: "女孩",
    sentences: [
      { english: "A girl", chinese: "一个女孩" },
      { english: "A girl is smiling", chinese: "一个女孩在微笑" },
      { english: "A girl is smiling", chinese: "一个女孩在微笑" },
      { english: "A happy girl is smiling at her friend in the park", chinese: "一个快乐的女孩在公园里对她的朋友微笑" },
    ],
  },
  {
    word: "go",
    translation: "去",
    sentences: [
      { english: "Go out", chinese: "出去" },
      { english: "I go out", chinese: "我出去" },
      { english: "I go out to play", chinese: "我出去玩" },
      { english: "I go out to play with my friends", chinese: "我和朋友一起出去玩" },
    ],
  },
  {
    word: "door",
    translation: "门",
    sentences: [
      { english: "The door", chinese: "这扇门" },
      { english: "The door is open", chinese: "这扇门开着" },
      { english: "The door is open now", chinese: "这扇门现在是开着的" },
      { english: "The door is open now, and a cat is walking out", chinese: "门现在开着，一只猫正走出来" },
    ],
  },
  {
    word: "free",
    translation: "自由的/有空的",
    sentences: [
      { english: "I am free", chinese: "我是自由的" },
      { english: "I am free today", chinese: "我今天有空/我今天自由" },
      { english: "I am free today to play outside", chinese: "我今天有空可以出去玩" },
      { english: "I am free today, so I will play outside with my friends", chinese: "我今天有空，所以我会和朋友一起出去玩" },
    ],
  },
]

export default function EnglishPractice() {
  const { toast } = useToast()
  
  // 应用状态
  const [mode, setMode] = useState<'sentence' | 'word' | 'review'>('sentence')
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  
  // 单词学习状态
  const [currentLearningWord, setCurrentLearningWord] = useState('')
  const [errorWords, setErrorWords] = useState<string[]>([])
  const [errorIndices, setErrorIndices] = useState<number[]>([])
  
  // 进度跟踪
  const [userProgress, setUserProgress] = useState<UserProgress>(initUserProgress())
  
  // 初始化当前练习
  const currentExercise = exerciseData[currentExerciseIndex]
  const currentSentence = currentExercise?.sentences[currentStep]?.english || ''
  
  // 从本地存储加载进度
  useEffect(() => {
    const loadedProgress = loadProgress()
    if (loadedProgress) {
      setUserProgress(loadedProgress)
      setCurrentExerciseIndex(loadedProgress.currentExerciseIndex)
      setCurrentStep(loadedProgress.currentStep)
    }
  }, [])
  
  // 保存进度到本地存储
  const saveUserProgress = (updatedProgress: UserProgress) => {
    setUserProgress(updatedProgress)
    saveProgress(updatedProgress)
  }
  
  // 处理句子练习完成
  const handleSentenceComplete = (isCorrect: boolean, newErrorWords: string[], newErrorIndices: number[]) => {
    // 更新句子进度
    const updatedProgress = { ...userProgress }
    const sentenceKey = currentSentence
    
    if (!updatedProgress.sentences[sentenceKey]) {
      updatedProgress.sentences[sentenceKey] = initSentenceProgress(sentenceKey)
    }
    
    updatedProgress.sentences[sentenceKey] = updateSentenceProgress(
      updatedProgress.sentences[sentenceKey],
      isCorrect,
      newErrorWords
    )
    
    // 如果正确，进入下一步
    if (isCorrect) {
      moveToNextStep(updatedProgress)
    } else {
      // 如果错误，进入单词学习模式
      setErrorWords(newErrorWords)
      setErrorIndices(newErrorIndices)
      
      // 开始学习第一个错误的单词
      if (newErrorWords.length > 0) {
        setCurrentLearningWord(newErrorWords[0])
        setMode('word')
      }
      
      saveUserProgress(updatedProgress)
    }
  }
  
  // 处理单词学习完成
  const handleWordComplete = (isCorrect: boolean) => {
    // 更新单词进度
    const updatedProgress = { ...userProgress }
    const wordKey = currentLearningWord
    
    if (!updatedProgress.words[wordKey]) {
      updatedProgress.words[wordKey] = initWordProgress(wordKey)
    }
    
    updatedProgress.words[wordKey] = updateWordProgress(
      updatedProgress.words[wordKey],
      isCorrect
    )
    
    saveUserProgress(updatedProgress)
    
    // 移除已学习的单词
    const remainingWords = errorWords.filter(word => word !== currentLearningWord)
    
    if (remainingWords.length > 0) {
      // 继续学习下一个单词
      setErrorWords(remainingWords)
      setCurrentLearningWord(remainingWords[0])
    } else {
      // 所有单词学习完成，返回句子练习
      toast({
        title: "单词学习完成",
        description: "现在让我们再次尝试完成整个句子。",
        variant: "default",
      })
      setMode('sentence')
    }
  }
  
  // 处理复习模式
  const handleStartWordReview = (word: string) => {
    setCurrentLearningWord(word)
    setMode('word')
    
    // 标记为正在复习
    const updatedProgress = { ...userProgress }
    if (updatedProgress.words[word]) {
      updatedProgress.words[word].inReview = true
      saveUserProgress(updatedProgress)
    }
  }
  
  const handleStartSentenceReview = (sentence: string) => {
    // 找到对应的练习和步骤
    for (let i = 0; i < exerciseData.length; i++) {
      for (let j = 0; j < exerciseData[i].sentences.length; j++) {
        if (exerciseData[i].sentences[j].english === sentence) {
          setCurrentExerciseIndex(i)
          setCurrentStep(j)
          setMode('sentence')
          
          // 标记为正在复习
          const updatedProgress = { ...userProgress }
          if (updatedProgress.sentences[sentence]) {
            updatedProgress.sentences[sentence].inReview = true
            saveUserProgress(updatedProgress)
          }
          
          return
        }
      }
    }
  }
  
  // 跳过复习
  const handleSkipReview = () => {
    // 推迟所有待复习项的复习时间（延迟1小时）
    const updatedProgress = { ...userProgress };
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000; // 1小时的毫秒数
    
    // 推迟单词复习
    Object.keys(updatedProgress.words).forEach(wordKey => {
      const wordProgress = updatedProgress.words[wordKey];
      if (wordProgress.nextReview <= now) {
        wordProgress.nextReview = now + oneHourMs;
      }
    });
    
    // 推迟句子复习
    Object.keys(updatedProgress.sentences).forEach(sentenceKey => {
      const sentenceProgress = updatedProgress.sentences[sentenceKey];
      if (sentenceProgress.nextReview <= now) {
        sentenceProgress.nextReview = now + oneHourMs;
      }
    });
    
    // 保存更新后的进度
    saveUserProgress(updatedProgress);
    
    // 显示提示
    toast({
      title: "复习已推迟",
      description: "复习项已推迟1小时，稍后会再次提醒你。",
      variant: "default",
    });
    
    // 切换回句子练习模式
    setMode('sentence');
  }
  
  // 移动到下一步
  const moveToNextStep = (progress: UserProgress) => {
    let updatedProgress = { ...progress }
    
    if (currentStep < currentExercise.sentences.length - 1) {
      // 进入当前练习的下一句
      setCurrentStep(currentStep + 1)
      updatedProgress.currentStep = currentStep + 1
    } else {
      // 当前练习组完成
      if (currentExerciseIndex < exerciseData.length - 1) {
        // 进入下一组练习
        const nextExerciseIndex = currentExerciseIndex + 1
        setCurrentExerciseIndex(nextExerciseIndex)
        setCurrentStep(0)
        updatedProgress.currentExerciseIndex = nextExerciseIndex
        updatedProgress.currentStep = 0
        
        toast({
          title: "已完成当前练习组",
          description: `现在开始练习单词 "${exerciseData[nextExerciseIndex].word}" (${exerciseData[nextExerciseIndex].translation})`,
          variant: "default",
        })
      } else {
        // 所有练习完成
        toast({
          title: "恭喜！",
          description: "你已完成所有练习。你可以继续复习之前的内容。",
          variant: "default",
        })
      }
    }
    
    saveUserProgress(updatedProgress)
  }
  
  // 获取单词的中文翻译
  const getWordTranslation = (word: string): string | undefined => {
    const normalizedWord = word.toLowerCase().trim();
    
    // 首先在词典中查找
    if (wordDictionary[normalizedWord]) {
      return wordDictionary[normalizedWord];
    }
    
    // 处理单词的变形（如复数形式）
    if (normalizedWord.endsWith('s') && wordDictionary[normalizedWord.slice(0, -1)]) {
      return wordDictionary[normalizedWord.slice(0, -1)];
    }
    
    if (normalizedWord.endsWith('ing') && wordDictionary[normalizedWord.slice(0, -3)]) {
      return wordDictionary[normalizedWord.slice(0, -3)] + '（进行中）';
    }
    
    if (normalizedWord.endsWith('ed') && wordDictionary[normalizedWord.slice(0, -2)]) {
      return wordDictionary[normalizedWord.slice(0, -2)] + '（过去式）';
    }
    
    // 如果词典中找不到，在 exerciseData 中查找单词
    for (const exercise of exerciseData) {
      if (exercise.word.toLowerCase() === normalizedWord) {
        return exercise.translation;
      }
    }
    
    // 如果在主题单词中找不到，尝试在句子中查找
    for (const exercise of exerciseData) {
      for (const sentence of exercise.sentences) {
        const words = sentence.english.toLowerCase().split(/\s+/);
        if (words.some(w => w.replace(/[.,!?]/g, '') === normalizedWord)) {
          return exercise.translation + '（相关主题）'; // 返回相关主题的翻译
        }
      }
    }
    
    return '未知单词'; // 如果找不到翻译，返回“未知单词”
  };
  
  // 重置所有进度
  const resetProgress = () => {
    if (confirm("确定要重置所有学习进度吗？这将删除所有记录的学习数据。")) {
      const newProgress = initUserProgress()
      saveUserProgress(newProgress)
      setCurrentExerciseIndex(0)
      setCurrentStep(0)
      setMode('sentence')
      
      toast({
        title: "进度已重置",
        description: "所有学习进度已被重置。",
        variant: "default",
      })
    }
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* 复习系统 */}
      {mode === 'sentence' && (
        <ReviewSystem
          wordProgress={userProgress.words}
          sentenceProgress={userProgress.sentences}
          onStartWordReview={handleStartWordReview}
          onStartSentenceReview={handleStartSentenceReview}
          onSkipReview={handleSkipReview}
        />
      )}
      
      {/* 重置进度按钮 */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={resetProgress} className="flex items-center gap-1">
          <RotateCcw className="h-4 w-4" />
          重置进度
        </Button>
      </div>
      
      {/* 句子练习模式 */}
      {mode === 'sentence' && currentExercise && (
        <SentencePractice
          exerciseData={exerciseData}
          currentExerciseIndex={currentExerciseIndex}
          currentStep={currentStep}
          onComplete={handleSentenceComplete}
          sentenceProgress={userProgress.sentences[currentSentence]}
        />
      )}
      
      {/* 单词学习模式 */}
      {mode === 'word' && currentLearningWord && (
        <WordLearning
          word={currentLearningWord}
          translation={getWordTranslation(currentLearningWord)}
          onComplete={handleWordComplete}
          wordProgress={userProgress.words[currentLearningWord]}
        />
      )}
    </div>
  )
}
