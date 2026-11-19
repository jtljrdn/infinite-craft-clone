import { SparkleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CraftElement } from "@/lib/elements";
import { DiscoveryBurst } from "./discovery-burst";

type ElementChipProps = React.ComponentProps<"div"> & {
  element: CraftElement;
  state?: "idle" | "dragging" | "target" | "combining";
  size?: "sm" | "default";
  celebrate?: boolean;
  showFirstMark?: boolean;
};

export function ElementChip({
  element,
  state = "idle",
  size = "default",
  celebrate = false,
  showFirstMark = false,
  className,
  ...props
}: ElementChipProps) {
  const firstMark = showFirstMark && element.firstDiscovery;

  return (
    <div
      data-state={state}
      className={cn(
        "inline-flex max-w-full touch-none items-center gap-1.5 rounded-lg border bg-card font-medium text-card-foreground shadow-xs transition-[box-shadow,scale,border-color,background-color] duration-150 ease-out select-none",
        "cursor-grab hover:border-foreground/20 hover:shadow-sm active:cursor-grabbing",
        "data-[state=dragging]:scale-105 data-[state=dragging]:cursor-grabbing data-[state=dragging]:shadow-lg",
        "data-[state=target]:scale-105 data-[state=target]:border-primary data-[state=target]:ring-3 data-[state=target]:ring-primary/15",
        "data-[state=combining]:animate-pulse data-[state=combining]:border-primary/40",
        size === "sm" ? "h-8 px-2.5 text-sm" : "h-10 px-3 text-[0.95rem]",
        celebrate &&
          "relative animate-discovery motion-reduce:animate-discovery-fade",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="shrink-0 leading-none">
        {element.emoji}
      </span>
      <span className="truncate">{element.name}</span>
      {firstMark && (
        <>
          <SparkleIcon
            aria-hidden
            className="-mr-0.5 size-3 shrink-0 fill-discovery-border text-discovery-border"
          />
          <span className="sr-only">(you discovered this first)</span>
        </>
      )}
      {celebrate && <DiscoveryBurst />}
    </div>
  );
}
