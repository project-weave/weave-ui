import { setDeepEquals } from "@/lib/list-utils";
import { MutableRefObject, useEffect, useRef, useState } from "react";

export function useElementsOnScreen<T>(
  elements: T[]
): [MutableRefObject<HTMLDivElement | null>, MutableRefObject<(HTMLDivElement | null)[]>, Set<string>] {
  const [visibleElementIds, setVisibleElementIds] = useState<Set<string>>(new Set());

  const elementContainerRef = useRef<HTMLDivElement | null>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>(new Array(elements.length).fill(null));

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      setVisibleElementIds((prevVisibleElementIds) => {
        const newVisibleElementIds = new Set(prevVisibleElementIds);

        entries.forEach((entry) => {
          const observableId = entry.target.getAttribute("observable-el-id");
          if (observableId !== null) {
            if (entry.isIntersecting) {
              newVisibleElementIds.add(observableId);
            } else {
              newVisibleElementIds.delete(observableId);
            }
          }
        });

        if (setDeepEquals(prevVisibleElementIds, newVisibleElementIds)) return prevVisibleElementIds;
        return newVisibleElementIds;
      });
    };
    const observerOptions = {
      root: elementContainerRef.current,
      threshold: 0.8
    } as IntersectionObserverInit;

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const refs = elementRefs.current;

    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [elementRefs, elements, elementContainerRef]);

  return [elementContainerRef, elementRefs, visibleElementIds];
}
