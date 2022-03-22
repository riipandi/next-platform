import type { Site } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useDebounce } from 'use-debounce'
import { HttpMethod } from '@/types'

import { primaryDomain } from '@/libraries/config'
import { fetcher } from '@/libraries/fetcher'

import Layout from '@/components/app/Layout'
import LoadingDots from '@/components/app/loading-dots'
import BlurImage from '@/components/BlurImage'
import Modal from '@/components/Modal'

export default function AppIndex() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [creatingSite, setCreatingSite] = useState<boolean>(false)
  const [subdomain, setSubdomain] = useState<string>('')
  const [debouncedSubdomain] = useDebounce(subdomain, 1500)
  const [error, setError] = useState<string | null>(null)

  const siteNameRef = useRef<HTMLInputElement | null>(null)
  const siteSubdomainRef = useRef<HTMLInputElement | null>(null)
  const siteDescriptionRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    async function checkSubDomain() {
      if (debouncedSubdomain.length > 0) {
        const response = await fetch(`/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`)
        const available = await response.json()
        if (available) {
          setError(null)
        } else {
          setError(`${debouncedSubdomain}.${primaryDomain}`)
        }
      }
    }
    checkSubDomain()
  }, [debouncedSubdomain])

  const router = useRouter()

  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { data: sites } = useSWR<Array<Site>>(sessionId && `/api/site`, fetcher)

  async function createSite(e: FormEvent<HTMLFormElement>) {
    const res = await fetch('/api/site', {
      method: HttpMethod.POST,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: sessionId,
        name: siteNameRef.current?.value,
        subdomain: siteSubdomainRef.current?.value,
        description: siteDescriptionRef.current?.value
      })
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/site/${data.siteId}`)
    }
  }

  return (
    <Layout>
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setCreatingSite(true)
            createSite(event)
          }}
          className='inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white rounded-lg shadow-xl'
        >
          <h2 className='mb-6 text-2xl font-cal'>Create a New Site</h2>
          <div className='grid w-5/6 mx-auto gap-y-5'>
            <div className='flex items-center border border-gray-700 rounded-lg flex-start'>
              <span className='pl-5 pr-1'>📌</span>
              <input
                className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none rounded-r-lg focus:outline-none focus:ring-0'
                name='name'
                placeholder='Site Name'
                ref={siteNameRef}
                type='text'
              />
            </div>
            <div className='flex items-center border border-gray-700 rounded-lg flex-start'>
              <span className='pl-5 pr-1'>🪧</span>
              <input
                className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none rounded-l-lg focus:outline-none focus:ring-0'
                name='subdomain'
                onInput={() => setSubdomain(siteSubdomainRef.current!.value)}
                placeholder='Subdomain'
                ref={siteSubdomainRef}
                type='text'
              />
              <span className='flex items-center h-full px-5 bg-gray-100 border-l border-gray-600 rounded-r-lg'>
                .{primaryDomain}
              </span>
            </div>
            {error && (
              <p className='px-5 text-left text-red-500'>
                <b>{error}</b> is not available. Please choose another subdomain.
              </p>
            )}
            <div className='flex border border-gray-700 rounded-lg flex-start items-top'>
              <span className='pl-5 pr-1 mt-3'>✍️</span>
              <textarea
                className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none rounded-r-lg focus:outline-none focus:ring-0'
                name='description'
                placeholder='Description'
                ref={siteDescriptionRef}
                required
                rows={3}
              />
            </div>
          </div>
          <div className='flex items-center justify-between w-full mt-10'>
            <button
              type='button'
              className='w-full px-5 py-5 text-sm text-gray-600 transition-all duration-150 ease-in-out border-t border-gray-300 rounded-bl hover:text-black focus:outline-none focus:ring-0'
              onClick={() => {
                setError(null)
                setShowModal(false)
              }}
            >
              CANCEL
            </button>

            <button
              type='submit'
              disabled={creatingSite || error !== null}
              className={`${
                creatingSite || error
                  ? 'cursor-not-allowed text-gray-400 bg-gray-50'
                  : 'bg-white text-gray-600 hover:text-black'
              } w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
            >
              {creatingSite ? <LoadingDots /> : 'CREATE SITE'}
            </button>
          </div>
        </form>
      </Modal>

      <div className='max-w-screen-xl px-10 py-20 mx-auto sm:px-20'>
        <div className='flex flex-col items-center justify-between space-y-5 sm:flex-row sm:space-y-0'>
          <h1 className='text-5xl font-cal'>My Sites</h1>
          <button
            onClick={() => setShowModal(true)}
            className='w-3/4 px-5 py-3 text-lg tracking-wide text-white transition-all duration-150 ease-in-out bg-black border-2 border-black font-cal sm:w-40 hover:bg-white hover:text-black'
          >
            New Site <span className='ml-2'>＋</span>
          </button>
        </div>
        <div className='grid my-10 gap-y-10'>
          {sites ? (
            sites.length > 0 ? (
              sites.map((site) => (
                <Link href={`/site/${site.id}`} key={site.id}>
                  <a>
                    <div className='flex flex-col overflow-hidden border border-gray-200 rounded-lg md:flex-row md:h-60'>
                      <div className='relative w-full h-60 md:h-auto md:w-1/3 md:flex-none'>
                        {site.image ? (
                          <BlurImage
                            src={site.image}
                            layout='fill'
                            objectFit='cover'
                            alt={site.name ?? 'Site thumbnail'}
                          />
                        ) : (
                          <div className='absolute flex items-center justify-center w-full h-full text-4xl text-gray-500 bg-gray-100 select-none'>
                            ?
                          </div>
                        )}
                      </div>
                      <div className='relative p-10'>
                        <h2 className='text-3xl font-cal'>{site.name}</h2>
                        <p className='my-5 text-base line-clamp-3'>{site.description}</p>
                        <a
                          onClick={(e) => e.stopPropagation()}
                          href={`https://${site.subdomain}.${primaryDomain}`}
                          target='_blank'
                          className='absolute px-3 py-1 tracking-wide text-gray-600 bg-gray-200 rounded font-cal bottom-5 left-10 whitespace-nowrap'
                          rel='noreferrer'
                        >
                          {site.subdomain}.{primaryDomain} ↗
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
                    No sites yet. Click "New Site" to create one.
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
