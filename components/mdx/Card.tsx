import Link from 'next/link'
import type { MdxCardData } from '@/types'

import BlurImage from '../BlurImage'

interface CardProps {
  data: MdxCardData
}

export default function Card({ data }: CardProps) {
  return (
    <Link href={`https://${data.url}`} passHref>
      <a target='_blank'>
        <div className='hidden transition-all duration-200 bg-white border-2 border-gray-100 shadow-md lg:block rounded-2xl hover:shadow-xl hover:-translate-y-1 ease'>
          <div className='overflow-hidden rounded-t-2xl'>
            <BlurImage
              alt={data.name ?? 'Card Thumbnail'}
              blurDataURL={data.imageBlurhash ?? undefined}
              height={400}
              layout='responsive'
              objectFit='cover'
              placeholder='blur'
              src={`/examples/${data.image}`}
              width={500}
            />
          </div>
          <div className='px-5 py-6 h-36'>
            <h3 className='text-2xl font-bold tracking-wide truncate font-cal'>{data.name}</h3>
            <p className='mt-3 text-base italic leading-snug text-gray-800'>{data.description}</p>
          </div>
        </div>
        <div className='flex items-center overflow-hidden transition-all duration-200 bg-white border-2 border-gray-100 lg:hidden rounded-xl md:h-48 h-36 focus:border-black active:border-black ease'>
          <div className='relative w-2/5 h-full'>
            <BlurImage
              alt={data.name ?? 'Card thumbnail'}
              blurDataURL={data.imageBlurhash ?? undefined}
              layout='fill'
              objectFit='cover'
              placeholder='blur'
              src={`/examples/${data.image}`}
            />
          </div>
          <div className='w-3/5 px-5 py-6'>
            <h3 className='my-0 text-xl font-bold tracking-wide truncate font-cal'>{data.name}</h3>
            <p className='mt-3 text-sm italic font-normal leading-snug text-gray-800'>{data.description}</p>
          </div>
        </div>
      </a>
    </Link>
  )
}
