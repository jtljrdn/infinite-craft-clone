import React from "react";
import { twMerge } from "tailwind-merge";

interface ElementCardNonDraggableProps {
  name: string;
  emoji: string;
  onClick: () => void;
  className?: string;
}

const ElementCardNonDraggable = ({
  name,
  emoji,
  onClick,
  className,
}: ElementCardNonDraggableProps) => {
  return (
    <div
      className={twMerge(
        "bg-white cursor-pointer p-3 rounded-md shadow-md border border-gray-200 hover:shadow-lg transition duration-300 ease-in-out max-h-12",
        className
      )}
      onClick={onClick}
    >
      <span>
        <span className="">{emoji}</span>
        {name}
      </span>
    </div>
  );
};

export default ElementCardNonDraggable;
