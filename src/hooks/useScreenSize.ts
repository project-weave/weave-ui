import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import defaultTailwindTheme from "tailwindcss/defaultTheme";
import { ScreensConfig } from "tailwindcss/types/config";

import tailwindTheme from "@/utils/tailwindTheme";

export enum ScreenSize {
  XXS,
  XS,
  SM,
  MD,
  LG,
  XL,
  XXL
}
// Assuming tailwindTheme and defaultTailwindTheme are defined elsewhere
const screenSizes = tailwindTheme?.screens || (defaultTailwindTheme.screens as ScreensConfig);

function extractNumPixels(str: string): number {
  const arr = str.split("px");
  if (arr.length === 0 || isNaN(Number(arr[0]))) return 0;
  return Number(arr[0]);
}

export const breakPoints: Record<ScreenSize, number> = {
  [ScreenSize.LG]: extractNumPixels(screenSizes["lg"]),
  [ScreenSize.MD]: extractNumPixels(screenSizes["md"]),
  [ScreenSize.SM]: extractNumPixels(screenSizes["sm"]),
  [ScreenSize.XL]: extractNumPixels(screenSizes["xl"]),
  [ScreenSize.XS]: extractNumPixels(screenSizes["xs"]) || 430,
  [ScreenSize.XXL]: extractNumPixels(screenSizes["2xl"]),
  [ScreenSize.XXS]: 0
};

// Mobile first
export default function useScreenSize() {
  const [screenSize, setScreenSize] = useState<ScreenSize>(ScreenSize.XXS);

  const isScreenXXS = useMediaQuery({ minWidth: breakPoints[ScreenSize.XXS] });
  const isScreenXS = useMediaQuery({ minWidth: breakPoints[ScreenSize.XS] });
  const isScreenSM = useMediaQuery({ minWidth: breakPoints[ScreenSize.SM] });
  const isScreenMD = useMediaQuery({ minWidth: breakPoints[ScreenSize.MD] });
  const isScreenLG = useMediaQuery({ minWidth: breakPoints[ScreenSize.LG] });
  const isScreenXL = useMediaQuery({ minWidth: breakPoints[ScreenSize.XL] });
  const isScreen2XL = useMediaQuery({ minWidth: breakPoints[ScreenSize.XXL] });

  useEffect(() => {
    if (isScreen2XL) return setScreenSize(ScreenSize.XXL);
    if (isScreenXL) return setScreenSize(ScreenSize.XL);
    if (isScreenLG) return setScreenSize(ScreenSize.LG);
    if (isScreenMD) return setScreenSize(ScreenSize.MD);
    if (isScreenSM) return setScreenSize(ScreenSize.SM);
    if (isScreenXS) return setScreenSize(ScreenSize.XS);
    if (isScreenXXS) return setScreenSize(ScreenSize.XXS);
  }, [isScreen2XL, isScreenXL, isScreenLG, isScreenMD, isScreenSM, isScreenXS, isScreenXXS]);

  return screenSize;
}
