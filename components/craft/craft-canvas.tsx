import { BrushCleaningIcon, MousePointerClickIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { CraftElement } from "@/lib/elements";
import { ElementChip } from "./element-chip";

export type CanvasItem = {
  id: string;
  element: CraftElement;
  x: number;
  y: number;
  z: number;
  combining: boolean;
  celebrate?: boolean;
};

type CraftCanvasProps = {
  ref: React.Ref<HTMLDivElement>;
  items: readonly CanvasItem[];
  draggingId: string | null;
  targetId: string | null;
  onItemPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    item: CanvasItem,
  ) => void;
  onItemPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onItemPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onItemDoubleClick: (item: CanvasItem) => void;
  onItemCelebrationEnd: (id: string) => void;
  onClear: () => void;
};

export function CraftCanvas({
  ref,
  items,
  draggingId,
  targetId,
  onItemPointerDown,
  onItemPointerMove,
  onItemPointerUp,
  onItemDoubleClick,
  onItemCelebrationEnd,
  onClear,
}: CraftCanvasProps) {
  return (
    <main
      ref={ref}
      className="relative z-10 min-h-0 flex-1 bg-background bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[20px_20px]"
    >
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-4">
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          Infinite Crafter
        </h1>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="pointer-events-auto"
            onClick={onClear}
          >
            <BrushCleaningIcon data-icon="inline-start" />
            Clear canvas
          </Button>
        )}
      </header>

      {items.length === 0 && (
        <Empty className="pointer-events-none absolute inset-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MousePointerClickIcon />
            </EmptyMedia>
            <EmptyTitle>Drag elements here</EmptyTitle>
            <EmptyDescription>
              Drop one element on top of another to combine them. Click an
              element in the list to add it. Double-click one here to copy it.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {items.map((item) => (
        <ElementChip
          key={item.id}
          data-item-id={item.id}
          element={item.element}
          celebrate={item.celebrate}
          state={
            item.combining
              ? "combining"
              : item.id === draggingId
                ? "dragging"
                : item.id === targetId
                  ? "target"
                  : "idle"
          }
          className={cn(
            "absolute top-0 left-0 data-[state=combining]:pointer-events-none",
            !item.celebrate && "animate-in duration-200 zoom-in-75 fade-in",
          )}
          style={{ translate: `${item.x}px ${item.y}px`, zIndex: item.z }}
          onPointerDown={(event) => onItemPointerDown(event, item)}
          onPointerMove={onItemPointerMove}
          onPointerUp={onItemPointerUp}
          onPointerCancel={onItemPointerUp}
          onDoubleClick={() => onItemDoubleClick(item)}
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.animationName === "discovery-fade"
            ) {
              onItemCelebrationEnd(item.id);
            }
          }}
        />
      ))}
    </main>
  );
}
