"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentExercise, setCurrentExercise] = useState(exerciseData[0])
  const [currentStep, setCurrentStep] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [wordInputs, setWordInputs] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)
  const [feedback, setFeedback] = useState<{
    correct: boolean
    errors: { index: number; word: string; correctWord: string }[]
  }>({ correct: false, errors: [] })

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const checkButtonRef = useRef<HTMLButtonElement>(null)

  // Split the current sentence into words
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
        // Focus on the "Check Answer" button if not in checking mode, otherwise check if all correct
        if (!isChecking) {
          setTimeout(() => checkButtonRef.current?.focus(), 100)
        } else {
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
          // 自动进入下一步
          nextStep()
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
  }

  // Move to next step
  const nextStep = () => {
    // 只有当所有单词都正确时才允许进入下一步
    if (!allCorrect) {
      toast({
        title: "请先纠正错误",
        description: "在进入下一句之前，请确保当前句子中的所有单词都正确。",
        variant: "destructive",
      })
      return
    }

    if (currentStep < currentExercise.sentences.length - 1) {
      // 如果当前练习组还有下一步，进入下一步
      setCurrentStep(currentStep + 1)
    } else {
      // 如果当前练习组已完成，检查是否还有下一组练习
      if (currentExerciseIndex < exerciseData.length - 1) {
        // 还有下一组练习，切换到下一组
        const nextExerciseIndex = currentExerciseIndex + 1
        setCurrentExerciseIndex(nextExerciseIndex)
        setCurrentExercise(exerciseData[nextExerciseIndex])
        setCurrentStep(0) // 重置到新练习组的第一步
        toast({
          title: "已完成当前练习组",
          description: `现在开始练习单词 "${exerciseData[nextExerciseIndex].word}" (${exerciseData[nextExerciseIndex].translation})`,
          variant: "default",
        })
      } else {
        // 所有练习组已完成
        alert("恭喜！你已完成所有练习。")
      }
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
    <div className="container mx-auto py-8 max-w-4xl">
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-xl font-medium mb-3">
              步骤 {currentStep + 1}/{currentExercise.sentences.length}
            </p>
            <p className="text-muted-foreground mb-6 text-lg">{currentExercise.sentences[currentStep].chinese}</p>

            <div className="flex flex-wrap gap-4 mb-10">
              {currentWords.map((word, index) => (
                <div key={index} className="relative">
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
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
                    ${isChecking
                        ? (
                          wordInputs[index] &&
                          currentWords[index] &&
                          wordInputs[index].toLowerCase() === currentWords[index].toLowerCase()
                        )
                          ? "border-green-500 text-green-600"
                          : "border-red-500 text-red-600"
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
              } else {
                nextStep()
              }
            }}
            disabled={isChecking && !allCorrect}
            className={`text-base px-6 py-5 ${isChecking && !allCorrect ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {!isChecking
              ? "检查答案"
              : currentStep < currentExercise.sentences.length - 1
                ? "下一步"
                : "完成"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
