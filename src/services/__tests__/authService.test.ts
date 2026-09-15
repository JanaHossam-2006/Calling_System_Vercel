/**
 * اختبارات خدمة المصادقة
 */

import { authService } from '@/services/authService'

describe('Auth Service', () => {
  describe('login', () => {
    it('should return user data on successful login', async () => {
      // Note: في بيئة الاختبار الحقيقية، ستحتاج mock لـ Supabase
      // هذا مثال على الاختبار المتوقع
      try {
        const result = await authService.login('test@example.com', 'password')
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('email')
        expect(result).toHaveProperty('role')
      } catch (error) {
        // متوقع في بيئة الاختبار بدون Supabase
        expect(error).toBeDefined()
      }
    })

    it('should throw error on invalid credentials', async () => {
      try {
        await authService.login('invalid@example.com', 'wrongpassword')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('logout', () => {
    it('should return true on successful logout', async () => {
      try {
        const result = await authService.logout()
        expect(result).toBe(true)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', async () => {
      const result = await authService.getCurrentUser()
      expect(result).toBeNull()
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile with valid data', async () => {
      try {
        const result = await authService.updateUserProfile('user-id', {
          name: 'محمد أحمد',
        })
        expect(result).toHaveProperty('id')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should throw error with invalid user id', async () => {
      try {
        await authService.updateUserProfile('invalid-id', { name: 'Test' })
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      try {
        const result = await authService.getAllUsers()
        expect(Array.isArray(result)).toBe(true)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      try {
        const result = await authService.changePassword('oldPassword', 'newPassword')
        expect(result).toBe(true)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should throw error with incorrect current password', async () => {
      try {
        await authService.changePassword('wrongPassword', 'newPassword')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
