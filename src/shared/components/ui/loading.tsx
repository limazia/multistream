import { useId } from "react";

import type { LogoTheme, Extension, SVGProps } from "@schemas";
import { cn } from "@utils/cn";

import {
  avantproAmzTheme,
  avantproMglTheme,
  avantproMlTheme,
  avantproShnTheme,
  avantproShpTheme,
  avantproTheme,
  avantproTtkTheme,
} from "@/assets/logos";

export const defaultTheme = avantproTheme;

export const loadingThemes: Record<Extension, LogoTheme> = {
  "avantpro-ml": avantproMlTheme,
  "avantpro-shp": avantproShpTheme,
  "avantpro-amz": avantproAmzTheme,
  "avantpro-shn": avantproShnTheme,
  "avantpro-mgl": avantproMglTheme,
  "avantpro-ttk": avantproTtkTheme,
};

interface SplashScreenProps {
  extension?: Extension;
}

export function LoadingBase({
  className,
  theme = defaultTheme,
  ...props
}: SVGProps & { theme?: LogoTheme }) {
  const id = useId();
  const paint0Id = `${id}-paint0`;
  const paint1Id = `${id}-paint1`;
  const clipPathId = `${id}-clip0`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 133 140"
      fill="none"
      className={cn("size-32", className)}
      {...props}
    >
      <g clipPath={`url(#${clipPathId})`}>
        <path
          className="animate-stroke-draw [stroke-dasharray:1560]"
          d="M103.43 131.97C95.9821 127.681 86.6588 122.312 66.7678 122.312C47.6169 122.312 38.6168 127.289 31.0248 131.487C25.4871 134.549 20.6986 137.197 13.2663 137.197C0.740269 137.197 -0.321361 124.408 5.11231 112.823L13.7382 93.9172L13.7629 93.8629L48.2091 18.3666C53.5315 5.48695 71.4825 -10.9077 85.1683 18.3666C99.695 49.4395 119.581 93.9442 127.163 112.823C132.382 125.816 133.008 137.197 118.358 137.197C112.61 137.197 108.529 134.905 103.691 132.12C103.604 132.07 103.517 132.02 103.43 131.97ZM103.43 131.97C103.347 131.922 103.264 131.874 103.181 131.826M70.1134 46.1664C67.8284 41.3163 64.4814 42.3668 62.6013 46.1664L54.0028 65.1749C53.1051 67.3046 53.9061 70.8936 57.3734 70.4037C59.3145 70.1294 60.2864 68.8321 61.2749 67.5127C62.432 65.9681 63.6119 64.3933 66.3956 64.3933C68.9811 64.3933 69.8665 65.7437 70.8294 67.2124C71.6266 68.4281 72.4768 69.7249 74.3884 70.4037C78.5644 71.8866 79.4513 67.4672 78.5644 65.1749C77.0385 61.3757 72.548 51.3341 70.1134 46.1664Z"
          stroke={`url(#${paint0Id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="animate-stroke-draw [stroke-dasharray:1560]"
          d="M103.43 131.97C95.9821 127.681 86.6588 122.312 66.7678 122.312C47.6169 122.312 38.6168 127.289 31.0248 131.487C25.4871 134.55 20.6986 137.197 13.2663 137.197C0.740269 137.197 -0.321361 124.409 5.11231 112.823L13.7498 93.892C36.652 82.0715 78.0701 117.367 103.43 131.97Z"
          stroke={`url(#${paint1Id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <linearGradient
          id={paint0Id}
          x1="66"
          y1="2"
          x2="66"
          y2="137"
          gradientUnits="userSpaceOnUse"
        >
          {theme.primaryGradientStops.map((stop) => (
            <stop
              key={`${stop.offset ?? "base"}-${stop.color}`}
              offset={stop.offset}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
        <linearGradient
          id={paint1Id}
          x1="6.5"
          y1="106.501"
          x2="95.5"
          y2="127.501"
          gradientUnits="userSpaceOnUse"
        >
          {theme.secondaryGradientStops.map((stop) => (
            <stop
              key={`${stop.offset ?? "base"}-${stop.color}`}
              offset={stop.offset}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
        <clipPath id={clipPathId}>
          <rect width="133" height="140" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function Loading(props: SVGProps) {
  return <LoadingBase {...props} />;
}

export function SplashScreen({ extension }: SplashScreenProps) {
  const theme = extension ? loadingThemes[extension] : defaultTheme;

  return (
    <div className="absolute top-0 right-0 z-9999 flex h-screen w-screen items-center justify-center bg-background">
      <LoadingBase theme={theme} />
    </div>
  );
}
