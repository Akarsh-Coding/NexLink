import Image from "next/image";
import styles from "../styles/page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>
            To get started, edit the <code className={styles.code}>pages/index.js</code> file.
          </h1>
          <p>
            Looking for a starting point or more instructions? Head over to the
            <a href="https://nextjs.org/learn" target="_blank" rel="noopener noreferrer">
              Next.js learning center
            </a>.
          </p>
        </div>
        <div className={styles.ctas}>
          <a className={styles.primary} href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
            <Image className={styles.logo} src="/vercel.svg" alt="Vercel logomark" width={16} height={14} />
            Deploy Now
          </a>
          <a className={styles.secondary} href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
