import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Apocalipsis Zombie RPG</title>
        <meta name="description" content="Apocalipsis Zombie RPG — Sistema d20 con cartas de decisión y combate." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
