import type { Post, Site } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSWR from 'swr'
import { HttpMethod } from '@/types'

import { primaryDomain } from '@/libraries/config'
import { fetcher } from '@/libraries/fetcher'

import Layout from '@/components/app/Layout'
import LoadingDots from '@/components/app/loading-dots'
import BlurImage from '@/components/BlurImage'

interface SitePostData {
  posts: Array<Post>
  site: Site | null
}

export default function SiteDrafts() {
  const [creatingPost, setCreatingPost] = useState(false)

  const router = useRouter()
  const { id: siteId } = router.query

  const { data } = useSWR<SitePostData>(siteId && `/api/post?siteId=${siteId}&published=false`, fetcher, {
    onSuccess: (data) => !data?.site && router.push('/')
  })

  async function createPost(siteId: string) {
    try {
      const res = await fetch(`/api/post?siteId=${siteId}`, {
        method: HttpMethod.POST,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/post/${data.postId}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      <div className='max-w-screen-xl px-10 py-20 mx-auto sm:px-20'>
        <div className='flex flex-col items-center justify-between space-y-5 sm:flex-row sm:space-y-0'>
          <h1 className='text-5xl font-cal'> Drafts for {data ? data?.site?.name : '...'}</h1>
          <button
            onClick={() => {
              setCreatingPost(true)
              createPost(siteId as string)
            }}
            className={`${
              creatingPost
                ? 'cursor-not-allowed bg-gray-300 border-gray-300'
                : 'text-white bg-black hover:bg-white hover:text-black border-black'
            } font-cal text-lg w-3/4 sm:w-40 tracking-wide border-2 px-5 py-3 transition-all ease-in-out duration-150`}
          >
            {creatingPost ? (
              <LoadingDots />
            ) : (
              <>
                New Draft <span className='ml-2'>＋</span>
              </>
            )}
          </button>
        </div>
        <div className='grid my-10 gap-y-10'>
          {data ? (
            data.posts.length > 0 ? (
              data.posts.map((post) => (
                <Link href={`/post/${post.id}`} key={post.id}>
                  <a>
                    <div className='flex flex-col overflow-hidden border border-gray-200 rounded-lg md:flex-row md:h-60'>
                      <div className='relative w-full h-60 md:h-auto md:w-1/3 md:flex-none'>
                        {post.image ? (
                          <BlurImage
                            alt={post.title ?? 'Unknown Thumbnail'}
                            layout='fill'
                            objectFit='cover'
                            src={post.image}
                          />
                        ) : (
                          <div className='absolute flex items-center justify-center w-full h-full text-4xl text-gray-500 bg-gray-100'>
                            ?
                          </div>
                        )}
                      </div>
                      <div className='relative p-10'>
                        <h2 className='text-3xl font-cal'>{post.title || 'Untitled Post'}</h2>
                        <p className='my-5 text-base'>
                          {post.description || 'No description provided. Click to edit.'}
                        </p>
                        <a
                          href={`https://${data.site?.subdomain}.${primaryDomain}/${post.slug}`}
                          target='_blank'
                          className='absolute px-3 py-1 tracking-wide text-gray-600 bg-gray-200 rounded font-cal bottom-5 left-10 whitespace-nowrap'
                          rel='noreferrer'
                        >
                          {data.site?.subdomain}.{primaryDomain}/{post.slug} ↗
                        </a>
                      </div>
                    </div>
                  </a>
                </Link>
              ))
            ) : (
              <>
                <div className='flex flex-col overflow-hidden border border-gray-200 rounded-lg md:flex-row md:h-60'>
                  <div className='relative w-full bg-gray-300 h-60 md:h-auto md:w-1/3 md:flex-none' />
                  <div className='relative grid gap-5 p-10'>
                    <div className='h-10 bg-gray-300 rounded-md w-28' />
                    <div className='w-48 h-6 bg-gray-300 rounded-md' />
                    <div className='w-48 h-6 bg-gray-300 rounded-md' />
                    <div className='w-48 h-6 bg-gray-300 rounded-md' />
                  </div>
                </div>
                <div className='text-center'>
                  <p className='text-2xl text-gray-600 font-cal'>
                    No drafts yet. Click "New Draft" to create one.
                  </p>
                </div>
              </>
            )
          ) : (
            [0, 1].map((i) => (
              <div
                key={i}
                className='flex flex-col overflow-hidden border border-gray-200 rounded-lg md:flex-row md:h-60'
              >
                <div className='relative w-full bg-gray-300 h-60 md:h-auto md:w-1/3 md:flex-none animate-pulse' />
                <div className='relative grid gap-5 p-10'>
                  <div className='h-10 bg-gray-300 rounded-md w-28 animate-pulse' />
                  <div className='w-48 h-6 bg-gray-300 rounded-md animate-pulse' />
                  <div className='w-48 h-6 bg-gray-300 rounded-md animate-pulse' />
                  <div className='w-48 h-6 bg-gray-300 rounded-md animate-pulse' />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
