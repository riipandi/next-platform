import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { HttpMethod } from '@/types'

import { createDomain, deleteDomain } from '@/libraries/api'

import { authOptions } from '../auth/[...nextauth]'

export default async function domain(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions)
  if (!session) return res.status(401).end()

  switch (req.method) {
    case HttpMethod.POST:
      return createDomain(req, res)
    case HttpMethod.DELETE:
      return deleteDomain(req, res)
    default:
      res.setHeader('Allow', [HttpMethod.POST, HttpMethod.DELETE])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
