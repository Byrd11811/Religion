"use client";

import { ChevronLeft, ChevronRight, Compass, MapPinOff } from "lucide-react";
import styles from "./SacredCurrents.module.css";
import type { GuidedChapter } from "./types";

interface Props {
  chapters: GuidedChapter[];
  index: number;
  onChange: (index: number) => void;
}

export function JourneyPlayer({ chapters, index, onChange }: Props) {
  const chapter = chapters[index];
  if (!chapter) return null;

  return (
    <section className={styles.journey} aria-labelledby="guided-story-title">
      <div className={styles.journeyProgress} aria-label="Guided story progress">
        {chapters.map((item, itemIndex) => (
          <button
            type="button"
            key={item.id}
            className={itemIndex === index ? styles.journeyStepActive : undefined}
            onClick={() => onChange(itemIndex)}
            aria-label={`Open chapter ${itemIndex + 1}: ${item.title}`}
            aria-current={itemIndex === index ? "step" : undefined}
          >
            <span>{itemIndex + 1}</span>
          </button>
        ))}
      </div>
      <div className={styles.journeyContent}>
        <Compass size={21} aria-hidden="true" />
        <div>
          <span className={styles.kicker}>{chapter.eyebrow}</span>
          <h2 id="guided-story-title">{chapter.title}</h2>
          <p>{chapter.description}</p>
          <small>
            <MapPinOff size={14} aria-hidden="true" /> {chapter.note}
          </small>
        </div>
      </div>
      <div className={styles.journeyActions}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <ChevronLeft size={17} aria-hidden="true" /> Previous
        </button>
        <span>
          {index + 1} / {chapters.length}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(chapters.length - 1, index + 1))}
          disabled={index === chapters.length - 1}
        >
          Next <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
