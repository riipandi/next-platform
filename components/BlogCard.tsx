import type { Post } from '@prisma/client'
import Link from 'next/link'

import BlurImage from './BlurImage'
import Date from './Date'

interface BlogCardProps {
  data: Pick<Post, 'slug' | 'image' | 'imageBlurhash' | 'title' | 'description' | 'createdAt'>
}

export default function BlogCard({ data }: BlogCardProps) {
  return (
    <Link href={`/${data.slug}`}>
      <a>
        <div className='overflow-hidden transition-all duration-200 bg-white border-2 border-gray-100 shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 ease'>
          {data.image ? (
            <BlurImage
              src={data.image}
              alt={data.title ?? 'Blog '}
              width={500}
              height={400}
              layout='responsive'
              objectFit='cover'
              placeholder='blur'
              blurDataURL={data.imageBlurhash ?? undefined}
            />
          ) : (
            <div className='absolute flex items-center justify-center w-full h-full text-4xl text-gray-500 bg-gray-100 select-none'>
              ?
            </div>
          )}
          <div className='px-5 py-8 border-t border-gray-200 h-36'>
            <h3 className='text-xl tracking-wide font-cal'>{data.title}</h3>
            <p className='my-2 italic text-gray-600 truncate text-md'>{data.description}</p>
            <p className='my-2 text-sm text-gray-600'>
              Published <Date dateString={data.createdAt.toString()} />
            </p>
          </div>
        </div>
      </a>
    </Link>
  )
}
