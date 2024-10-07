import { RefObject, useEffect, useState } from "react";

export default function useElementInView(ref: RefObject<HTMLElement>) {
  const [isElementInView, setIsElementInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([form]) => {
        setIsElementInView(form.isIntersecting);
      },
      {
        root: null,
        threshold: 0.7
      }
    );
    const formElement = ref.current;
    if (formElement) {
      observer.observe(formElement);
    }
    return () => {
      if (formElement) {
        observer.unobserve(formElement);
      }
    };
  }, [ref]);

  return isElementInView;
}
