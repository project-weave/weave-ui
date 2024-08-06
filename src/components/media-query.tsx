import { useHydration } from "@/hooks/useHydration";
import { breakPoints, ScreenSize } from "@/hooks/useScreenSize";
import { ReactNode, Suspense } from "react";
import { useMediaQuery } from "react-responsive";

type MediaQueryComponentProps = {
  children: ReactNode;
  exclusive?: boolean;
  maxScreenSize?: ScreenSize;
};

export function MediaQueryXXS({ children, exclusive, maxScreenSize }: MediaQueryComponentProps) {
  const hydrated = useHydration();

  const max = maxScreenSize !== undefined ? breakPoints[maxScreenSize] - 1 : breakPoints[ScreenSize.XS] - 1;
  const isScreenXXS = useMediaQuery({
    ...(exclusive || maxScreenSize !== undefined ? { maxWidth: max } : {}),
    minWidth: breakPoints[ScreenSize.XXS]
  });

  return <Suspense key={hydrated ? "client" : "server"}>{isScreenXXS && hydrated ? children : null}</Suspense>;
}

export function MediaQueryXS({ children, exclusive, maxScreenSize }: MediaQueryComponentProps) {
  const hydrated = useHydration();

  const max = maxScreenSize !== undefined ? breakPoints[maxScreenSize] - 1 : breakPoints[ScreenSize.SM] - 1;
  const isScreenXS = useMediaQuery({
    ...(exclusive || maxScreenSize !== undefined ? { maxWidth: max } : {}),
    minWidth: breakPoints[ScreenSize.XS]
  });

  return <Suspense key={hydrated ? "client" : "server"}>{isScreenXS && hydrated ? children : null}</Suspense>;
}

export function MediaQuerySM({ children, exclusive, maxScreenSize }: MediaQueryComponentProps) {
  const hydrated = useHydration();

  const max = maxScreenSize !== undefined ? breakPoints[maxScreenSize] - 1 : breakPoints[ScreenSize.MD] - 1;
  const isScreenSM = useMediaQuery({
    ...(exclusive || maxScreenSize !== undefined ? { maxWidth: max } : {}),
    minWidth: breakPoints[ScreenSize.SM]
  });

  return <Suspense key={hydrated ? "client" : "server"}>{isScreenSM && hydrated ? children : null}</Suspense>;
}

export function MediaQueryMD({ children, exclusive, maxScreenSize }: MediaQueryComponentProps) {
  const hydrated = useHydration();

  const max = maxScreenSize !== undefined ? breakPoints[maxScreenSize] - 1 : breakPoints[ScreenSize.LG] - 1;
  const isScreenMD = useMediaQuery({
    ...(exclusive || maxScreenSize !== undefined ? { maxWidth: max } : {}),
    minWidth: breakPoints[ScreenSize.MD]
  });
  return <Suspense key={hydrated ? "client" : "server"}>{isScreenMD && hydrated ? children : null}</Suspense>;
}

export function MediaQueryLG({ children, exclusive, maxScreenSize }: MediaQueryComponentProps) {
  const hydrated = useHydration();

  const max = maxScreenSize !== undefined ? breakPoints[maxScreenSize] - 1 : breakPoints[ScreenSize.XL] - 1;
  const isScreenLG = useMediaQuery({
    ...(exclusive || maxScreenSize !== undefined ? { maxWidth: max } : {}),
    minWidth: breakPoints[ScreenSize.LG]
  });
  return <Suspense key={hydrated ? "client" : "server"}>{isScreenLG && hydrated ? children : null}</Suspense>;
}

export function MediaQueryXL({ children, exclusive, maxScreenSize }: MediaQueryComponentProps) {
  const hydrated = useHydration();

  const max = maxScreenSize !== undefined ? breakPoints[maxScreenSize] - 1 : breakPoints[ScreenSize.XL] - 1;
  const isScreenXL = useMediaQuery({
    ...(exclusive || maxScreenSize !== undefined ? { maxWidth: max } : {}),
    minWidth: breakPoints[ScreenSize.XL]
  });
  return <Suspense key={hydrated ? "client" : "server"}>{isScreenXL && hydrated ? children : null}</Suspense>;
}

export function MediaQueryXXL({ children }: MediaQueryComponentProps) {
  const hydrated = useHydration();
  const isScreen2XL = useMediaQuery({ minWidth: breakPoints[ScreenSize.XXL] });

  return <Suspense key={hydrated ? "client" : "server"}>{isScreen2XL && hydrated ? children : null}</Suspense>;
}
