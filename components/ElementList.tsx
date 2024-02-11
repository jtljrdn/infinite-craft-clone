"use client";
import { Elements } from "@/Elements";
import { useEffect, useState } from "react";
import ElementCardNonDraggable from "./ElementCardNonDraggable";
import axios from "axios";

const ElementList = () => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [elements, setElements] =
    useState<{ name: string; emoji: string }[]>(Elements);
  const handleClick = (element: string) => {
    console.log("clicked " + element);
    if (selectedElements.length === 2) {
      setSelectedElements([element]);
    } else {
      setSelectedElements((prev) => [...prev, element]);
    }
  };

  const createElement = async () => {
    if (selectedElements.length === 2) {
      const newElement = await axios.get(
        `api/combine?element1=${selectedElements[0]}&element2=${selectedElements[1]}`
      );
      console.log(newElement.data.emoji, newElement.data.name);
      // If element already exists, don't add it
      const exists = elements.some(
        (element) => element.name === newElement.data.name
      );
      if (!exists) {
        setElements((prevElements) => [
          ...prevElements,
          {
            name: newElement.data.name,
            emoji: newElement.data.emoji,
          },
        ]);
        localStorage.setItem(
          "elements",
          JSON.stringify([
            ...elements,
            {
              name: newElement.data.name,
              emoji: newElement.data.emoji,
            },
          ])
        );
      }
      setSelectedElements([]);
    }
  };

  const clearElements = () => {
    // Confirm before clearing
    if (!confirm("Are you sure you want to reset the elements?")) {
      return;
    }
    setElements(Elements);
    localStorage.setItem("elements", JSON.stringify(Elements));
  };

  useEffect(() => {
    const savedElements = localStorage.getItem("elements");
    if (savedElements) {
      setElements(JSON.parse(savedElements));
    }
  }, []);
  useEffect(() => {
    createElement();
  }, [selectedElements]);

  return (
    <div className="flex flex-row gap-5 flex-wrap justify-center mt-5">
      {elements.map((element, index) => (
        <ElementCardNonDraggable
          key={index}
          name={element.name}
          emoji={element.emoji}
          onClick={() => handleClick(element.name)}
          className={
            selectedElements.includes(element.name) ? "scale-110 " : ""
          }
        />
      ))}
      <button
        className="btn btn-ghost absolute bottom-0 left-0"
        onClick={() => clearElements()}
      >
        Reset
      </button>
    </div>
  );
};

export default ElementList;
