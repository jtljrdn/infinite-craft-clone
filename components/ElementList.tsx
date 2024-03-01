"use client";
import { Elements } from "@/Elements";
import { useEffect, useState } from "react";
import ElementCardNonDraggable from "./ElementCardNonDraggable";
import axios from "axios";
import Link from "next/link";

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
  const [error, setError] = useState(false);

  const createElement = async () => {
    if (selectedElements.length === 2) {
      try {
        const newElement = await axios.get(
          `api/combine?element1=${selectedElements[0]}&element2=${selectedElements[1]}`
        );
        console.log(newElement.data.error);
        if (!newElement) {
          setError(true);
          setTimeout(() => {
            setError(false);
          }, 3000);
          return;
        }
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
        setTimeout(() => {
          setSelectedElements([]);
        }, 300);
      } catch (error) {
        console.error("Something went wrong", error);
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
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
      {/* small popup that shows if the user found a new element */}

      <button
        className="btn btn-ghost absolute bottom-0 left-0"
        onClick={() => clearElements()}
      >
        Reset
      </button>
      <button
        className="btn btn-ghost absolute bottom-0 right-0"
        onClick={() => {
          const modal = document.getElementById(
            "my_modal_3"
          ) as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
        }}
      >
        About
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">About</h3>
          <p className="py-4">
            Infinite Craft Clone made with 💙 by{" "}
            <Link
              href="https://jtlee.dev"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out"
            >
              Jordan Lee
            </Link>
          </p>
          <p className="pb-4">
            Recreation of
            <Link
              href="https://neal.fun/infinite-craft"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out"
            >
              {" "}
              Infinite Craft
            </Link>{" "}
            by Neal
          </p>
          <p className="pb-4">
            If it's not working, it's because I'm not paying for more OpenAI
            credit right now.{" "}
            <Link
              href="https://ko-fi.com/jtljrdn"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out"
            >
              Ko-Fi
            </Link>
          </p>
          <div className="flex flex-row gap-5">
            <p>
              <Link
                href="https://github.com/jtljrdn"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out"
              >
                GitHub
              </Link>
            </p>
            <p>
              <Link
                href="https://jtlee.dev"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out"
              >
                Website
              </Link>
            </p>
            <p>
              <Link
                href="https://x.com/jtljrdn"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out"
              >
                Twitter
              </Link>
            </p>
          </div>
        </div>
      </dialog>
      {error ? (
        <div
          role="alert"
          className="alert alert-error bottom-0 absolute max-w-2xl opacity-100 visible transition-opacity duration-300 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error! Something went wrong when combining.</span>
        </div>
      ) : (
        <div
          role="alert"
          className="alert alert-error bottom-0 absolute max-w-2xl opacity-0 invisible transition-opacity duration-300 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Error! Something went wrong when combining.
          </span>
        </div>
      )}
    </div>
  );
};

export default ElementList;
