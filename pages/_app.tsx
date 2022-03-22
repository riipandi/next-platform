import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import '@/libraries/fontloader';

import '@/styles/global.css';

import { initSplitBee } from '@/libraries/splitbee';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    process.env.NODE_ENV !== 'development' && initSplitBee();
  }, []);

  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}
