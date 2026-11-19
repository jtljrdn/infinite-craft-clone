"use client";

import { useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  combineElements,
  discoveredStore,
  useDiscoveredElements,
  STARTER_ELEMENTS,
  type CraftElement,
} from "@/lib/elements";
import { CraftCanvas, type CanvasItem } from "./craft-canvas";
import { ElementSidebar } from "./element-sidebar";

type DragState = {
  itemId: string;
  pointerId: number;
  source: "sidebar" | "canvas";
  element: CraftElement;
  width: number;
  height: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
  targetId: string | null;
  overSidebar: boolean;
};

const DRAG_THRESHOLD = 4;
const EDGE_PADDING = 8;

let idCounter = 0;
const nextId = () => `item-${++idCounter}`;

const overlapArea = (a: DOMRect, b: DOMRect) => {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
};

const isInside = (rect: DOMRect, x: number, y: number) =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

export function CraftGame() {
  const discovered = useDiscoveredElements();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const [drag, setDragState] = useState<DragState | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const setDrag = (next: DragState | null) => {
    dragRef.current = next;
    setDragState(next);
  };

  const itemNode = (id: string) =>
    canvasRef.current?.querySelector<HTMLElement>(`[data-item-id="${id}"]`) ??
    null;

  const findTarget = (draggedId: string): string | null => {
    const dragged = itemNode(draggedId)?.getBoundingClientRect();
    if (!dragged) return null;
    let best: { id: string; area: number } | null = null;
    for (const item of items) {
      if (item.id === draggedId || item.combining || item.leaving) continue;
      const rect = itemNode(item.id)?.getBoundingClientRect();
      if (!rect) continue;
      const area = overlapArea(dragged, rect);
      if (area > 0 && (!best || area > best.area)) best = { id: item.id, area };
    }
    return best?.id ?? null;
  };

  const updateItem = (id: string, patch: Partial<CanvasItem>) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  const topZ = () => items.reduce((max, item) => Math.max(max, item.z), 0) + 1;

  const startDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    itemId: string,
    element: CraftElement,
    source: DragState["source"],
  ) => {
    if (event.button !== 0 || dragRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    setDrag({
      itemId,
      pointerId: event.pointerId,
      source,
      element,
      width: rect.width,
      height: rect.height,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false,
      targetId: null,
      overSidebar: false,
    });
  };

  const handleSidebarPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    element: CraftElement,
  ) => {
    startDrag(event, nextId(), element, "sidebar");
  };

  const handleCanvasPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    item: CanvasItem,
  ) => {
    if (item.combining || item.leaving || dragRef.current) return;
    updateItem(item.id, { z: topZ() });
    startDrag(event, item.id, item.element, "canvas");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!drag || !canvas || event.pointerId !== drag.pointerId) return;
    const moved =
      drag.moved ||
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >
        DRAG_THRESHOLD;
    if (!moved) return;

    const x = event.clientX - drag.offsetX - canvas.left;
    const y = event.clientY - drag.offsetY - canvas.top;
    if (drag.source === "sidebar" && !drag.moved) {
      setItems((prev) => [
        ...prev,
        {
          id: drag.itemId,
          element: drag.element,
          x,
          y,
          z: topZ(),
          combining: false,
        },
      ]);
    } else {
      updateItem(drag.itemId, { x, y });
    }
    const overSidebar = !isInside(canvas, event.clientX, event.clientY);
    setDrag({
      ...drag,
      moved,
      overSidebar,
      targetId: overSidebar ? null : findTarget(drag.itemId),
    });
  };

  const removeItems = (...ids: string[]) =>
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)));

  const addNearCenter = ({ itemId, element, width, height }: DragState) => {
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!canvas) return;
    const jitter = () => (Math.random() - 0.5) * 160;
    setItems((prev) => [
      ...prev,
      {
        id: itemId,
        element,
        x: canvas.width / 2 - width / 2 + jitter(),
        y: canvas.height / 2 - height / 2 + jitter(),
        z: topZ(),
        combining: false,
      },
    ]);
  };

  const clampIntoCanvas = (id: string) => {
    const canvas = canvasRef.current?.getBoundingClientRect();
    const rect = itemNode(id)?.getBoundingClientRect();
    if (!canvas || !rect) return;
    const maxX = Math.max(
      EDGE_PADDING,
      canvas.width - rect.width - EDGE_PADDING,
    );
    const maxY = Math.max(
      EDGE_PADDING,
      canvas.height - rect.height - EDGE_PADDING,
    );
    updateItem(id, {
      x: Math.min(Math.max(rect.left - canvas.left, EDGE_PADDING), maxX),
      y: Math.min(Math.max(rect.top - canvas.top, EDGE_PADDING), maxY),
    });
  };

  const combine = async (draggedId: string, targetId: string) => {
    const dragged = items.find((item) => item.id === draggedId);
    const target = items.find((item) => item.id === targetId);
    if (!dragged || !target) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === draggedId
          ? {
              ...item,
              x: target.x + 6,
              y: target.y + 6,
              combining: true,
              celebrate: false,
            }
          : item.id === targetId
            ? { ...item, combining: true, celebrate: false }
            : item,
      ),
    );

    try {
      const result = await combineElements(
        dragged.element.name,
        target.element.name,
      );
      const element = { name: result.name, emoji: result.emoji };
      setItems((prev) => {
        const anchor = prev.find((item) => item.id === targetId);
        if (!anchor || anchor.leaving) return prev;
        const z = prev.reduce((max, item) => Math.max(max, item.z), 0) + 1;
        return [
          ...prev.filter(
            (item) => item.id !== draggedId && item.id !== targetId,
          ),
          {
            id: nextId(),
            element,
            x: anchor.x,
            y: anchor.y,
            z,
            combining: false,
            celebrate: result.new,
          },
        ];
      });
      const added = discoveredStore.add({
        ...element,
        firstDiscovery: result.new || undefined,
      });
      if (added) setJustAdded(element.name);
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === draggedId
            ? { ...item, x: item.x + 28, y: item.y + 28, combining: false }
            : item.id === targetId
              ? { ...item, combining: false }
              : item,
        ),
      );
      toast.add({
        title: "Those didn't mix",
        description: "Something went wrong. Try again in a moment.",
        type: "error",
      });
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    setDrag(null);

    const cancelled = event.type === "pointercancel";
    if (!drag.moved) {
      if (drag.source === "sidebar" && !cancelled) addNearCenter(drag);
      return;
    }
    if (drag.overSidebar) {
      removeItems(drag.itemId);
      return;
    }
    if (cancelled) {
      clampIntoCanvas(drag.itemId);
      return;
    }
    if (drag.targetId) {
      void combine(drag.itemId, drag.targetId);
      return;
    }
    clampIntoCanvas(drag.itemId);
  };

  const duplicate = (item: CanvasItem) => {
    if (item.combining || item.leaving) return;
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: nextId(),
        x: item.x + 20,
        y: item.y + 20,
        z: topZ(),
        celebrate: false,
      },
    ]);
  };

  const clearCanvas = () => {
    const width = canvasRef.current?.clientWidth || 1;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        leaving: true,
        celebrate: false,
        leaveDelay: Math.round(
          Math.min(1, Math.max(0, 1 - item.x / width)) * 320,
        ),
      })),
    );
  };

  const resetProgress = () => {
    discoveredStore.reset();
    setItems([]);
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <CraftCanvas
        ref={canvasRef}
        items={items}
        draggingId={drag?.moved ? drag.itemId : null}
        targetId={drag?.targetId ?? null}
        onItemPointerDown={handleCanvasPointerDown}
        onItemPointerMove={handlePointerMove}
        onItemPointerUp={handlePointerUp}
        onItemDoubleClick={duplicate}
        onItemCelebrationEnd={(id) => updateItem(id, { celebrate: false })}
        sweeping={items.some((item) => item.leaving)}
        showHint={discovered.length <= STARTER_ELEMENTS.length}
        onClear={clearCanvas}
        onItemLeft={(id) => removeItems(id)}
      />
      <ElementSidebar
        elements={discovered}
        justAdded={justAdded}
        isRemoveTarget={Boolean(drag?.moved && drag.overSidebar)}
        onChipPointerDown={handleSidebarPointerDown}
        onChipPointerMove={handlePointerMove}
        onChipPointerUp={handlePointerUp}
        onReset={resetProgress}
      />
    </div>
  );
}
