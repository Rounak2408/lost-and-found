import { supabase } from '../supabase/client'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  password_hash: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  avatar_url?: string
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Mock user update for when Supabase is not configured
const mockUpdateUser = async (userId: number, userData: UpdateUserData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Get current user from localStorage
    const userDataStr = localStorage.getItem('user')
    if (!userDataStr) {
      throw new Error('User not found in localStorage')
    }
    
    const currentUser = JSON.parse(userDataStr)
    
    // Update user data
    const updatedUser = {
      ...currentUser,
      ...userData,
      updated_at: new Date().toISOString()
    }
    
    // Save back to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    console.log('Mock: User updated successfully:', updatedUser)
    
    return { data: updatedUser, error: null }
  } catch (error) {
    console.error('Mock: Error updating user:', error)
    return { data: null, error }
  }
}

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  // This is a simple hash for demo purposes
  // In production, use a proper hashing library like bcrypt
  return btoa(password + 'salt')
}

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash
}

// ----- Local mock implementations when Supabase isn't configured -----
const LOCAL_STORAGE_USERS_KEY = 'mock_users'

interface LocalUserRecord {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  password_hash: string
  avatar_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const readLocalUsers = (): LocalUserRecord[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const writeLocalUsers = (users: LocalUserRecord[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users))
}

const mockCreateUser = async (userData: CreateUserData) => {
  await new Promise(r => setTimeout(r, 200))
  const users = readLocalUsers()
  if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return { data: null, error: new Error('User with this email already exists') }
  }
  const now = new Date().toISOString()
  const newUser: LocalUserRecord = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    phone: userData.phone,
    password_hash: hashPassword(userData.password),
    avatar_url: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  }
  users.push(newUser)
  writeLocalUsers(users)
  return { data: newUser as unknown as User, error: null }
}

const mockAuthenticateUser = async (email: string, password: string) => {
  await new Promise(r => setTimeout(r, 150))
  const users = readLocalUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.is_active)
  if (!user) return { data: null, error: new Error('User not found') }
  if (!verifyPassword(password, user.password_hash)) {
    return { data: null, error: new Error('Invalid password') }
  }
  const { password_hash, ...userWithoutPassword } = user
  return { data: userWithoutPassword as unknown as User, error: null }
}

export const createUser = async (userData: CreateUserData) => {
  try {
    if (!isSupabaseConfigured()) {
      return mockCreateUser(userData)
    }
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          password_hash: hashPassword(userData.password),
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    // Fallback to local mock if Supabase errors (table missing/RLS/etc.)
    console.warn('Supabase createUser failed, falling back to mock:', error)
    return mockCreateUser(userData)
  }
}

export const authenticateUser = async (email: string, password: string) => {
  try {
    if (!isSupabaseConfigured()) {
      return mockAuthenticateUser(email, password)
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error) {
      throw new Error('User not found')
    }

    if (!verifyPassword(password, data.password_hash)) {
      throw new Error('Invalid password')
    }

    // Remove password hash from returned data
    const { password_hash, ...userWithoutPassword } = data
    return { data: userWithoutPassword, error: null }
  } catch (error) {
    // Fallback to local mock on any failure
    console.warn('Supabase authenticateUser failed, falling back to mock:', error)
    return mockAuthenticateUser(email, password)
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateUser = async (userId: number, userData: UpdateUserData) => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using mock implementation for user update')
    return mockUpdateUser(userId, userData)
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Remove password hash from returned data
    const { password_hash, ...userWithoutPassword } = data
    return { data: userWithoutPassword, error: null }
  } catch (error) {
    console.error('Supabase error, falling back to mock:', error)
    return mockUpdateUser(userId, userData)
  }
}

export const uploadAvatar = async (file: File, userId: number) => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName)

    // Update user's avatar_url in database
    const { data, error } = await updateUser(userId, { avatar_url: publicUrl })
    
    if (error) {
      throw error
    }

    return { data: publicUrl, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Password reset functions
export const getUserByPhone = async (phone: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .eq('is_active', true)
      .single()

    if (error) {
      throw error
    }

    // Remove password hash from returned data
    const { password_hash, ...userWithoutPassword } = data
    return { data: userWithoutPassword, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateUserPassword = async (userId: number, newPassword: string) => {
  try {
    const hashedPassword = hashPassword(newPassword)
    
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Remove password hash from returned data
    const { password_hash, ...userWithoutPassword } = data
    return { data: userWithoutPassword, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Generate a simple verification code (for demo purposes)
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code temporarily (in a real app, use Redis or similar)
const verificationCodes = new Map<string, { code: string, userId: number, expires: number }>()

export const storeVerificationCode = (phone: string, code: string, userId: number) => {
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
  verificationCodes.set(phone, { code, userId, expires })
}

export const verifyCode = (phone: string, code: string) => {
  const stored = verificationCodes.get(phone)
  if (!stored) {
    return { valid: false, error: 'No verification code found for this phone number' }
  }
  
  if (Date.now() > stored.expires) {
    verificationCodes.delete(phone)
    return { valid: false, error: 'Verification code has expired' }
  }
  
  if (stored.code !== code) {
    return { valid: false, error: 'Invalid verification code' }
  }
  
  // Code is valid, remove it
  verificationCodes.delete(phone)
  return { valid: true, userId: stored.userId }
}
