import React from "react";

interface ElementCardNonDraggableProps {
  name: string;
  emoji: string;
  onClick: () => void;
}

const ElementCardNonDraggable = ({
  name,
  emoji,
  onClick,
}: ElementCardNonDraggableProps) => {
  return (
    <div
      className="bg-white cursor-pointer p-3 rounded-md shadow-md border border-gray-200 hover:shadow-lg transition duration-300 ease-in-out"
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
