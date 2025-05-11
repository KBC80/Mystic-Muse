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
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { findHanjaForSyllable, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";
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
    newSelections[currentSyllableIndex] = null; // Mark as "keep Korean"
    setSelectedHanjaPerSyllable(newSelections);
    // Automatically move to next or complete if it's the last syllable
    handleNextSyllable(); 
  };

  const handleNextSyllable = () => {
    if (currentSyllableIndex < nameSyllables.length - 1) {
      setCurrentSyllableIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePreviousSyllable = () => {
    if (currentSyllableIndex > 0) {
      setCurrentSyllableIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(selectedHanjaPerSyllable);
    onClose();
  };


  if (!isOpen || nameSyllables.length === 0) {
    return null;
  }

  const currentSyllable = nameSyllables[currentSyllableIndex];
  const isLastSyllable = currentSyllableIndex === nameSyllables.length - 1;

  const getTargetFieldNameDisplay = () => {
    if (!targetFieldName) return "";
    if (targetFieldName === 'name') return "이름";
    if (targetFieldName === 'fatherName') return "아버지 성함";
    if (targetFieldName === 'motherName') return "어머니 성함";
    if (targetFieldName === 'person1.name') return "첫 번째 분 성함";
    if (targetFieldName === 'person2.name') return "두 번째 분 성함";
    return "이름";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>한자 변환: {getTargetFieldNameDisplay()} </DialogTitle>
          <DialogDescription>
            "{currentSyllable}" ({currentSyllableIndex + 1}/{nameSyllables.length}) 글자에 대한 한자를 선택하거나 한글로 유지하세요.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow max-h-[calc(90vh-200px)] pr-1"> {/* Apply max-h here */}
          <div className="py-2">
            {isLoadingOptions ? (
              <p className="text-center py-4 text-muted-foreground">옵션 로딩 중...</p>
            ) : hanjaOptions.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {hanjaOptions.map((opt, optIndex) => (
                  <Button
                    key={`${opt.hanja}-${optIndex}`}
                    variant={selectedHanjaPerSyllable[currentSyllableIndex]?.hanja === opt.hanja ? "default" : "outline"}
                    onClick={() => handleHanjaSelect(opt)}
                    className="flex flex-col h-auto p-2 text-center text-xs"
                  >
                    <span className="text-2xl font-semibold">{opt.hanja}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">{opt.reading.split(',')[0].trim()}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">"{currentSyllable}"에 대한 추천 한자가 없습니다.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
          <Button 
            variant={selectedHanjaPerSyllable[currentSyllableIndex] === null && currentSyllableIndex < selectedHanjaPerSyllable.length && selectedHanjaPerSyllable[currentSyllableIndex] !== undefined ? "secondary" : "outline"} 
            onClick={handleKeepKorean}
            className="w-full"
          >
            "{currentSyllable}" 한글로 유지
          </Button>
          <div className="flex gap-2 w-full">
            {currentSyllableIndex > 0 && (
              <Button variant="outline" onClick={handlePreviousSyllable} className="flex-1">
                이전
              </Button>
            )}
             <Button onClick={isLastSyllable ? handleComplete : handleNextSyllable} className="flex-1">
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

