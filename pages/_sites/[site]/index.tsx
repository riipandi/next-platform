import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'
import type { _SiteData, Meta } from '@/types'

import prisma from '@/libraries/prisma'

import BlogCard from '@/components/BlogCard'
import BlurImage from '@/components/BlurImage'
import Date from '@/components/Date'
import Layout from '@/components/sites/Layout'
import Loader from '@/components/sites/Loader'

interface PathProps extends ParsedUrlQuery {
  site: string
}

interface IndexProps {
  stringifiedData: string
}

export default function Index({ stringifiedData }: IndexProps) {
  const router = useRouter()
  if (router.isFallback) return <Loader />

  const data = JSON.parse(stringifiedData) as _SiteData

  const meta = {
    title: data.name,
    description: data.description,
    logo: '/logo.png',
    ogImage: data.image,
    ogUrl: data.customDomain ? data.customDomain : `https://${data.subdomain}.mystream.page`
  } as Meta

  return (
    <Layout meta={meta} subdomain={data.subdomain ?? undefined}>
      <div className='w-full mb-20'>
        {data.posts.length > 0 ? (
          <div className='w-full max-w-screen-xl mx-auto lg:w-5/6 md:mb-28'>
            <Link href={`/${data.posts[0].slug}`}>
              <a>
                <div className='relative w-full mx-auto overflow-hidden group h-80 sm:h-150 lg:rounded-xl'>
                  {data.posts[0].image ? (
                    <BlurImage
                      alt={data.posts[0].title ?? ''}
                      blurDataURL={data.posts[0].imageBlurhash ?? undefined}
                      className='group-hover:scale-105 group-hover:duration-300'
                      layout='fill'
                      objectFit='cover'
                      placeholder='blur'
                      src={data.posts[0].image}
                    />
                  ) : (
                    <div className='absolute flex items-center justify-center w-full h-full text-4xl text-gray-500 bg-gray-100 select-none'>
                      ?
                    </div>
                  )}
                </div>
                <div className='w-5/6 mx-auto mt-10 lg:w-full'>
                  <h2 className='my-10 text-4xl font-cal md:text-6xl'>{data.posts[0].title}</h2>
                  <p className='w-full text-base md:text-lg lg:w-2/3'>{data.posts[0].description}</p>
                  <div className='flex items-center justify-start w-full space-x-4'>
                    <div className='relative flex-none w-8 h-8 overflow-hidden rounded-full'>
                      {data.user?.image ? (
                        <BlurImage
                          alt={data.user?.name ?? 'User Avatar'}
                          layout='fill'
                          objectFit='cover'
                          src={data.user?.image}
                        />
                      ) : (
                        <div className='absolute flex items-center justify-center w-full h-full text-4xl text-gray-500 bg-gray-100 select-none'>
                          ?
                        </div>
                      )}
                    </div>
                    <p className='inline-block ml-3 text-sm font-semibold align-middle md:text-base whitespace-nowrap'>
                      {data.user?.name}
                    </p>
                    <div className='h-6 border-l border-gray-600' />
                    <p className='w-10/12 m-auto my-5 text-sm font-light text-gray-500 md:text-base'>
                      <Date dateString={data.posts[0].createdAt.toString()} />
                    </p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20'>
            <BlurImage
              src='/empty-state.png'
              alt='No Posts'
              width={613}
              height={420}
              placeholder='blur'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA6ZJREFUWEe1VwFuGzEMk2///+8uydmDSFGWfdduKLAUQYqsiyiKpJQ2xhj2t4f/RR82RreO18FX/xlm+oDWzKw1a63Z4c+Dz3YcX1ZoPwLQh/VBIF48O2he/78BiO57R3ECMIDAw7s3L27WvGswcCQT+IeHx78x4HR7Ye9cIygM5Oc+MnBgDD8HkDPvNgJAHz27XwRUAfj8G4tTBxDIjYPvGfAuUfSJfo7AH/4SE5gaQOE5Av/9iYWvAWzFvWvQXwVYDQTxFRF68dTCBLODeAYQImPnon7VgBxQOYUDQL1e5wj4njNCq2ocNwD4YPicxSm8+bsYcP7r/GW/BFE0IFBiBH8D0zQrADhTCKzM3YtfVQMhSrIf03fq/adSro4XRmhPPsO93av5R8lWpTgLx/Ny788k9No1ATOAQnjoOoTITFiL+3sg4epXhiE9ziIofrE4fycAx0uwMX11X4pA/bJfWHGCCOojvdr780EvSrU6dy98BYj5PgEU82X2q4gAZBo+da8RvN7vGwBR78UnEyHGGJX4l6Co8Ek7KQ8rSgfwqawaGjhfr0UDolydJ4gtimU/iK/ZLXS0BaclqQFuS7oQ//d8nWAUqzWiFtRj7hdGMEeh+U8DEkB0rgWkFIxVLBC5rmVBx/H7PJMBbLlQPQqX4hqLRFgZyC4lvtwBcwQ1J9h9iHEBgJjdCl8XnQAxcg0jhAY/5L7/vahccCzJmP6XBR3IIwOl8w8KcxRax0rBnwEIIYqB83whVNnYzACOYNeAr+Gwoe6Q5QKanSuEMoA2K4YKXYTFBQqgEGHqwIFEQtYg0gqGBm4CLIvoONYIzihu1pADxQV7BogJ2pNOSRZ4hH3jgpIDhQFYMc44JmHcdtqCsl3aT4GkpRRC1DGIHCjXD0Wo4gyouqaVAXi9PheDdVnDg/MP9e9xXBnQIYoUbKH64oJcSCUN5/lu1rrzGgCYA3sWEIgvJn/d7wGMwEdRL+ESRIslyyrObYhVuIyAAOoikhjzQsptyHsg7agVjHEcdvyqdyHZURbkDsldHCBuDJTusZ5xK8ZVHBtJQty3Ye1+2Q2xkKDD5ZuRg4gRLG74diXrC0lxQ45gzYX9MLkD8He6zSNEEby7YLOibDVvv1p4i+UaSDcG4sxzFpaLSJfRPoJylueyKafYPgJ9T6g74fEsH85CLbpdRvp2LPekosNqa+FtDPE3ukqfvxdoDBuIeq4td2Gc+uxsjeB0Q1nRPEx4lPwBA2anSbfNT08AAAAASUVORK5CYII='
            />
            <p className='text-2xl text-gray-600 font-cal'>No posts yet.</p>
          </div>
        )}
      </div>

      {data.posts.length > 1 && (
        <div className='max-w-screen-xl mx-5 mb-20 lg:mx-24 2xl:mx-auto'>
          <h2 className='mb-10 text-4xl font-cal md:text-5xl'>More stories</h2>
          <div className='grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8'>
            {data.posts.slice(1).map((metadata, index) => (
              <BlogCard key={index} data={metadata} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const [subdomains, customDomains] = await Promise.all([
    prisma.site.findMany({
      // you can remove this if you want to generate all sites at build time
      where: {
        subdomain: 'demo'
      },
      select: {
        subdomain: true
      }
    }),
    prisma.site.findMany({
      where: {
        NOT: {
          customDomain: null
        },
        // you can remove this if you want to generate all sites at build time
        customDomain: 'platformize.co'
      },
      select: {
        customDomain: true
      }
    })
  ])

  const allPaths = [
    ...subdomains.map(({ subdomain }) => subdomain),
    ...customDomains.map(({ customDomain }) => customDomain)
  ].filter((path) => path) as Array<string>

  return {
    paths: allPaths.map((path) => ({
      params: {
        site: path
      }
    })),
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<IndexProps, PathProps> = async ({ params }) => {
  if (!params) throw new Error('No path parameters found')

  const { site } = params

  let filter: {
    subdomain?: string
    customDomain?: string
  } = {
    subdomain: site
  }

  if (site.includes('.')) {
    filter = {
      customDomain: site
    }
  }

  const data = (await prisma.site.findUnique({
    where: filter,
    include: {
      user: true,
      posts: {
        where: {
          published: true
        },
        orderBy: [
          {
            createdAt: 'desc'
          }
        ]
      }
    }
  })) as _SiteData

  if (!data) return { notFound: true, revalidate: 10 }

  return {
    props: {
      stringifiedData: JSON.stringify(data)
    },
    revalidate: 3600
  }
}
