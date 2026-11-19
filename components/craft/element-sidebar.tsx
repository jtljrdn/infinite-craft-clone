"use client";

import { useDeferredValue, useState } from "react";
import { SearchIcon, SearchXIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CraftElement } from "@/lib/elements";
import { ElementChip } from "./element-chip";
import { AboutDialog } from "./about-dialog";
import { ResetDialog } from "./reset-dialog";

type ElementSidebarProps = {
  elements: readonly CraftElement[];
  justAdded: string | null;
  isRemoveTarget: boolean;
  onChipPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    element: CraftElement,
  ) => void;
  onChipPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onChipPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onReset: () => void;
};

const revealInList = (node: HTMLLIElement | null) => {
  node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
};

export function ElementSidebar({
  elements,
  justAdded,
  isRemoveTarget,
  onChipPointerDown,
  onChipPointerMove,
  onChipPointerUp,
  onReset,
}: ElementSidebarProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visible = deferredQuery
    ? elements.filter((e) => e.name.toLowerCase().includes(deferredQuery))
    : elements;

  return (
    <aside
      className="relative flex h-2/5 min-h-0 w-full shrink-0 flex-col border-t bg-sidebar text-sidebar-foreground md:h-full md:w-1/5 md:min-w-72 md:max-w-sm md:border-t-0 md:border-l"
    >
      <div className="flex flex-col gap-3 p-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-semibold">Elements</h2>
          <Badge variant="secondary" className="tabular-nums">
            {elements.length}
          </Badge>
        </div>
        <InputGroup>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${elements.length} elements`}
            aria-label="Search elements"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1">
        {visible.length > 0 ? (
          <ul className="flex flex-wrap content-start gap-1.5 p-4">
            {visible.map((element) => (
              <li
                key={element.name}
                ref={element.name === justAdded ? revealInList : undefined}
                className="max-w-full"
              >
                <ElementChip
                  element={element}
                  size="sm"
                  showFirstMark
                  className={cn(
                    element.name === justAdded &&
                      "animate-list-pop motion-reduce:animate-none",
                  )}
                  onPointerDown={(event) => onChipPointerDown(event, element)}
                  onPointerMove={onChipPointerMove}
                  onPointerUp={onChipPointerUp}
                  onPointerCancel={onChipPointerUp}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>No matches</EmptyTitle>
              <EmptyDescription>
                Nothing called &ldquo;{query.trim()}&rdquo; yet. Try mixing
                something new.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ScrollArea>
      <Separator />
      <div className="flex items-center justify-between gap-2 p-2">
        <AboutDialog />
        <ResetDialog onConfirm={onReset} />
      </div>
      <div
        aria-hidden={!isRemoveTarget}
        className={cn(
          "pointer-events-none absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 text-sm font-medium text-destructive opacity-0 backdrop-blur-[2px] transition-opacity duration-150",
          isRemoveTarget && "opacity-100",
        )}
      >
        <Trash2Icon className="size-5" />
        Drop to remove
      </div>
    </aside>
  );
}
