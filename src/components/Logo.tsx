import { cn } from "@/lib/utils";
import logoImage from "@/assets/masar.png";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt="Masar Logo"
      className={cn("h-8 w-auto brightness-0 dark:invert", className)}
      {...props}
    />
  );
}