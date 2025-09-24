import { supabase, SUPABASE_CONFIGURED } from '../supabase/client'

// Import mock implementations
import {
  type Find,
  type Loss,
  type CreateFindData,
  type CreateLossData
} from './mock-finds-losses'

import { sendCommunityNotification as sharedSendNotification } from './shared-notifications'
import { findPotentialMatches, createMatchNotifications } from './auto-matching'

// Re-export types from mock implementation
export type { Find, Loss, CreateFindData, CreateLossData }

// Find operations
export const createFind = async (findData: CreateFindData) => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }

  try {
    // Resolve authenticated user and ensure RLS-compatible IDs are set
    // Prefer the currently authenticated Supabase user id.
    const { data: authUser } = await supabase.auth.getUser()

    // Prepare the data for insertion
    const insertData: any = {
      item_name: findData.item_name,
      description: findData.item_description || findData.description,
      category: findData.category || 'other',
      location_found: findData.location_found,
      date_found: findData.date_found,
      contact_info: findData.contact_info ? JSON.stringify(findData.contact_info) : '{}',
      // Align with DB constraint: 'available' | 'claimed' | 'returned' | 'pending'
      status: 'available'
    }

    // Add user identification for RLS
    // If caller passed a user id, keep it. Otherwise use the authenticated user's id.
    const providedUserId = (findData as any)?.user_id || (findData as any)?.finder_id
    const effectiveUserId = providedUserId || authUser?.user?.id

    if (effectiveUserId) {
      insertData.finder_id = effectiveUserId
      // Keep user_id as well for compatibility with existing queries
      insertData.user_id = effectiveUserId
    }

    const { data, error } = await supabase
      .from('finds')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    console.error('Error creating find:', error)
    throw error
  }
}

export const getUserFinds = async (userId: number) => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Cannot fetch user finds.')
  }

  try {
    let { data, error } = await supabase
      .from('finds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      const msg = error?.message || ''
      if (msg.includes('user_id') || msg.includes('column "user_id"')) {
        const retry = await supabase
          .from('finds')
          .select('*')
          .eq('finder_id', userId)
          .order('created_at', { ascending: false })

        if (retry.error) {
          throw retry.error
        }

        return { data: retry.data, error: null }
      }
      throw error
    }

    return { data, error: null }
  } catch (error) {
    throw error
  }
}

export const getAllFinds = async () => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Cannot fetch finds.')
  }

  try {
    const { data, error } = await supabase
      .from('finds')
      .select('*')
      // Only show currently available finds
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    throw error
  }
}

// Loss operations
export const createLoss = async (lossData: CreateLossData) => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }

  let result
  try {
    const { data, error } = await supabase
      .from('losses')
      .insert([lossData])
      .select()
      .single()

    if (error) {
      throw error
    }

    result = { data, error: null }
  } catch (error: any) {
    // Retry with loser_id/owner_id schema variants
    const msg: string = error?.message || ''
    const variants = ['loser_id', 'owner_id']
    if (variants.some(v => msg.includes(v))) {
      const insertData: any = { ...lossData }
      if (typeof (insertData as any).user_id !== 'undefined') {
        // Try loser_id first, then owner_id
        for (const col of variants) {
          const alt = { ...insertData, [col]: (insertData as any).user_id }
          delete (alt as any).user_id
          const retry = await supabase
            .from('losses')
            .insert([alt])
            .select()
            .single()
          if (!retry.error) {
            result = { data: retry.data, error: null }
            break
          }
        }

        if (!result) {
          throw error
        }
      } else {
        throw error
      }
    } else {
      throw error
    }
  }

  // Trigger automatic matching if loss was created successfully
  if (result.data && !result.error) {
    try {
      console.log('🔍 Starting automatic matching for new loss...')
      const { data: finds } = await getAllFinds()
      
      if (finds && finds.length > 0) {
        let totalMatches = 0
        
        // Check against all existing finds
        for (const find of finds) {
          // Skip if same user
          if (find.user_id === result.data.user_id) continue
          
          // Skip if find is not available
          if (find.status !== 'available') continue
          
          const matches = await findPotentialMatches(find)
          const relevantMatches = matches.filter(match => match.lossId === result.data.id)
          
          if (relevantMatches.length > 0) {
            totalMatches += relevantMatches.length
            await createMatchNotifications(find, relevantMatches)
          }
        }
        
        if (totalMatches > 0) {
          console.log(`🎯 Found ${totalMatches} potential matches for your lost item!`)
        } else {
          console.log('No potential matches found for your lost item.')
        }
      }
    } catch (error) {
      console.error('Error in automatic matching for loss:', error)
    }
  }

  return result
}

export const getUserLosses = async (userId: number) => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Cannot fetch user losses.')
  }

  try {
    const { data, error } = await supabase
      .from('losses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    throw error
  }
}

export const getAllLosses = async () => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Cannot fetch losses.')
  }

  try {
    const { data, error } = await supabase
      .from('losses')
      .select(`
        *,
        users!losses_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    throw error
  }
}

// Image upload for finds
export const uploadFindImage = async (file: File, findId: number) => {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured. Cannot upload images.')
  }

  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `find-${findId}-${Date.now()}.${fileExt}`
    
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

    // Update find's image_url in database
    const { data, error } = await supabase
      .from('finds')
      .update({ image_url: publicUrl })
      .eq('id', findId)
      .select()
      .single()
    
    if (error) {
      throw error
    }

    return { data: publicUrl, error: null }
  } catch (error) {
    throw error
  }
}

// Notification system
export const sendCommunityNotification = async (notificationData: any) => {
  // Always use shared notification system for cross-user notifications
  return await sharedSendNotification(notificationData)
}
