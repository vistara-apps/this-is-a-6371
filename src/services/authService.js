// Authentication Service using Supabase
import { supabase } from '../config/api'

export class AuthService {
  // Sign up new user
  static async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            subscription_tier: 'Free',
            ...userData
          }
        }
      })

      if (error) throw error

      // Create user profile in database
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          subscription_tier: 'Free',
          ...userData
        })
      }

      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error.message }
    }
  }

  // Sign in existing user
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, session: null, error: error.message }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: error.message }
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      console.error('Get current session error:', error)
      return { session: null, error: error.message }
    }
  }

  // Create user profile in database
  static async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...profileData
          }
        ])

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create user profile error:', error)
      return { data: null, error: error.message }
    }
  }

  // Update user profile
  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update user profile error:', error)
      return { data: null, error: error.message }
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { data: null, error: error.message }
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error.message }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
