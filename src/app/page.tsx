'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LoginPage from './auth/login/page'

export default function Home() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/dashboard/admin')
      } else if (user.role === 'store') {
        router.push('/dashboard/store')
      } else if (user.role === 'employee') {
        router.push('/dashboard/employee')
      }
    }
  }, [user, router])

  return user ? null : <LoginPage />
}
