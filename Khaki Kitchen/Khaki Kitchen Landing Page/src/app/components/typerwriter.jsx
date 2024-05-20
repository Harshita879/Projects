"use client";
import React, { useState, useEffect } from "react";
import styles from "./TypingEffect.module.css";

const TypingEffect = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (displayText.length === text.length) {
      return; // Stop if full text is displayed
    }

    const intervalId = setInterval(() => {
      setDisplayText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, 200); // Adjust the typing speed here (in milliseconds)

    return () => clearInterval(intervalId);
  }, [currentIndex, displayText, text]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // Adjust the cursor blink speed here (in milliseconds)

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className={styles.typingEffect}>
      <span>{displayText}</span>
      {showCursor && <span className={styles.cursor}></span>} {/* Cursor */}
    </div>
  );
};

export default TypingEffect;
