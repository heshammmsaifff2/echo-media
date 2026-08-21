import Image from "next/image";
import { cn } from "@/lib/utils";

/** Intrinsic size of the trimmed lockup (public/logo/trimmed). */
const LOGO_W = 1643;
const LOGO_H = 321;

export type LogoVariant =
  | "white"
  | "light-blue"
  | "light-gray"
  | "dark-blue"
  | "dark-gray"
  | "black";

/**
 * The "echo | Media Production" lockup.
 *
 * Source art is a 2362px square with the mark occupying only the middle band;
 * these assets are pre-trimmed to the ink so `height` means what it says and
 * the file is a fraction of the size.
 */
export function Logo({
  variant = "white",
  height = 32,
  priority = false,
  className,
}: {
  variant?: LogoVariant;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/logo/trimmed/${variant}.webp`}
      alt="Echo Media Production"
      width={LOGO_W}
      height={LOGO_H}
      priority={priority}
      sizes={`${Math.round((height * LOGO_W) / LOGO_H)}px`}
      className={cn("w-auto", className)}
      style={{ height }}
    />
  );
}

/**
 * Full-bleed logo moment for the homepage — the lockup scaled to the container
 * rather than to a pixel height.
 */
export function LogoBlock({
  variant = "white",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  return (
    <Image
      src={`/logo/trimmed/${variant}.webp`}
      alt="Echo Media Production"
      width={LOGO_W}
      height={LOGO_H}
      sizes="(max-width: 768px) 90vw, 70vw"
      className={cn("h-auto w-full", className)}
    />
  );
}
