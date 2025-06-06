"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, CheckCircle, AlertCircle } from "lucide-react"
import { WordProgress, updateWordProgress } from "@/utils/spaced-repetition"
import { getPhoneticTranscription } from "@/utils/phonetic-transcription"

interface WordLearningProps {
  word: string;
  translation?: string; // 添加中文翻译属性
  onComplete: (isCorrect: boolean) => void;
  wordProgress?: WordProgress;
}

export function WordLearning({ word, translation, onComplete, wordProgress }: WordLearningProps) {
  const [userInput, setUserInput] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0) // 提示级别，每次错误增加一个字母
  
  // 添加音效引用
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const checkButtonRef = useRef<HTMLButtonElement>(null)

  // Reset state when word changes
  useEffect(() => {
    setUserInput("")
    setIsChecking(false)
    setIsCorrect(false)
    setAttempts(0)
    setShowHint(false)
    setHintLevel(0) // 重置提示级别
    
    // Focus input after a short delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }, [word])

  // Play audio for the word
  const playAudio = () => {
    console.log('尝试播放单词:', word);
    // 先播放哔声，确保声音系统工作
    try {
      // 创建音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // 设置参数
      oscillator.type = 'sine';
      oscillator.frequency.value = 800; // 频率
      gainNode.gain.value = 0.1; // 音量
      
      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 播放短暂的哔声
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        // 在哔声后尝试播放语音
        try {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = "en-US";
          utterance.rate = 0.8;
          window.speechSynthesis.speak(utterance);
          console.log('语音播放成功');
        } catch (speechError) {
          console.error('语音播放失败:', speechError);
        }
      }, 200);
      
      console.log('哔声播放成功');
    } catch (error) {
      console.error('哔声播放失败:', error);
      // 如果哔声失败，直接尝试播放语音
      try {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('直接播放语音也失败:', e);
      }
    }
  }

  // Auto-play audio when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      playAudio()
    }, 500)
    return () => clearTimeout(timer)
  }, [word])
  
  // 使用 ref 来跟踪是否已经显示过提示
  const hasShownToastRef = useRef(false);
  
  // 添加全局快捷键监听
  useEffect(() => {
    // 只在第一次渲染时显示提示，避免无限循环
    if (!hasShownToastRef.current) {
      // 设置标志位为已显示
      hasShownToastRef.current = true;
      
      // 使用自定义 toast 样式
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-md z-50';
      toast.innerHTML = `
        <div class="font-medium">快捷键已启用</div>
        <div class="text-sm mt-1 text-gray-300">按 Ctrl+A 朗读单词</div>
      `;
      document.body.appendChild(toast);
      
      // 3秒后移除提示
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
    
    // 简单的快捷键监听函数
    function handleKeyPress(event: KeyboardEvent) {
      // 如果用户正在输入文本，不触发快捷键
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // 如果按下 Ctrl+A 组合键，则播放音频
      if (event.ctrlKey && (event.key === 'a' || event.key === 'A')) {
        console.log('检测到 Ctrl+A 组合键');
        event.preventDefault(); // 防止浏览器默认行为
        playAudio();
      }
    }
    
    // 直接监听 document 的 keydown 事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // 移除依赖项，避免重新添加事件监听器

  // Check the user's answer
  const checkAnswer = () => {
    setIsChecking(true)
    setAttempts(attempts + 1)
    
    const userInputNormalized = userInput.toLowerCase().trim();
    const wordNormalized = word.toLowerCase().trim();
    const correct = userInputNormalized === wordNormalized;
    setIsCorrect(correct)
    
    // 播放音效
    if (correct) {
      // 播放正确音效
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(e => console.error("播放音效失败:", e));
      }
      
      // Complete after a short delay to show feedback
      setTimeout(() => {
        onComplete(true)
      }, 1500)
    } else {
      // 播放错误音效
      if (incorrectSoundRef.current) {
        incorrectSoundRef.current.currentTime = 0;
        incorrectSoundRef.current.play().catch(e => console.error("播放音效失败:", e));
      }
      // 判断用户已经输入正确的部分
      let correctChars = 0;
      for (let i = 0; i < Math.min(userInputNormalized.length, wordNormalized.length); i++) {
        if (userInputNormalized[i] === wordNormalized[i]) {
          correctChars++;
        } else {
          break; // 一旦发现不匹配的字符，停止计数
        }
      }
      
      // 如果用户输入了正确的字符，将提示级别设置为正确字符数
      // 如果用户输入了错误的字符，则提示下一个字符
      setHintLevel(Math.min(correctChars, wordNormalized.length - 1));
      
      // 始终显示提示
      setShowHint(true);
    }
  }

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      
      if (!isChecking) {
        checkAnswer()
      } else if (!isCorrect) {
        // Reset for another attempt
        setIsChecking(false)
        setUserInput("")
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 10)
      }
    }
  }

  // Generate hint based on user input and correct word
  const generateHint = () => {
    const userInputNormalized = userInput.toLowerCase().trim();
    const wordNormalized = word.toLowerCase().trim();
    
    // 判断用户已经输入正确的部分
    let correctChars = 0;
    for (let i = 0; i < Math.min(userInputNormalized.length, wordNormalized.length); i++) {
      if (userInputNormalized[i] === wordNormalized[i]) {
        correctChars++;
      } else {
        break;
      }
    }
    
    // 生成智能提示，显示用户已经输入正确的部分和下一个字母
    let intelligentHint = "";
    for (let i = 0; i < word.length; i++) {
      if (i < correctChars) {
        // 用户已经输入正确的部分
        intelligentHint += `<span class="text-green-500">${word[i]}</span>`;
      } else if (i === correctChars) {
        // 下一个需要提示的字母，用高亮显示
        intelligentHint += `<span class="text-blue-500 font-bold">${word[i]}</span>`;
      } else if (i <= hintLevel) {
        // 其他已提示的字母
        intelligentHint += word[i];
      } else {
        // 未提示的字母用下划线代替
        intelligentHint += "_";
      }
    }
    
    // 生成提示信息
    let hint = `已输入正确: ${correctChars} 个字母`;
    
    // 显示单词长度
    hint += `, 总长度: ${word.length} 个字母`;
    
    // 如果提示级别足够高，显示中文提示
    if (hintLevel >= Math.floor(word.length / 2) && translation) {
      hint += `, 中文: ${translation}`;
    }
    
    return { textHint: hint, visualHint: intelligentHint };
  }

  return (
    <Card className="w-full">
      {/* 添加音效元素 */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-2xl">
          单词学习
          <Button variant="ghost" size="icon" onClick={playAudio} aria-label="播放音频">
            <Volume2 className="h-6 w-6" />
          </Button>
        </CardTitle>
        <CardDescription className="text-lg">
          请拼写你听到的单词 {translation && <span className="font-medium">({translation})</span>}
          {wordProgress && (
            <div className="mt-2 text-sm">
              <span>正确: {wordProgress.correctCount} 次</span>
              <span className="ml-4">错误: {wordProgress.incorrectCount} 次</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-col items-center gap-4 mb-10">
            {/* 显示单词的音标 */}
            <div className="text-center mb-1">
              <span className="text-slate-400 text-sm">{getPhoneticTranscription(word)}</span>
            </div>
            <input
  ref={inputRef}
  value={userInput}
  onChange={(e) => setUserInput(e.target.value)}
  onKeyDown={handleKeyDown}
  className={`
    bg-transparent 
    border-0 
    border-b 
    focus:ring-0 
    focus:outline-none 
    px-2 
    py-2 
    text-center
    text-xl
    w-full
    max-w-xs
    transition-all
    duration-300
    ${isChecking
      ? isCorrect
        ? "border-green-500 text-green-600 animate-none"
        : "border-red-500 text-red-600 shake"
      : "border-gray-300 focus:border-primary animate-none"
    }
  `}
  placeholder="输入单词"
  autoFocus
/>
{/* 错误高亮部分提示 */}
{!isCorrect && isChecking && userInput && (() => {
  const userInputNormalized = userInput.toLowerCase().trim();
  const wordNormalized = word.toLowerCase().trim();
  let errorIndex = -1;
  for (let i = 0; i < Math.min(userInputNormalized.length, wordNormalized.length); i++) {
    if (userInputNormalized[i] !== wordNormalized[i]) {
      errorIndex = i;
      break;
    }
  }
  if (errorIndex !== -1) {
    return (
      <div className="mt-2 text-red-500 text-center text-base">
        第{errorIndex + 1}个字母有误
        <br />
        <span>
          {userInput.split('').map((c, idx) =>
            idx === errorIndex ?
              <span key={idx} className="bg-red-200 underline underline-offset-4 rounded px-1">{c}</span> :
              <span key={idx}>{c}</span>
          )}
        </span>
      </div>
    )
  }
  return null;
})()}
          </div>

          {isChecking && (
            <div className="mt-6 p-4 rounded-md bg-muted">
              <div className="flex items-center gap-3 mb-3 text-lg">
                {isCorrect ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-medium text-green-600 text-lg">正确！</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <span className="font-medium text-red-600 text-lg">
                      不正确，请再试一次
                    </span>
                  </>
                )}
              </div>

              {!isCorrect && showHint && (
                <div className="mt-2 text-base">
                  <div className="font-medium text-center text-2xl mb-3" 
                    dangerouslySetInnerHTML={{ __html: generateHint().visualHint }}
                  />
                  <p className="text-center text-base">{generateHint().textHint}</p>
                  <p className="text-center mt-2 text-sm text-muted-foreground">
                    请根据提示继续输入，<span className="text-blue-500 font-bold">蓝色</span> 字母是下一个需要输入的
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      {/* shake 动画样式 */}
<style jsx>{`
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.shake {
  animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
}
`}</style>
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
            } else if (!isCorrect) {
              // Reset for another attempt
              setIsChecking(false)
              setUserInput("")
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus()
                }
              }, 10)
            }
          }}
          className="text-base px-6 py-5"
        >
          {!isChecking ? "检查" : !isCorrect ? "再试一次" : "正确！"}
        </Button>
      </CardFooter>
    </Card>
  )
}
