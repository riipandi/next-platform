import type { Site } from '@prisma/client'
import { useRouter } from 'next/router'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import useSWR, { mutate } from 'swr'
import { useDebounce } from 'use-debounce'
import { HttpMethod } from '@/types'

import { primaryDomain } from '@/libraries/config'
import { fetcher } from '@/libraries/fetcher'
import saveImage from '@/libraries/save-image'

import DomainCard from '@/components/app/DomainCard'
import Layout from '@/components/app/Layout'
import LoadingDots from '@/components/app/loading-dots'
import BlurImage from '@/components/BlurImage'
import CloudinaryUploadWidget from '@/components/Cloudinary'
import Modal from '@/components/Modal'

type SettingsData = Pick<
  Site,
  'id' | 'name' | 'description' | 'subdomain' | 'customDomain' | 'image' | 'imageBlurhash'
>

export default function SiteSettings() {
  const router = useRouter()
  const { id } = router.query
  const siteId = id

  const { data: settings } = useSWR<Site | null>(siteId && `/api/site?siteId=${siteId}`, fetcher, {
    onError: () => router.push('/'),
    revalidateOnFocus: false
  })

  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<any | null>(null)
  const [disabled, setDisabled] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingSite, setDeletingSite] = useState(false)

  const [data, setData] = useState<SettingsData>({
    id: '',
    name: null,
    description: null,
    subdomain: null,
    customDomain: null,
    image: null,
    imageBlurhash: null
  })

  useEffect(() => {
    if (settings)
      setData({
        id: settings.id,
        name: settings.name,
        description: settings.description,
        subdomain: settings.subdomain,
        customDomain: settings.customDomain,
        image: settings.image,
        imageBlurhash: settings.imageBlurhash
      })
  }, [settings])

  useEffect(() => {
    if (adding) setDisabled(true)
  }, [adding])

  async function saveSiteSettings(data: SettingsData) {
    setSaving(true)

    try {
      const response = await fetch('/api/site', {
        method: HttpMethod.PUT,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentSubdomain: settings?.subdomain ?? undefined,
          ...data,
          id: siteId
        })
      })

      if (response.ok) {
        setSaving(false)
        mutate(`/api/get-site-settings?siteId=${siteId}`)
        toast.success(`Changes Saved`)
      }
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteSite(siteId: string) {
    setDeletingSite(true)

    try {
      const response = await fetch(`/api/site?siteId=${siteId}`, {
        method: HttpMethod.DELETE
      })

      if (response.ok) router.push('/')
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingSite(false)
    }
  }
  const [debouncedSubdomain] = useDebounce(data?.subdomain, 1500)
  const [subdomainError, setSubdomainError] = useState<string | null>(null)

  useEffect(() => {
    async function checkSubdomain() {
      try {
        const response = await fetch(`/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`)

        const available = await response.json()

        setSubdomainError(available ? null : `${debouncedSubdomain}.${primaryDomain}`)
      } catch (error) {
        console.error(error)
      }
    }

    if (debouncedSubdomain !== settings?.subdomain && debouncedSubdomain && debouncedSubdomain?.length > 0)
      checkSubdomain()
  }, [debouncedSubdomain])

  async function handleCustomDomain(event: FormEvent<HTMLFormElement>) {
    const customDomain = event.currentTarget.customDomain.value

    setAdding(true)

    try {
      const response = await fetch(`/api/domain?domain=${customDomain}&siteId=${siteId}`, {
        method: HttpMethod.POST
      })

      if (!response.ok)
        throw {
          code: response.status,
          domain: customDomain
        }

      setError(null)

      setData((data) => ({
        ...data,
        customDomain: customDomain
      }))

      event.currentTarget.customDomain.value = ''
    } catch (error) {
      setError(error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Layout>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 10000
        }}
      />
      <div className='max-w-screen-xl px-10 mx-auto mt-20 mb-16 sm:px-20'>
        <h1 className='mb-12 text-5xl font-cal'>Site Settings</h1>
        <div className='flex flex-col space-y-12 mb-28'>
          <div className='flex flex-col space-y-6'>
            <h2 className='text-2xl font-cal'>Site Name</h2>
            <div className='flex items-center max-w-lg overflow-hidden border border-gray-700 rounded-lg'>
              <input
                className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none font-cal focus:outline-none focus:ring-0'
                name='name'
                onInput={(e) => setData((data) => ({ ...data, name: e.currentTarget.value }))}
                placeholder='Untitled Site'
                type='text'
                value={data.name ?? 'Unknown Name'}
              />
            </div>
          </div>
          <div className='flex flex-col space-y-6'>
            <h2 className='text-2xl font-cal'>Site Description</h2>
            <div className='flex items-center max-w-lg overflow-hidden border border-gray-700 rounded-lg'>
              <textarea
                className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none font-cal focus:outline-none focus:ring-0'
                name='description'
                onInput={(e) =>
                  setData((data) => ({
                    ...data,
                    description: e.currentTarget.value
                  }))
                }
                placeholder='Lorem ipsum forem dimsum'
                rows={3}
                value={data?.description ?? 'Unknown Description'}
              />
            </div>
          </div>
          <div className='flex flex-col space-y-6'>
            <h2 className='text-2xl font-cal'>Subdomain</h2>
            <div className='flex items-center max-w-lg border border-gray-700 rounded-lg'>
              <input
                className='w-1/2 px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none rounded-l-lg font-cal focus:outline-none focus:ring-0'
                name='subdomain'
                onInput={(e) =>
                  setData((data) => ({
                    ...data,
                    subdomain: e.currentTarget.value
                  }))
                }
                placeholder='subdomain'
                type='text'
                value={data.subdomain ?? 'Unknown Subdomain'}
              />
              <div className='flex items-center justify-center w-1/2 h-12 bg-gray-100 border-l border-gray-600 rounded-r-lg font-cal'>
                {primaryDomain}
              </div>
            </div>
            {subdomainError && (
              <p className='px-5 text-left text-red-500'>
                <b>{subdomainError}</b> is not available. Please choose another subdomain.
              </p>
            )}
          </div>
          <div className='flex flex-col space-y-6'>
            <h2 className='text-2xl font-cal'>Custom Domain</h2>
            {!data.customDomain && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  await handleCustomDomain(e.currentTarget.customDomain.value)
                }}
                className='flex items-center justify-start max-w-lg space-x-3'
              >
                <div className='flex-auto overflow-hidden border border-gray-700 rounded-lg'>
                  <input
                    autoComplete='off'
                    className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none font-cal focus:outline-none focus:ring-0'
                    name='customDomain'
                    onInput={(e) => {
                      const customDomain = e.currentTarget.value
                      setDisabled(!customDomain || customDomain.length == 0 ? true : false)
                    }}
                    pattern='^(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$'
                    placeholder='mydomain.com'
                    type='text'
                  />
                </div>
                <button
                  type='submit'
                  disabled={disabled}
                  className={`${
                    disabled
                      ? 'cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300'
                      : 'bg-black text-white border-black hover:text-black hover:bg-white'
                  } px-5 py-3 w-28 font-cal border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150`}
                >
                  {adding ? <LoadingDots /> : 'Add'}
                </button>
              </form>
            )}
            {error && (
              <div className='flex items-center w-full max-w-2xl mt-5 space-x-2 text-sm text-left text-red-500'>
                <svg
                  viewBox='0 0 24 24'
                  width='20'
                  height='20'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                  shapeRendering='geometricPrecision'
                  style={{ color: '#f44336' }}
                >
                  <circle cx='12' cy='12' r='10' fill='white' />
                  <path d='M12 8v4' stroke='#f44336' />
                  <path d='M12 16h.01' stroke='#f44336' />
                </svg>
                {error.code == 403 ? (
                  <p>
                    <b>{error.domain}</b> is already owned by another team.
                    <button
                      className='ml-1'
                      onClick={async (e) => {
                        e.preventDefault()
                        await fetch(`/api/request-delegation?domain=${error.domain}`).then((res) => {
                          if (res.ok) {
                            toast.success(
                              `Requested delegation for ${error.domain}. Try adding the domain again in a few minutes.`
                            )
                          } else {
                            alert('There was an error requesting delegation. Please try again later.')
                          }
                        })
                      }}
                    >
                      <u>Click here to request access.</u>
                    </button>
                  </p>
                ) : (
                  <p>
                    Cannot add <b>{error.domain}</b> since it's already assigned to another project.
                  </p>
                )}
              </div>
            )}
            {data.customDomain && <DomainCard data={data} setData={setData} />}
          </div>
          <div className='relative flex flex-col space-y-6'>
            <h2 className='text-2xl font-cal'>Thumbnail Image</h2>
            <div
              className={`${
                data.image ? '' : 'animate-pulse bg-gray-300 h-150'
              } relative mt-5 w-full border-2 border-gray-800 border-dashed rounded-md`}
            >
              <CloudinaryUploadWidget callback={(e) => saveImage(e, data, setData)}>
                {({ open }) => (
                  <button
                    onClick={open}
                    className='absolute z-10 flex flex-col items-center justify-center w-full h-full transition-all duration-200 ease-linear bg-gray-200 rounded-md opacity-0 hover:opacity-100'
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'>
                      <path d='M16 16h-3v5h-2v-5h-3l4-4 4 4zm3.479-5.908c-.212-3.951-3.473-7.092-7.479-7.092s-7.267 3.141-7.479 7.092c-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h3.5v-2h-3.5c-1.93 0-3.5-1.57-3.5-3.5 0-2.797 2.479-3.833 4.433-3.72-.167-4.218 2.208-6.78 5.567-6.78 3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5h-3.5v2h3.5c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408z' />
                    </svg>
                    <p>Upload another image</p>
                  </button>
                )}
              </CloudinaryUploadWidget>

              {data.image && (
                <BlurImage
                  alt='Cover Photo'
                  blurDataURL={data.imageBlurhash ?? undefined}
                  className='rounded-md'
                  height={500}
                  layout='responsive'
                  objectFit='cover'
                  placeholder='blur'
                  src={data.image}
                  width={800}
                />
              )}
            </div>
            <div className='w-full h-10' />
            <div className='flex flex-col max-w-lg space-y-6'>
              <h2 className='text-2xl font-cal'>Delete Site</h2>
              <p>
                Permanently delete your site and all of its contents from our platform. This action is not
                reversible – please continue with caution.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true)
                }}
                className='px-5 py-3 text-white transition-all duration-150 ease-in-out bg-red-500 border border-red-500 border-solid rounded-md hover:text-red-500 hover:bg-white max-w-max font-cal focus:outline-none'
              >
                Delete Site
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            await deleteSite(siteId as string)
          }}
          className='inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white rounded-lg shadow-xl'
        >
          <h2 className='mb-6 text-2xl font-cal'>Delete Site</h2>
          <div className='grid w-5/6 mx-auto gap-y-5'>
            <p className='mb-3 text-gray-600'>
              Are you sure you want to delete your site? This action is not reversible. Type in the full name
              of your site (<b>{data.name}</b>) to confirm.
            </p>
            <div className='flex items-center overflow-hidden border border-gray-700 rounded-lg flex-start'>
              <input
                className='w-full px-5 py-3 text-gray-700 placeholder-gray-400 bg-white border-none rounded-none rounded-r-lg focus:outline-none focus:ring-0'
                type='text'
                name='name'
                placeholder={data.name ?? ''}
                pattern={data.name ?? 'Site Name'}
              />
            </div>
          </div>
          <div className='flex items-center justify-between w-full mt-10'>
            <button
              type='button'
              className='w-full px-5 py-5 text-sm text-gray-400 transition-all duration-150 ease-in-out border-t border-gray-300 rounded-bl hover:text-black focus:outline-none focus:ring-0'
              onClick={() => setShowDeleteModal(false)}
            >
              CANCEL
            </button>

            <button
              type='submit'
              disabled={deletingSite}
              className={`${
                deletingSite
                  ? 'cursor-not-allowed text-gray-400 bg-gray-50'
                  : 'bg-white text-gray-600 hover:text-black'
              } w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
            >
              {deletingSite ? <LoadingDots /> : 'DELETE SITE'}
            </button>
          </div>
        </form>
      </Modal>

      <footer className='fixed inset-x-0 bottom-0 z-20 h-20 bg-white border-t border-gray-500 border-solid'>
        <div className='flex items-center justify-end h-full max-w-screen-xl px-10 mx-auto sm:px-20'>
          <button
            onClick={() => {
              saveSiteSettings(data)
            }}
            disabled={saving || subdomainError !== null}
            className={`${
              saving || subdomainError
                ? 'cursor-not-allowed bg-gray-300 border-gray-300'
                : 'bg-black hover:bg-white hover:text-black border-black'
            } mx-2 rounded-md w-36 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
          >
            {saving ? <LoadingDots /> : 'Save Changes'}
          </button>
        </div>
      </footer>
    </Layout>
  )
}
