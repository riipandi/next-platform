import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import '@/libraries/fontloader'

import '@/styles/tailwind.css'
import '@/styles/custom.css'

import { Maintenance } from '@/components/partials'

function MyApp({ Component, pageProps }: AppProps) {
  // Display this page when maintenance mode is enabled.
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    return <Maintenance />
  }
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
