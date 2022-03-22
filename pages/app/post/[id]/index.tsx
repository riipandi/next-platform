import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import useSWR, { mutate } from 'swr';
import { useDebounce } from 'use-debounce';
import type { WithSitePost } from '@/types';
import { HttpMethod } from '@/types';

import { primaryDomain } from '@/libraries/config';
import { fetcher } from '@/libraries/fetcher';

import Layout from '@/components/app/Layout';
import Loader from '@/components/app/Loader';
import LoadingDots from '@/components/app/loading-dots';

interface PostData {
  title: string;
  description: string;
  content: string;
}

const CONTENT_PLACEHOLDER = `Write some content. Markdown supported:

# A H1 header

## A H2 header

Fun fact: You embed tweets by pasting the tweet URL in a new line:

https://twitter.com/nextjs/status/1468044361082580995

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, and **bold**. Itemized lists look like:

  * this one
  * that one
  * the other one

Ordered lists look like:

  1. first item
  2. second item
  3. third item

> Block quotes are written like so.
>
> They can span multiple paragraphs,
> if you like.

            `;

export default function Post() {
  const router = useRouter();

  // TODO: Undefined check redirects to error
  const { id: postId } = router.query;

  const { data: post, isValidating } = useSWR<WithSitePost>(
    router.isReady && `/api/post?postId=${postId}`,
    fetcher,
    {
      dedupingInterval: 1000,
      onError: () => router.push('/'),
      revalidateOnFocus: false
    }
  );

  const [savedState, setSavedState] = useState(
    post
      ? `Last saved at ${Intl.DateTimeFormat('en', { month: 'short' }).format(
          new Date(post.updatedAt)
        )} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(
          new Date(post.updatedAt)
        )} ${Intl.DateTimeFormat('en', {
          hour: 'numeric',
          minute: 'numeric'
        }).format(new Date(post.updatedAt))}`
      : 'Saving changes...'
  );

  const [data, setData] = useState<PostData>({
    title: '',
    description: '',
    content: ''
  });

  useEffect(() => {
    if (post)
      setData({
        title: post.title ?? '',
        description: post.description ?? '',
        content: post.content ?? ''
      });
  }, [post]);

  const [debouncedData] = useDebounce(data, 1000);

  useEffect(() => {
    if (debouncedData.title) saveChanges(debouncedData);
  }, [debouncedData]);

  const [publishing, setPublishing] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (data.title && data.description && data.content && !publishing) setDisabled(false);
    else setDisabled(true);
  }, [publishing, data]);

  useEffect(() => {
    function clickedSave(e: KeyboardEvent) {
      const charCode = String.fromCharCode(e.which).toLowerCase();

      if ((e.ctrlKey || e.metaKey) && charCode === 's') {
        e.preventDefault();
        saveChanges(data);
      }
    }

    window.addEventListener('keydown', clickedSave);

    return () => window.removeEventListener('keydown', clickedSave);
  }, [data]);

  async function saveChanges(data: PostData) {
    setSavedState('Saving changes...');

    try {
      const response = await fetch('/api/post', {
        method: HttpMethod.PUT,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: postId,
          title: data.title,
          description: data.description,
          content: data.content
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        setSavedState(
          `Last save ${Intl.DateTimeFormat('en', { month: 'short' }).format(
            new Date(responseData.updatedAt)
          )} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(
            new Date(responseData.updatedAt)
          )} at ${Intl.DateTimeFormat('en', {
            hour: 'numeric',
            minute: 'numeric'
          }).format(new Date(responseData.updatedAt))}`
        );
      } else {
        setSavedState('Failed to save.');
        toast.error('Failed to save');
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function publish() {
    setPublishing(true);

    try {
      const response = await fetch(`/api/post`, {
        method: HttpMethod.PUT,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: postId,
          title: data.title,
          description: data.description,
          content: data.content,
          published: true,
          subdomain: post?.site?.subdomain,
          customDomain: post?.site?.customDomain,
          slug: post?.slug
        })
      });

      if (response.ok) {
        mutate(`/api/post?postId=${postId}`);
        router.push(`https://${post?.site?.subdomain}.${primaryDomain}/${post?.slug}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPublishing(false);
    }
  }

  if (isValidating)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  return (
    <>
      <Layout siteId={post?.site?.id}>
        <div className='max-w-screen-xl px-10 mx-auto mt-10 mb-16 sm:px-20'>
          <TextareaAutosize
            name='title'
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({ ...data, title: e.currentTarget.value })
            }
            className='w-full px-2 py-4 mt-6 text-5xl text-gray-800 placeholder-gray-400 border-none resize-none font-cal focus:outline-none focus:ring-0'
            placeholder='Untitled Post'
            value={data.title}
          />
          <TextareaAutosize
            name='description'
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({ ...data, description: e.currentTarget.value })
            }
            className='w-full px-2 py-3 mb-3 text-xl text-gray-800 placeholder-gray-400 border-none resize-none focus:outline-none focus:ring-0'
            placeholder='No description provided. Click to edit.'
            value={data.description}
          />

          <div className='relative mb-6'>
            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
              <div className='w-full border-t border-gray-300' />
            </div>
          </div>
          <TextareaAutosize
            name='content'
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({ ...data, content: e.currentTarget.value })
            }
            className='w-full px-2 py-3 mb-5 text-lg text-gray-800 placeholder-gray-400 border-none resize-none focus:outline-none focus:ring-0'
            placeholder={CONTENT_PLACEHOLDER}
            value={data.content}
          />
        </div>
        <footer className='fixed inset-x-0 bottom-0 h-20 bg-white border-t border-gray-500 border-solid z-5'>
          <div className='flex items-center justify-between h-full max-w-screen-xl px-10 mx-auto sm:px-20'>
            <div className='text-sm'>
              <strong>
                <p>{post?.published ? 'Published' : 'Draft'}</p>
              </strong>
              <p>{savedState}</p>
            </div>
            <button
              onClick={async () => {
                await publish();
              }}
              title={
                disabled ? 'Post must have a title, description, and content to be published.' : 'Publish'
              }
              disabled={disabled}
              className={`${
                disabled
                  ? 'cursor-not-allowed bg-gray-300 border-gray-300'
                  : 'bg-black hover:bg-white hover:text-black border-black'
              } mx-2 w-32 h-12 text-lg text-white border-2 focus:outline-none transition-all ease-in-out duration-150`}
            >
              {publishing ? <LoadingDots /> : 'Publish  →'}
            </button>
          </div>
        </footer>
      </Layout>
    </>
  );
}
