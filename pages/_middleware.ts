import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

import { primaryDomain, stagingDomain } from '@/libraries/config'

export default function middleware(req: NextRequest) {
  // Clone the request url
  const url = req.nextUrl.clone()

  // Get pathname of request (e.g. /blog-slug)
  const { pathname } = req.nextUrl

  // Get hostname of request (e.g. demo.PRIMARY_DOMAIN)
  const hostname = req.headers.get('host')

  if (!hostname)
    return new Response(null, {
      status: 400,
      statusText: 'No hostname found in request headers'
    })

  // You have to set variable `NEXT_PUBLIC_PRIMARY_DOMAIN` and `NEXT_PUBLIC_STAGING_DOMAIN`
  // value with your own domain if you deploy this example under your domain. You can use wildcard
  // subdomains on .vercel.app links that are associated with your Vercel team slug in this
  // case, my team slug is "riipandi", thus *.next-platform-ts.vercel.app works.
  const currentHost =
    isProduction && isVercel
      ? hostname.replace(`.${primaryDomain}`, '').replace(`.${stagingDomain}`, '')
      : hostname.replace(`.localhost:3000`, '')

  // Only for demo purposes - remove this if you want to use your root domain as the landing page
  if (hostname === primaryDomain || hostname === stagingDomain) {
    url.pathname = isProduction ? `https://demo.${primaryDomain}` : 'http://demo.localhost:3000'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith(`/_sites`))
    return new Response(null, {
      status: 404
    })

  if (!pathname.includes('.') && !pathname.startsWith('/api')) {
    if (currentHost == 'app') {
      if (
        pathname === '/login' &&
        (req.cookies['next-auth.session-token'] || req.cookies['__Secure-next-auth.session-token'])
      ) {
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      url.pathname = `/app${pathname}`
      return NextResponse.rewrite(url)
    }

    if (hostname === 'localhost:3000' || hostname === 'next-platform-ts.vercel.app') {
      url.pathname = `/home`
      return NextResponse.rewrite(url)
    }

    url.pathname = `/_sites/${currentHost}${pathname}`
    return NextResponse.rewrite(url)
  }
}
