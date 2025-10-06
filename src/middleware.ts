import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle the root path behavior as requested
  if (pathname === '/') {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      const url = new URL('/dashboard', request.url)
      return NextResponse.redirect(url)
    }

    const url = new URL('/auth/login', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}


