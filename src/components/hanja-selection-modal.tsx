
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { findHanjaForSyllable, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface HanjaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nameSyllables: string[];
  originalName: string;
  onComplete: (selections: (HanjaDetail | null)[]) => void;
  targetFieldName: string | null; 
}

export function HanjaSelectionModal({
  isOpen,
  onClose,
  nameSyllables,
  originalName,
  onComplete,
  targetFieldName,
}: HanjaSelectionModalProps) {
  const { toast } = useToast();
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [selectedHanjaPerSyllable, setSelectedHanjaPerSyllable] = useState<(HanjaDetail | null)[]>([]);
  const [hanjaOptions, setHanjaOptions] = useState<HanjaDetail[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedHanjaPerSyllable(new Array(nameSyllables.length).fill(null));
      setCurrentSyllableIndex(0);
    }
  }, [isOpen, nameSyllables]);

  useEffect(() => {
    if (isOpen && nameSyllables.length > 0 && currentSyllableIndex < nameSyllables.length) {
      setIsLoadingOptions(true);
      const options = findHanjaForSyllable(nameSyllables[currentSyllableIndex]);
      setHanjaOptions(options);
      setIsLoadingOptions(false);
    }
  }, [isOpen, nameSyllables, currentSyllableIndex]);

  const handleHanjaSelect = (hanjaDetail: HanjaDetail) => {
    const newSelections = [...selectedHanjaPerSyllable];
    newSelections[currentSyllableIndex] = hanjaDetail;
    setSelectedHanjaPerSyllable(newSelections);
  };

  const handleKeepKorean = () => {
    const newSelections = [...selectedHanjaPerSyllable];
    newSelections[currentSyllableIndex] = null;
    setSelectedHanjaPerSyllable(newSelections);
  };

  const handleNextSyllable = () => {
    if (currentSyllableIndex < nameSyllables.length - 1) {
      setCurrentSyllableIndex(prev => prev + 1);
    } else {
      // This is effectively the "Complete" action
      // Validate if all syllables have a selection (either Hanja or explicit Korean)
      // For now, we assume that if a syllable wasn't explicitly set to "Keep Korean", it's an error if no Hanja chosen.
      // The parent component will handle the logic of whether partial conversion is allowed.
      onComplete(selectedHanjaPerSyllable);
      onClose();
    }
  };
  
  const handlePreviousSyllable = () => {
    if (currentSyllableIndex > 0) {
      setCurrentSyllableIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
     // Check if all syllables have either a Hanja or have been explicitly marked to keep as Korean.
     // If a slot in selectedHanjaPerSyllable is still the initial `null` and it wasn't an explicit "keep Korean" choice,
     // it means the user didn't interact with that syllable.
     // For simplicity, we'll rely on the user interacting with each step or the parent validating.
    onComplete(selectedHanjaPerSyllable);
    onClose();
  };


  if (!isOpen || nameSyllables.length === 0) {
    return null;
  }

  const currentSyllable = nameSyllables[currentSyllableIndex];
  const isLastSyllable = currentSyllableIndex === nameSyllables.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>한자 변환: {targetFieldName === 'name' ? "이름" : targetFieldName?.includes("father") ? "아버지 성함" : "어머니 성함"} </DialogTitle>
          <DialogDescription>
            "{currentSyllable}" ({currentSyllableIndex + 1}/{nameSyllables.length}) 글자에 대한 한자를 선택하거나 한글로 유지하세요.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-6">
          {isLoadingOptions ? (
            <p className="text-center py-4">옵션 로딩 중...</p>
          ) : hanjaOptions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 py-2">
              {hanjaOptions.map((opt, optIndex) => (
                <Button
                  key={`${opt.hanja}-${optIndex}`}
                  variant={selectedHanjaPerSyllable[currentSyllableIndex]?.hanja === opt.hanja ? "default" : "outline"}
                  onClick={() => handleHanjaSelect(opt)}
                  className="flex flex-col h-auto p-2 text-center"
                >
                  <span className="text-2xl font-semibold">{opt.hanja}</span>
                  <span className="text-xs text-muted-foreground">{opt.reading}</span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">"{currentSyllable}"에 대한 추천 한자가 없습니다.</p>
          )}
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-between">
          <Button 
            variant={selectedHanjaPerSyllable[currentSyllableIndex] === null ? "secondary" : "outline"} 
            onClick={handleKeepKorean}
            className="w-full sm:w-auto"
          >
            한글 그대로
          </Button>
          <div className="flex gap-2 col-span-2 sm:col-auto">
            {currentSyllableIndex > 0 && (
              <Button variant="outline" onClick={handlePreviousSyllable} className="w-full sm:w-auto">
                이전
              </Button>
            )}
             <Button onClick={isLastSyllable ? handleComplete : handleNextSyllable} className="w-full sm:w-auto">
              {isLastSyllable ? "선택 완료" : "다음 글자"}
            </Button>
          </div>
        </DialogFooter>
         <DialogClose asChild>
            <button className="sr-only">닫기</button>
         </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
