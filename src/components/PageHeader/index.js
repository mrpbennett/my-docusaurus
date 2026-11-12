import React from "react";
import styles from "./styles.module.css";

// Page title in the editorial style: a mono eyebrow, a large light serif h1
// and an optional serif lead.
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className={styles.header}>
      {eyebrow && <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.lead}>{children}</div>}
    </header>
  );
}
