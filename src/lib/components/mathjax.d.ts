declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typeset?: (elements?: HTMLElement[]) => void;
      startup?: {
        promise?: Promise<void>;
        typeset?: boolean;
      };
      tex?: {
        inlineMath?: [string, string][];
        displayMath?: [string, string][];
      };
      options?: {
        skipHtmlTags?: string[];
      };
    };
  }
}

export {};