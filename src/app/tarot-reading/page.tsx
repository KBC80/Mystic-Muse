
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { tarotCardReading, type TarotCardReadingOutput, type TarotCardReadingInput } from '@/ai/flows/tarot-card-reading';
import { generateDeck, type TarotCard } from '@/lib/tarot-cards';
import Image from 'next/image';
import { LayoutGrid, WandSparkles, Shuffle, CheckCircle2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  question: z.string().min(5, "명확한 질문을 5자 이상 입력해주세요."),
});

type TarotReadingFormValues = z.infer<typeof formSchema>;

const TarotCardDisplay = ({ card, onClick, isSelected, isDisabled }: { card: TarotCard; onClick: () => void; isSelected?: boolean; isDisabled?: boolean }) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || card.isFaceUp}
      className={cn(
        "rounded-lg overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent",
        isSelected && "ring-4 ring-primary scale-105",
        (isDisabled && !isSelected) && "opacity-50 cursor-not-allowed",
        card.isFaceUp && "scale-100"
      )}
      aria-label={card.isFaceUp ? card.name : "타로 카드 뒷면"}
    >
      <div className="aspect-[2/3] relative">
        {card.isFaceUp ? (
          <Image src={card.imageUrl} alt={card.name} fill style={{ objectFit: 'cover' }} data-ai-hint={card.dataAiHint} />
        ) : (
          <Image src="/image/tarot-back.jpg" alt="타로 카드 뒷면" fill style={{ objectFit: 'cover' }} data-ai-hint="tarot card back" />
        )}
      </div>
      {card.isFaceUp && <p className="p-1 text-xs bg-black/70 text-white absolute bottom-0 w-full text-center truncate">{card.name}</p>}
    </button>
  );
};


export default function TarotReadingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TarotCardReadingOutput | null>(null);
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  
  useEffect(() => {
    setDeck(generateDeck());
  }, []);

  const form = useForm<TarotReadingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const shuffleDeck = () => {
    setIsShuffling(true);
    // 간단한 셔플 애니메이션: 순서 변경 및 앞면 상태 재설정
    setDeck(prevDeck => 
      [...prevDeck]
        .map(card => ({ ...card, isFaceUp: false })) // 모든 카드를 뒷면으로 설정
        .sort(() => Math.random() - 0.5)
    );
    setSelectedCards([]);
    setResult(null); // 이전 결과 지우기
    setTimeout(() => setIsShuffling(false), 500); // 애니메이션 지속 시간
  };

  const handleCardSelect = (card: TarotCard) => {
    if (selectedCards.length < 3 && !selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(prev => [...prev, card]);
    }
  };

  async function onQuestionSubmit(values: TarotReadingFormValues) {
    setQuestionSubmitted(true);
    setError(null);
    setResult(null);
    // 질문이 처음 제출되거나 아직 카드를 선택하지 않은 경우 덱 셔플
    if (selectedCards.length === 0) {
      shuffleDeck();
    }
  }

  async function getInterpretation() {
    if (selectedCards.length !== 3 || !form.getValues("question")) {
      setError("질문을 입력하고 카드 3장을 선택해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    // 선택한 카드 공개
    setDeck(prevDeck => prevDeck.map(dCard => {
      const selectedCard = selectedCards.find(sCard => sCard.id === dCard.id);
      return selectedCard ? { ...dCard, isFaceUp: true } : dCard;
    }));
    
    const input: TarotCardReadingInput = {
      question: form.getValues("question"),
      card1: selectedCards[0].name,
      card2: selectedCards[1].name,
      card3: selectedCards[2].name,
    };

    try {
      const interpretationResult = await tarotCardReading(input);
      setResult(interpretationResult);
    } catch (err) {
      console.error("타로 리딩 오류:", err);
      setError(err instanceof Error ? err.message : "타로 리딩 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const revealedSelectedCards = selectedCards.map(sc => deck.find(dc => dc.id === sc.id && dc.isFaceUp) || sc);

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <LayoutGrid className="text-primary h-6 w-6" /> 타로 카드 리딩
          </CardTitle>
          <CardDescription>
            질문을 하고, 카드를 섞고, 세 장을 선택하여 당신의 지침을 받으세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onQuestionSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>당신의 질문</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예) 이번 달에 무엇에 집중해야 할까요?"
                        {...field}
                        disabled={questionSubmitted && selectedCards.length > 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!questionSubmitted || selectedCards.length === 0 ? (
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90">
                  질문 제출 및 덱 준비
                </Button>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>

      {questionSubmitted && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">카드 선택</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>
                {selectedCards.length < 3 ? `${3 - selectedCards.length}장 더 선택해주세요.` : "모든 카드를 선택했습니다. 해석 준비 완료."}
              </CardDescription>
              <Button onClick={shuffleDeck} variant="outline" size="sm" disabled={isShuffling || isLoading || selectedCards.length === 3}>
                <Shuffle className={cn("mr-2 h-4 w-4", isShuffling && "animate-spin")} /> 덱 섞기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isShuffling ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner size={32} />
                <p className="ml-2 text-muted-foreground">카드를 섞고 있습니다...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
                {deck.slice(0, 76).map((card) => ( // 선택을 위해 덱의 일부 표시
                  <TarotCardDisplay
                    key={card.id}
                    card={card}
                    onClick={() => handleCardSelect(card)}
                    isSelected={selectedCards.some(sc => sc.id === card.id)}
                    isDisabled={selectedCards.length >= 3 && !selectedCards.some(sc => sc.id === card.id)}
                  />
                ))}
              </div>
            )}
            {selectedCards.length === 3 && !result && (
              <Button onClick={getInterpretation} disabled={isLoading} className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "내 리딩 받기"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">당신을 위해 카드를 해석하고 있습니다...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>리딩 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <WandSparkles className="h-6 w-6 text-primary" /> 당신의 타로 리딩
            </CardTitle>
            <CardDescription>질문: "{form.getValues("question")}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {revealedSelectedCards.map((card, index) => (
                <Card key={card.id} className="flex flex-col items-center p-2">
                   <div className="w-32 h-auto mb-2"> {/* 카드 이미지 고정 크기 컨테이너 */}
                     <TarotCardDisplay card={{...card, isFaceUp: true}} onClick={() => {}} />
                   </div>
                   <p className="font-semibold text-center">{card.name}</p>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground">카드 1: {revealedSelectedCards[0]?.name}</h3>
                <p className="text-muted-foreground">{result.card1Interpretation}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground">카드 2: {revealedSelectedCards[1]?.name}</h3>
                <p className="text-muted-foreground">{result.card2Interpretation}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground">카드 3: {revealedSelectedCards[2]?.name}</h3>
                <p className="text-muted-foreground">{result.card3Interpretation}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-xl font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500"/> 전반적인 조언</h3>
              <p className="text-muted-foreground mt-2">{result.overallAdvice}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => {
              setQuestionSubmitted(false);
              setSelectedCards([]);
              setResult(null);
              setError(null);
              form.reset();
              shuffleDeck();
            }} variant="outline">새 리딩 시작</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

