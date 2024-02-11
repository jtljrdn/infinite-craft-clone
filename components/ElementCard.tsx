"use client";
import { useState } from "react";
import Draggable from "react-draggable";

interface ElementCardProps {
  name: string;
  id: string;
}

const ElementCard = ({ name, id }: ElementCardProps) => {
  const [drag, setDrag] = useState(false);

  return (
    <Draggable onDrag={() => setDrag(true)} onStop={() => setDrag(false)}>
      <div className={drag ? "element z-50" : "element z-auto"}>
        <span>
          <span className="">😀</span>
          {name}
        </span>
      </div>
    </Draggable>
  );
};

export default ElementCard;
