"use client";

import { useState, useEffect } from 'react';
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
import { LayoutGrid, WandSparkles, Shuffle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  question: z.string().min(5, "Please enter a clear question (at least 5 characters)."),
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
      aria-label={card.isFaceUp ? card.name : "Tarot card back"}
    >
      <div className="aspect-[2/3] relative">
        {card.isFaceUp ? (
          <Image src={card.imageUrl} alt={card.name} layout="fill" objectFit="cover" data-ai-hint={card.dataAiHint} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center" data-ai-hint="tarot card back">
            <WandSparkles className="w-1/2 h-1/2 text-indigo-300 opacity-70" />
          </div>
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
    // Simple shuffle animation: just reorder and reset face up state
    setDeck(prevDeck => 
      [...prevDeck]
        .map(card => ({ ...card, isFaceUp: false })) // Ensure all cards are face down
        .sort(() => Math.random() - 0.5)
    );
    setSelectedCards([]);
    setResult(null); // Clear previous results
    setTimeout(() => setIsShuffling(false), 500); // Animation duration
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
    // Shuffle deck when question is submitted for the first time or if no cards are selected yet
    if (selectedCards.length === 0) {
      shuffleDeck();
    }
  }

  async function getInterpretation() {
    if (selectedCards.length !== 3 || !form.getValues("question")) {
      setError("Please ask a question and select 3 cards.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Reveal selected cards
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
      console.error("Tarot reading error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during tarot reading.");
    } finally {
      setIsLoading(false);
    }
  }

  const revealedSelectedCards = selectedCards.map(sc => deck.find(dc => dc.id === sc.id && dc.isFaceUp) || sc);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <LayoutGrid className="text-primary h-6 w-6" /> Tarot Card Reading
          </CardTitle>
          <CardDescription>
            Ask a question, shuffle the cards, select three, and receive your guidance.
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
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., What should I focus on this month?"
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
                  Submit Question & Prepare Deck
                </Button>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>

      {questionSubmitted && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Select Your Cards</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>
                {selectedCards.length < 3 ? `Choose ${3 - selectedCards.length} more card(s).` : "All cards selected. Ready for interpretation."}
              </CardDescription>
              <Button onClick={shuffleDeck} variant="outline" size="sm" disabled={isShuffling || isLoading || selectedCards.length === 3}>
                <Shuffle className={cn("mr-2 h-4 w-4", isShuffling && "animate-spin")} /> Shuffle Deck
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isShuffling ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner size={32} />
                <p className="ml-2 text-muted-foreground">Shuffling cards...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
                {deck.slice(0, 21).map((card) => ( // Display a portion of the deck for selection
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
                {isLoading ? <LoadingSpinner size={20} /> : "Get My Reading"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">Interpreting the cards for you...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Reading Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <WandSparkles className="h-6 w-6 text-primary" /> Your Tarot Reading
            </CardTitle>
            <CardDescription>For your question: "{form.getValues("question")}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {revealedSelectedCards.map((card, index) => (
                <Card key={card.id} className="flex flex-col items-center p-2">
                   <div className="w-32 h-auto mb-2"> {/* Fixed size container for card image */}
                     <TarotCardDisplay card={{...card, isFaceUp: true}} onClick={() => {}} />
                   </div>
                   <p className="font-semibold text-center">{card.name}</p>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground">Card 1: {revealedSelectedCards[0]?.name}</h3>
                <p className="text-muted-foreground">{result.card1Interpretation}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground">Card 2: {revealedSelectedCards[1]?.name}</h3>
                <p className="text-muted-foreground">{result.card2Interpretation}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-foreground">Card 3: {revealedSelectedCards[2]?.name}</h3>
                <p className="text-muted-foreground">{result.card3Interpretation}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-xl font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500"/> Overall Advice</h3>
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
            }} variant="outline">Start New Reading</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
