'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    Kakao: any;
  }
}

const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js";
const KAKAO_JAVASCRIPT_KEY = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

export default function KakaoScriptLoader() {
  useEffect(() => {
    if (typeof window === 'undefined' || !KAKAO_JAVASCRIPT_KEY) {
      if (!KAKAO_JAVASCRIPT_KEY) {
        console.warn("Kakao JavaScript Key is not set. Kakao Share will not work.");
      }
      return;
    }

    if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
      return; // Already initialized
    }

    // Check if script already exists
    let script = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.integrity = "sha384-7SMQbl1ZXCNpD02RAGWTFVk917J0HllYQNVTTs+HkL36AHSXlAPZSmZ7t6k2v4z6"; // Optional: Add SRI hash for security
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
    
    const onLoad = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        try {
          window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
          if (!window.Kakao.isInitialized()) {
            // console.warn("Kakao.init was called, but Kakao.isInitialized() is still false.");
          }
        } catch (e) {
          console.error("Error initializing Kakao SDK:", e);
        }
      }
    };

    if (script.getAttribute('data-loaded') === 'true') {
      // If script was already there and marked as loaded (e.g. by a previous instance of this component)
      onLoad();
    } else {
      script.addEventListener('load', onLoad);
      script.setAttribute('data-loaded', 'true');
    }

    return () => {
      script.removeEventListener('load', onLoad);
      // Do not remove the script itself, as other components might still need it
    };
  }, []);

  return null; // This component doesn't render anything visible
}
