import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { HttpMethod } from '@/types';

import { createPost, deletePost, getPost, updatePost } from '@/libraries/api';

import { authOptions } from './auth/[...nextauth]';

export default async function post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.GET:
      return getPost(req, res, session);
    case HttpMethod.POST:
      return createPost(req, res);
    case HttpMethod.DELETE:
      return deletePost(req, res);
    case HttpMethod.PUT:
      return updatePost(req, res);
    default:
      res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST, HttpMethod.DELETE, HttpMethod.PUT]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
