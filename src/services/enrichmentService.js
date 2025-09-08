// Data Enrichment Service
import { supabase } from '../config/api'
import { openai } from '../config/api'

export class EnrichmentService {
  // Start enrichment job
  static async startEnrichmentJob(userId, records) {
    try {
      // Create enrichment job record
      const { data: job, error: jobError } = await supabase
        .from('enrichment_jobs')
        .insert([
          {
            user_id: userId,
            status: 'running',
            records_processed: 0,
            records_enriched: 0,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (jobError) throw jobError

      // Process records in batches
      const batchSize = 10
      let processedCount = 0
      let enrichedCount = 0

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        for (const record of batch) {
          try {
            const enrichedData = await this.enrichRecord(record)
            
            // Update CRM record with enriched data
            await supabase
              .from('crm_records')
              .update({
                ...enrichedData,
                updated_at: new Date().toISOString()
              })
              .eq('id', record.id)

            enrichedCount++
          } catch (error) {
            console.error(`Failed to enrich record ${record.id}:`, error)
          }
          
          processedCount++
          
          // Update job progress
          await supabase
            .from('enrichment_jobs')
            .update({
              records_processed: processedCount,
              records_enriched: enrichedCount
            })
            .eq('id', job.id)
        }
      }

      // Mark job as completed
      await supabase
        .from('enrichment_jobs')
        .update({
          status: 'completed',
          records_processed: processedCount,
          records_enriched: enrichedCount
        })
        .eq('id', job.id)

      return { job, error: null }
    } catch (error) {
      console.error('Enrichment job error:', error)
      return { job: null, error: error.message }
    }
  }

  // Enrich a single record
  static async enrichRecord(record) {
    try {
      const enrichedData = { ...record }

      // Enrich email if missing
      if (!record.email && record.name && record.company) {
        enrichedData.email = await this.findEmail(record.name, record.company)
      }

      // Enrich phone if missing
      if (!record.phone && record.company) {
        enrichedData.phone = await this.findPhone(record.company)
      }

      // Enrich LinkedIn profile if missing
      if (!record.linkedin_profile && record.name) {
        enrichedData.linkedin_profile = await this.findLinkedInProfile(record.name, record.company)
      }

      // Enrich company data
      if (record.company) {
        const companyData = await this.enrichCompanyData(record.company)
        enrichedData.enriched_data = {
          ...record.enriched_data,
          ...companyData
        }
      }

      return enrichedData
    } catch (error) {
      console.error('Record enrichment error:', error)
      throw error
    }
  }

  // Find email address (mock implementation)
  static async findEmail(name, company) {
    // In a real implementation, this would call external APIs like Hunter.io, Clearbit, etc.
    const firstName = name.split(' ')[0].toLowerCase()
    const lastName = name.split(' ')[1]?.toLowerCase() || ''
    const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
    
    // Common email patterns
    const patterns = [
      `${firstName}.${lastName}@${domain}`,
      `${firstName}${lastName}@${domain}`,
      `${firstName}@${domain}`,
      `${firstName[0]}${lastName}@${domain}`
    ]

    // Return the most likely pattern (in real implementation, verify with API)
    return patterns[0]
  }

  // Find phone number (mock implementation)
  static async findPhone(company) {
    // In a real implementation, this would call external APIs
    const areaCode = Math.floor(Math.random() * 900) + 100
    const exchange = Math.floor(Math.random() * 900) + 100
    const number = Math.floor(Math.random() * 9000) + 1000
    
    return `+1-${areaCode}-${exchange}-${number}`
  }

  // Find LinkedIn profile (mock implementation)
  static async findLinkedInProfile(name, company) {
    // In a real implementation, this would use LinkedIn API or web scraping
    const firstName = name.split(' ')[0].toLowerCase()
    const lastName = name.split(' ')[1]?.toLowerCase() || ''
    
    return `https://linkedin.com/in/${firstName}-${lastName}`
  }

  // Enrich company data using OpenAI
  static async enrichCompanyData(companyName) {
    try {
      const prompt = `Provide information about the company "${companyName}" in JSON format with the following fields: industry, employees (range like "50-100"), revenue (range), description (brief), website. If you don't know specific information, provide reasonable estimates based on the company name.`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence assistant that provides company information in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        try {
          return JSON.parse(content)
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError)
          return this.getDefaultCompanyData(companyName)
        }
      }

      return this.getDefaultCompanyData(companyName)
    } catch (error) {
      console.error('OpenAI enrichment error:', error)
      return this.getDefaultCompanyData(companyName)
    }
  }

  // Get default company data when API fails
  static getDefaultCompanyData(companyName) {
    return {
      industry: 'Technology',
      employees: '10-50',
      revenue: 'Unknown',
      description: `${companyName} is a company in the technology sector.`,
      website: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    }
  }

  // Get enrichment job status
  static async getEnrichmentJob(jobId) {
    try {
      const { data, error } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get enrichment job error:', error)
      return { data: null, error: error.message }
    }
  }

  // Get user's enrichment jobs
  static async getUserEnrichmentJobs(userId) {
    try {
      const { data, error } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user enrichment jobs error:', error)
      return { data: null, error: error.message }
    }
  }

  // Parse CSV file
  static async parseCSVFile(file) {
    return new Promise((resolve, reject) => {
      const Papa = require('papaparse')
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('CSV parsing failed: ' + results.errors[0].message))
          } else {
            resolve(results.data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  // Validate CSV data structure
  static validateCSVData(data) {
    const requiredFields = ['name', 'company']
    const optionalFields = ['email', 'phone', 'linkedin_profile']
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('CSV file is empty or invalid')
    }

    const firstRow = data[0]
    const missingFields = requiredFields.filter(field => !(field in firstRow))
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    return true
  }
}
