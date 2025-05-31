// components/AdminRouteGuard.js
'use client'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { routes } from '@/config/routes'
import { Loader } from 'lucide-react'

export default function AdminRouteGuard({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isAdminRoute = routes.admin.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute) {
      if (status === 'unauthenticated') {
        router.push('/login')
      } else if (status === 'authenticated' && session.user.role !== 'Admin') {
        router.push('/unauthorized')
      }
    }
  }, [status, session, router, pathname])

  if (routes.admin.some(route => pathname.startsWith(route))) {
    if (status !== 'authenticated' || session?.user?.role !== 'Admin') {
      return  <div className="flex justify-center items-center py-16">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
    }
  }

  return children
}