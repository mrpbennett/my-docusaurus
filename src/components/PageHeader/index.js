import React from "react";
import styles from "./styles.module.css";

// Page title with the site's terminal flavour: a muted `❯ command` line above
// the real h1. The command is decorative and hidden from assistive tech.
export default function PageHeader({ command, title, children }) {
  return (
    <header className={styles.header}>
      {command && (
        <p className={styles.command} aria-hidden="true">
          <span className="ps1">❯</span> {command}
        </p>
      )}
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.lead}>{children}</div>}
    </header>
  );
}
