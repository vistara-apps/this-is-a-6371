// API Configuration for Enrichly
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { loadStripe } from '@stripe/stripe-js'

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// OpenAI Configuration
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-key'

export const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

// Stripe Configuration
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your-key'

export const stripe = loadStripe(stripePublishableKey)

// API Endpoints
export const API_ENDPOINTS = {
  // Supabase endpoints are handled by the client
  SUPABASE_URL: supabaseUrl,
  
  // OpenAI endpoints
  OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
  OPENAI_EMBEDDINGS: 'https://api.openai.com/v1/embeddings',
  
  // Stripe endpoints
  STRIPE_CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
  STRIPE_CREATE_SUBSCRIPTION: '/api/stripe/create-subscription',
  
  // Data enrichment services (mock endpoints for demo)
  ENRICH_CONTACT: '/api/enrich/contact',
  ENRICH_COMPANY: '/api/enrich/company'
}

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ]
  
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    console.warn('The app will use mock data for missing integrations')
  }
  
  return missing.length === 0
}
