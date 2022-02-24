import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import '@/libraries/fontloader'

import '@/styles/tailwind.css'
import '@/styles/custom.css'

import { Maintenance } from '@/components/partials'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Display this page when maintenance mode is enabled.
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    return <Maintenance />
  }
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}

export default MyApp
