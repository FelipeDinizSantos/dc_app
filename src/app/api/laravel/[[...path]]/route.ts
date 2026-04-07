// Proxy usado para o LARAVEL permitir minha requisição sem que seu CORS a bloqueie 

import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_URL = process.env.API_URL!

async function proxyRequest(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  const urlPath = path?.join('/') ?? ''
  const url = `${LARAVEL_URL}/${urlPath}`

  const headers: HeadersInit = { Accept: 'application/json' }
  const contentType = req.headers.get('content-type')
  if (contentType) headers['Content-Type'] = contentType
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const body = ['GET', 'HEAD'].includes(req.method) ? null : await req.text()

  const res = await fetch(url, { method: req.method, headers, body })

  const responseText = await res.text()

  return new NextResponse(responseText, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/json',
    },
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest