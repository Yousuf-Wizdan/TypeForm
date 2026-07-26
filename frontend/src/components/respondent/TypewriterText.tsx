"use client";

import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  tag?: "h1" | "h2" | "p";
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  delay = 0,
  className,
  tag: Tag = "h1",
  style,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayText.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayText(text.slice(0, displayText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, text, speed, started]);

  useEffect(() => {
    setDisplayText("");
    setStarted(false);
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [text]);

  return (
    <Tag className={className} style={style}>
      {displayText}
      {displayText.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] align-middle ml-0.5 animate-pulse" style={{ backgroundColor: "currentColor", opacity: 0.6 }} />
      )}
    </Tag>
  );
};