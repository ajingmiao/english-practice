"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SentenceProgress, updateSentenceProgress } from "@/utils/spaced-repetition"

interface SentencePracticeProps {
  exerciseData: any;
  currentExerciseIndex: number;
  currentStep: number;
  onComplete: (
    isCorrect: boolean, 
    errorWords: string[], 
    errorIndices: number[]
  ) => void;
  sentenceProgress?: SentenceProgress;
}

export function SentencePractice({ 
  exerciseData, 
  currentExerciseIndex, 
  currentStep,
  onComplete,
  sentenceProgress
}: SentencePracticeProps) {
  const { toast } = useToast()
  const [userInput, setUserInput] = useState("")
  const [wordInputs, setWordInputs] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)
  const [successDelay, setSuccessDelay] = useState(false) // 添加成功后的延迟状态
  const [feedback, setFeedback] = useState<{
    correct: boolean
    errors: { index: number; word: string; correctWord: string }[]
  }>({ correct: false, errors: [] })

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const checkButtonRef = useRef<HTMLButtonElement>(null)

  const currentExercise = exerciseData[currentExerciseIndex]
  const currentSentence = currentExercise.sentences[currentStep].english
  const currentWords = currentSentence.split(" ")

  useEffect(() => {
    // Reset state when changing steps
    setUserInput("")
    setWordInputs(Array(currentWords.length).fill(""))
    setCurrentWordIndex(0)
    setIsChecking(false)
    setAllCorrect(false)
    setFeedback({ correct: false, errors: [] })

    // Focus on the first input field after a short delay to ensure the DOM is updated
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, 100)
  }, [currentStep, currentWords.length, currentExercise])

  // Function to play audio of the current sentence
  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentSentence)
    utterance.lang = "en-US"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  // Auto-play audio when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      playAudio()
    }, 500)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Validate all inputs and update allCorrect state
  const validateInputs = () => {
    for (let i = 0; i < currentWords.length; i++) {
      const input = wordInputs[i]
      const correctWord = currentWords[i]

      if (!input || !correctWord || input.toLowerCase() !== correctWord.toLowerCase()) {
        return false
      }
    }
    return true
  }

  // Effect to check if all inputs are correct after user makes changes
  useEffect(() => {
    if (isChecking) {
      const isAllCorrect = validateInputs()
      setAllCorrect(isAllCorrect)

      // Update feedback if all inputs are now correct
      if (isAllCorrect && feedback.errors.length > 0) {
        setFeedback({
          correct: true,
          errors: [],
        })
        
        // 当用户修改后答案正确，自动进入成功延迟状态
        setSuccessDelay(true)
        
        // 4秒后自动进入下一步
        setTimeout(() => {
          onComplete(true, [], [])
          setSuccessDelay(false)
        }, 4000)
      }
    }
  }, [wordInputs, isChecking])

  // Handle input for individual words
  const handleWordInput = (index: number, value: string) => {
    const newWordInputs = [...wordInputs]
    newWordInputs[index] = value
    setWordInputs(newWordInputs)

    // Only auto-jump if space is detected or the word is complete (not just a single character)
    if (value.endsWith(" ") || (value.length >= currentWords[index].length && value.length > 1)) {
      const cleanValue = value.trim()
      newWordInputs[index] = cleanValue
      setWordInputs(newWordInputs)

      // If this is the last word and the length matches or exceeds the correct word
      if (index === currentWords.length - 1 && cleanValue.length >= currentWords[index].length) {
        // 检查当前单词是否正确
        const isCurrentWordCorrect = cleanValue.toLowerCase() === currentWords[index].toLowerCase();
        
        // 如果当前单词正确，且不在检查模式，则焦点移到检查按钮
        if (isCurrentWordCorrect && !isChecking) {
          setTimeout(() => checkButtonRef.current?.focus(), 100)
        } else if (isChecking) {
          // If we're already in checking mode, validate the inputs
          const isAllCorrect = validateInputs()
          if (isAllCorrect) {
            setAllCorrect(true)
            setFeedback({
              correct: true,
              errors: [],
            })
          }
        }
        // 如果当前单词不正确，焦点保持在当前输入框，不做任何操作
      } else if (index < currentWords.length - 1) {
        // Otherwise, move to the next word input
        setCurrentWordIndex(index + 1)
        // Use setTimeout to ensure the current keystroke is processed before changing focus
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus()
        }, 10)
      }
    }
  }

  // Handle backspace key in empty input to go to previous input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // 防止按键事件传播到其他输入框
    e.stopPropagation()

    // 如果按下的是回车键，执行检查答案或者在已经检查且修改正确后继续检查
    if (e.key === "Enter") {
      e.preventDefault()
      if (!isChecking) {
        // 如果还没有检查，则执行检查
        checkAnswer()
      } else {
        // 如果已经在检查状态，检查是否所有输入都正确
        const isAllCorrect = validateInputs()
        if (isAllCorrect) {
          // 如果所有输入都正确，设置allCorrect为true并更新反馈
          setAllCorrect(true)
          setFeedback({
            correct: true,
            errors: [],
          })
          
          // 通知父组件完成
          const errorWords: string[] = []
          const errorIndices: number[] = []
          onComplete(true, errorWords, errorIndices)
        } else {
          // 如果还有错误，重新检查并更新错误信息
          checkAnswer()
        }
      }
      return
    }

    // 如果按下的是后退键（Backspace）且当前输入框为空
    if (e.key === "Backspace" && (!wordInputs[index] || wordInputs[index] === "")) {
      // 如果不是第一个输入框，则跳转到上一个输入框
      if (index > 0) {
        e.preventDefault() // 阻止默认的后退键行为
        setCurrentWordIndex(index - 1)

        // 聚焦到上一个输入框
        setTimeout(() => {
          const prevInput = inputRefs.current[index - 1]
          if (prevInput) {
            prevInput.focus()

            // 将光标放在文本末尾
            const length = wordInputs[index - 1]?.length || 0
            prevInput.setSelectionRange(length, length)
          }
        }, 10)
      }
    }
  }

  // Check the user's answer
  const checkAnswer = () => {
    setIsChecking(true)

    const errorIndices: number[] = []
    const errors = wordInputs
      .map((input, index) => {
        // Add null checks before calling toLowerCase()
        if (input && currentWords[index]) {
          if (input.toLowerCase() !== currentWords[index].toLowerCase()) {
            errorIndices.push(index)
            return {
              index,
              word: input,
              correctWord: currentWords[index],
            }
          }
        } else {
          // Handle case where input or currentWords[index] is undefined
          errorIndices.push(index)
          return {
            index,
            word: input || "",
            correctWord: currentWords[index] || "",
          }
        }
        return null
      })
      .filter(Boolean) as { index: number; word: string; correctWord: string }[]

    const isCorrect = errors.length === 0
    setAllCorrect(isCorrect)

    setFeedback({
      correct: isCorrect,
      errors,
    })

    // 如果有错误，清空错误的输入内容并将焦点定位到第一个错误
    if (!isCorrect && errorIndices.length > 0) {
      // 创建新的输入数组，清空错误的输入
      const newWordInputs = [...wordInputs]
      errorIndices.forEach((index) => {
        newWordInputs[index] = ""
      })
      setWordInputs(newWordInputs)

      // 将焦点设置到第一个错误的输入框
      const firstErrorIndex = errorIndices[0]
      setCurrentWordIndex(firstErrorIndex)

      // 使用setTimeout确保DOM更新后再设置焦点
      setTimeout(() => {
        if (inputRefs.current[firstErrorIndex]) {
          inputRefs.current[firstErrorIndex].focus()
        }
      }, 50)
    }

    // 通知父组件检查结果
    if (isCorrect) {
      onComplete(true, [], [])
    } else {
      // 获取错误的单词列表
      const errorWords = errors.map(err => err.correctWord)
      onComplete(false, errorWords, errorIndices)
    }
  }

  // Generate detailed error feedback
  const getDetailedFeedback = (userWord: string, correctWord: string) => {
    let feedback = ""

    // Compare each character
    for (let i = 0; i < Math.max(userWord.length, correctWord.length); i++) {
      if (i >= userWord.length) {
        feedback += `缺少字母 "${correctWord.slice(i)}"`
        break
      } else if (i >= correctWord.length) {
        feedback += `多余字母 "${userWord.slice(i)}"`
        break
      } else if (userWord[i] !== correctWord[i]) {
        feedback += `第 ${i + 1} 个字母应为 "${correctWord[i]}" 而不是 "${userWord[i]}"`
        break
      }
    }

    return feedback || "拼写错误"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-2xl">
          英语句子构建练习
          <Button variant="ghost" size="icon" onClick={playAudio} aria-label="播放音频">
            <Volume2 className="h-6 w-6" />
          </Button>
        </CardTitle>
        <CardDescription className="text-lg">
          从单词 "{currentExercise.word}" ({currentExercise.translation}) 开始构建句子
          {sentenceProgress && (
            <div className="mt-2 text-sm">
              <span>正确: {sentenceProgress.correctCount} 次</span>
              <span className="ml-4">错误: {sentenceProgress.incorrectCount} 次</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-xl font-medium mb-3">
            步骤 {currentStep + 1}/{currentExercise.sentences.length}
          </p>
          <p className="text-muted-foreground mb-6 text-lg">{currentExercise.sentences[currentStep].chinese}</p>

          {/* 当答案全部正确时，隐藏输入框，显示完整句子 */}
          {isChecking && allCorrect ? (
            <div className="flex flex-wrap gap-4 mb-10 justify-center">
              <p className="text-xl font-bold text-green-600">{currentSentence}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 mb-10">
              {currentWords.map((word: string, index: number) => (
                <div key={index} className="relative">
                  <input
                    ref={(el: HTMLInputElement | null) => {
                      if (inputRefs.current) {
                        inputRefs.current[index] = el;
                      }
                    }}
                    value={wordInputs[index] || ""}
                    onChange={(e) => handleWordInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`
                    bg-transparent 
                    border-0 
                    border-b 
                    focus:ring-0 
                    focus:outline-none 
                    px-2 
                    py-2 
                    text-center
                    ${(
                      wordInputs[index] &&
                      currentWords[index] &&
                      wordInputs[index].toLowerCase() === currentWords[index].toLowerCase()
                    )
                      ? "border-green-500 text-green-600"
                      : isChecking
                        ? "border-red-500 text-red-600"
                        : "border-gray-300 focus:border-primary"
                    }
                  `}
                    style={{ width: `${Math.max(word.length * 10, 60)}px` }} // 控制宽度在 60px 起步
                    placeholder=""
                    autoFocus={index === currentWordIndex}
                    onFocus={() => setCurrentWordIndex(index)}
                  />
                  {isChecking &&
                    (wordInputs[index] === undefined ||
                      currentWords[index] === undefined ||
                      wordInputs[index].toLowerCase() !== currentWords[index].toLowerCase()) && (
                      <span className="absolute -bottom-6 left-0 text-xs text-red-500 whitespace-nowrap">
                        {currentWords[index]}
                      </span>
                    )}
                </div>
              ))}
            </div>
          )}

          {isChecking && (
            <div className="mt-6 p-4 rounded-md bg-muted">
              <div className="flex items-center gap-3 mb-3 text-lg">
                {feedback.correct ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-medium text-green-600 text-lg">正确！</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <span className="font-medium text-red-600 text-lg">需要修正</span>
                  </>
                )}
              </div>
              
              {/* 当答案正确时，显示完整句子（加粗） */}
              {feedback.correct && (
                <div className="my-4 text-center">
                  <p className="text-xl font-bold">{currentSentence}</p>
                </div>
              )}

              {feedback.errors.length > 0 && (
                <ul className="list-disc pl-6 space-y-2 text-base">
                  {feedback.errors.map((error, i) => (
                    <li key={i}>
                      <span className="font-medium">单词 {error.index + 1}:</span>{" "}
                      {getDetailedFeedback(error.word, error.correctWord)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-6">
        <Button variant="outline" onClick={playAudio} className="text-base px-6 py-5">
          重新播放
        </Button>

        <Button
          ref={checkButtonRef}
          onClick={() => {
            if (!isChecking) {
              checkAnswer()
            } else if (allCorrect && !successDelay) {
              // 设置成功后的延迟状态
              setSuccessDelay(true)
              
              // 4秒后自动进入下一步
              setTimeout(() => {
                onComplete(true, [], [])
                setSuccessDelay(false)
              }, 4000)
            } else if (allCorrect && successDelay) {
              // 如果已经在延迟状态，用户可以手动加速进入下一步
              onComplete(true, [], [])
              setSuccessDelay(false)
            } else {
              // 如果答案不正确，允许重新检查
              checkAnswer()
            }
          }}
          className="text-base px-6 py-5"
          disabled={successDelay}
        >
          {!isChecking
            ? "检查答案"
            : allCorrect ? (successDelay ? "正在跳转..." : "继续") : "重新检查"}
        </Button>
      </CardFooter>
    </Card>
  )
}
