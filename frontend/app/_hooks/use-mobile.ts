import { useState, useEffect } from "react";

export function useIsMobile(maxWidth: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= maxWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return (): void => {
      window.removeEventListener("resize", handleResize);
    };
  }, [maxWidth]);

  return isMobile;
}
