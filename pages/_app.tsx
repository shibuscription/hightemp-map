// pages/_app.tsx

import '@/styles/output.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCDEg3LTCIVTCKHjYGhJ-e0fseiedZUUKI`}
          async
        ></script>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
