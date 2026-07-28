import { useEffect, useRef } from "react";
import { type AnimationConfigWithData, type AnimationItem } from "lottie-web";

type LottieAnimationProps = {
  animationData: AnimationConfigWithData["animationData"];
  className?: string;
};

export function LottieAnimation({ animationData, className }: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let animation: AnimationItem | undefined;
    let isMounted = true;

    import("lottie-web").then(({ default: lottie }) => {
      if (!isMounted || !containerRef.current) {
        return;
      }

      animation = lottie.loadAnimation({
        animationData,
        autoplay: true,
        container: containerRef.current,
        loop: true,
        renderer: "svg",
      });
    });

    return () => {
      isMounted = false;
      animation?.destroy();
    };
  }, [animationData]);

  return <div aria-hidden="true" className={className} ref={containerRef} />;
}
