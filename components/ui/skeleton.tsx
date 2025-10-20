import { cn } from "@/lib/clientUtils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-400 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
