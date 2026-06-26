import type { SVGProps as SVGReactProps } from "react";

export interface SVGProps extends SVGReactProps<SVGSVGElement> {
  className?: string;
}
