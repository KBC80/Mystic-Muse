'use client';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface KakaoShareButtonProps {
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

export default function KakaoShareButton({
  shareTitle,
  shareDescription,
  shareUrl,
  buttonText = "카톡 공유",
  imageUrl = "https://picsum.photos/1200/630?random=mysticmuse" 
}: KakaoShareButtonProps) {
  const [kakaoInitialized, setKakaoInitialized] = useState(false);
  const { toast } = useToast();
  const pageUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
      setKakaoInitialized(true);
    } else if (window.Kakao && process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY && !window.Kakao.isInitialized()) {
        // Kakao SDK is loaded but not initialized
        try {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
            if(window.Kakao.isInitialized()){
                setKakaoInitialized(true);
            } else {
                 // console.warn("Kakao.init called but isInitialized is still false.");
            }
        } catch (e) {
            console.error("Error initializing Kakao SDK in button:", e);
        }
    } else {
        // Kakao SDK not loaded yet, KakaoScriptLoader should handle it.
        // console.log("Kakao SDK not ready yet in button component.");
    }
  }, []);

  const handleShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized || !window.Kakao.isInitialized()) {
        // Try to initialize again if not already done
        if (window.Kakao && process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY && (!window.Kakao.isInitialized || !window.Kakao.isInitialized())) {
             try {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
                if(window.Kakao.isInitialized && window.Kakao.isInitialized()){
                    setKakaoInitialized(true);
                }
            } catch (e) {
                console.error("Error re-initializing Kakao SDK:", e);
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

  return (
    <Button onClick={handleShare} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto bg-[#FEE500] hover:bg-[#FEE500]/90 text-black">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="mr-2"><path fill="currentColor" d="M12 2C6.477 2 2 5.817 2 10.2C2 12.892 3.445 15.291 5.796 16.83L4.29 20.711a.5.5 0 0 0 .688.641L9.02 19.37c.965.252 1.98.39 3.027.39c5.523 0 10-3.817 10-8.2c0-4.383-4.477-8.2-10-8.2m0 13.8c-.911 0-1.79-.12-2.607-.348l-.214-.057l-2.039 1.359l.992-2.587l.197-.514a7.856 7.856 0 0 1-1.929-3.453C6.4 10.074 9.916 8.2 12 8.2s3.6 1.874 3.6 4.2c0 2.326-3.916 4.2-6 4.2"/></svg>
      {buttonText}
    </Button>
  );
}
