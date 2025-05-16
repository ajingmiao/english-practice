"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WordProgress, SentenceProgress, getDueItems } from "@/utils/spaced-repetition"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface ReviewSystemProps {
  wordProgress: Record<string, WordProgress>;
  sentenceProgress: Record<string, SentenceProgress>;
  onStartWordReview: (word: string) => void;
  onStartSentenceReview: (sentence: string) => void;
  onSkipReview: () => void;
}

export function ReviewSystem({
  wordProgress,
  sentenceProgress,
  onStartWordReview,
  onStartSentenceReview,
  onSkipReview
}: ReviewSystemProps) {
  const [dueWords, setDueWords] = useState<WordProgress[]>([])
  const [dueSentences, setDueSentences] = useState<SentenceProgress[]>([])
  const [showReview, setShowReview] = useState(false)

  // Check for due items on mount and when progress changes
  useEffect(() => {
    const words = getDueItems(wordProgress)
    const sentences = getDueItems(sentenceProgress)
    
    setDueWords(words)
    setDueSentences(sentences)
    setShowReview(words.length > 0 || sentences.length > 0)
  }, [wordProgress, sentenceProgress])

  if (!showReview) {
    return null
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">复习时间</CardTitle>
        <CardDescription className="text-lg">
          以下内容需要复习，以加强记忆
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dueWords.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3">单词复习</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueWords.slice(0, 6).map((item) => (
                <Button
                  key={item.word}
                  variant="outline"
                  className="justify-between p-4 h-auto"
                  onClick={() => onStartWordReview(item.word)}
                >
                  <span className="font-medium">{item.word}</span>
                  <span className="text-sm text-muted-foreground">
                    上次练习: {formatDistanceToNow(item.lastPracticed, { addSuffix: true, locale: zhCN })}
                  </span>
                </Button>
              ))}
            </div>
            {dueWords.length > 6 && (
              <p className="mt-2 text-sm text-muted-foreground">
                还有 {dueWords.length - 6} 个单词需要复习
              </p>
            )}
          </div>
        )}

        {dueSentences.length > 0 && (
          <div>
            <h3 className="text-xl font-medium mb-3">句子复习</h3>
            <div className="space-y-3">
              {dueSentences.slice(0, 3).map((item) => (
                <Button
                  key={item.sentence}
                  variant="outline"
                  className="w-full justify-between p-4 h-auto text-left"
                  onClick={() => onStartSentenceReview(item.sentence)}
                >
                  <span className="font-medium">{item.sentence}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    上次练习: {formatDistanceToNow(item.lastPracticed, { addSuffix: true, locale: zhCN })}
                  </span>
                </Button>
              ))}
            </div>
            {dueSentences.length > 3 && (
              <p className="mt-2 text-sm text-muted-foreground">
                还有 {dueSentences.length - 3} 个句子需要复习
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-6">
        <Button variant="outline" onClick={onSkipReview} className="text-base px-6 py-5">
          稍后复习
        </Button>
      </CardFooter>
    </Card>
  )
}
