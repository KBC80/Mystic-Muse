'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  shareTitle: string;
  shareDescription: string;
  shareUrl?: string;
  buttonText?: string;
  imageUrl?: string;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

// Kakao Icon SVG as a component
const KakaoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="mr-2"><path fill="#3C1E1E" d="M12 2C6.477 2 2 5.817 2 10.2C2 12.892 3.445 15.291 5.796 16.83L4.29 20.711a.5.5 0 0 0 .688.641L9.02 19.37c.965.252 1.98.39 3.027.39c5.523 0 10-3.817 10-8.2c0-4.383-4.477-8.2-10-8.2m0 13.8c-.911 0-1.79-.12-2.607-.348l-.214-.057l-2.039 1.359l.992-2.587l.197-.514a7.856 7.856 0 0 1-1.929-3.453C6.4 10.074 9.916 8.2 12 8.2s3.6 1.874 3.6 4.2c0 2.326-3.916 4.2-6 4.2"/></svg>
);


export default function ShareButton({
  shareTitle,
  shareDescription,
  shareUrl,
  buttonText = "결과 공유하기",
  imageUrl = "https://picsum.photos/1200/630?random=mysticmuse"
}: ShareButtonProps) {
  const [kakaoInitialized, setKakaoInitialized] = useState(false);
  const { toast } = useToast();
  const pageUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (window.Kakao.isInitialized && window.Kakao.isInitialized()) {
        setKakaoInitialized(true);
      } else if (process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY && (!window.Kakao.isInitialized || !window.Kakao.isInitialized())) {
          try {
              window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
              if(window.Kakao.isInitialized && window.Kakao.isInitialized()){
                  setKakaoInitialized(true);
              }
          } catch (e) {
              console.error("Error initializing Kakao SDK in ShareButton:", e);
          }
      }
    }
  }, []);

  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized || !window.Kakao.isInitialized()) {
        if (window.Kakao && process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY && (!window.Kakao.isInitialized || !window.Kakao.isInitialized())) {
             try {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
                if(window.Kakao.isInitialized && window.Kakao.isInitialized()){
                    setKakaoInitialized(true); 
                }
            } catch (e) {
                console.error("Error re-initializing Kakao SDK for share:", e);
            }
        }
        if (!window.Kakao || !window.Kakao.isInitialized || !window.Kakao.isInitialized()) {
             toast({
                title: "카카오 공유 실패",
                description: "카카오 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.",
                variant: "destructive",
            });
            return;
        }
    }

    if (!window.Kakao.Share) {
        toast({
            title: "카카오 공유 기능 오류",
            description: "카카오 공유 기능을 사용할 수 없습니다. SDK를 확인해주세요.",
            variant: "destructive",
        });
        return;
    }

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: shareTitle,
        description: shareDescription,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: pageUrl,
          webUrl: pageUrl,
        },
      },
      buttons: [
        {
          title: '결과 확인하기',
          link: {
            mobileWebUrl: pageUrl,
            webUrl: pageUrl,
          },
        },
      ],
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast({
        title: "링크 복사 완료",
        description: "결과 페이지 링크가 클립보드에 복사되었습니다.",
      });
    } catch (err) {
      toast({
        title: "링크 복사 실패",
        description: "링크를 복사하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error('Failed to copy link: ', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
          <Share2 className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleKakaoShare} className="cursor-pointer">
          <KakaoIcon />
          카카오톡으로 공유
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <LinkIcon className="mr-2 h-4 w-4" />
          링크 복사
        </DropdownMenuItem>
        {/* TODO: Add Web Share API option if available */}
        {/* {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
            <Share2 className="mr-2 h-4 w-4" />
            더보기...
          </DropdownMenuItem>
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
