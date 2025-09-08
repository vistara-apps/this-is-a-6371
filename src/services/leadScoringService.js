// Lead Scoring Service using OpenAI
import { openai } from '../config/api'
import { supabase } from '../config/api'

export class LeadScoringService {
  // Calculate lead score using AI
  static async calculateLeadScore(record) {
    try {
      // Prepare data for scoring
      const scoringData = {
        name: record.name,
        company: record.company,
        email: record.email,
        phone: record.phone,
        linkedinProfile: record.linkedin_profile,
        industry: record.enriched_data?.industry,
        employees: record.enriched_data?.employees,
        revenue: record.enriched_data?.revenue,
        lastContacted: record.last_contacted,
        status: record.status
      }

      // Use OpenAI to calculate intelligent lead score
      const aiScore = await this.getAILeadScore(scoringData)
      
      // Combine AI score with rule-based scoring
      const ruleBasedScore = this.getRuleBasedScore(record)
      
      // Weighted combination (70% AI, 30% rules)
      const finalScore = Math.round((aiScore * 0.7) + (ruleBasedScore * 0.3))
      
      // Ensure score is between 0-100
      return Math.max(0, Math.min(100, finalScore))
    } catch (error) {
      console.error('Lead scoring error:', error)
      // Fallback to rule-based scoring only
      return this.getRuleBasedScore(record)
    }
  }

  // Get AI-powered lead score
  static async getAILeadScore(data) {
    try {
      const prompt = `
        As a sales intelligence AI, score this lead from 0-100 based on their likelihood to convert:
        
        Lead Information:
        - Name: ${data.name || 'Unknown'}
        - Company: ${data.company || 'Unknown'}
        - Email: ${data.email ? 'Available' : 'Missing'}
        - Phone: ${data.phone ? 'Available' : 'Missing'}
        - LinkedIn: ${data.linkedinProfile ? 'Available' : 'Missing'}
        - Industry: ${data.industry || 'Unknown'}
        - Company Size: ${data.employees || 'Unknown'}
        - Revenue: ${data.revenue || 'Unknown'}
        - Last Contacted: ${data.lastContacted || 'Never'}
        - Current Status: ${data.status || 'new'}
        
        Consider factors like:
        - Data completeness (more complete = higher score)
        - Company size and industry (larger companies in tech = higher score)
        - Contact information availability
        - Engagement history
        - Industry fit for CRM solutions
        
        Respond with only a number between 0-100.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a sales intelligence AI that scores leads based on conversion probability. Respond only with a number between 0-100.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      })

      const scoreText = response.choices[0]?.message?.content?.trim()
      const score = parseInt(scoreText)
      
      if (isNaN(score) || score < 0 || score > 100) {
        throw new Error('Invalid AI score response')
      }
      
      return score
    } catch (error) {
      console.error('AI scoring error:', error)
      // Return a default score based on available data
      return this.getDefaultAIScore(data)
    }
  }

  // Rule-based scoring system
  static getRuleBasedScore(record) {
    let score = 0

    // Base score
    score += 20

    // Email availability
    if (record.email) score += 15

    // Phone availability
    if (record.phone) score += 10

    // LinkedIn profile availability
    if (record.linkedin_profile) score += 10

    // Company information
    if (record.company) score += 10

    // Enriched data availability
    if (record.enriched_data) {
      score += 5
      
      // Industry bonus
      const techIndustries = ['technology', 'software', 'saas', 'tech', 'it']
      if (record.enriched_data.industry && 
          techIndustries.some(tech => 
            record.enriched_data.industry.toLowerCase().includes(tech)
          )) {
        score += 10
      }

      // Company size bonus
      if (record.enriched_data.employees) {
        const employees = record.enriched_data.employees.toLowerCase()
        if (employees.includes('100-') || employees.includes('250+') || employees.includes('500+')) {
          score += 15
        } else if (employees.includes('50-') || employees.includes('25-')) {
          score += 10
        }
      }
    }

    // Recent contact bonus
    if (record.last_contacted) {
      const lastContact = new Date(record.last_contacted)
      const daysSinceContact = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceContact <= 7) {
        score += 10
      } else if (daysSinceContact <= 30) {
        score += 5
      }
    }

    // Status bonus
    switch (record.status) {
      case 'hot':
        score += 15
        break
      case 'qualified':
        score += 10
        break
      case 'contacted':
        score += 5
        break
      case 'new':
        score += 0
        break
      default:
        score -= 5
    }

    return Math.max(0, Math.min(100, score))
  }

  // Default AI score when API fails
  static getDefaultAIScore(data) {
    let score = 50 // Base score

    // Adjust based on data completeness
    const dataFields = [data.email, data.phone, data.linkedinProfile, data.industry, data.employees]
    const completeness = dataFields.filter(field => field).length / dataFields.length
    
    score += Math.round(completeness * 30)

    // Industry adjustment
    if (data.industry && data.industry.toLowerCase().includes('tech')) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  // Batch score multiple leads
  static async batchScoreLeads(records) {
    const results = []
    
    for (const record of records) {
      try {
        const score = await this.calculateLeadScore(record)
        results.push({
          id: record.id,
          score,
          error: null
        })
      } catch (error) {
        results.push({
          id: record.id,
          score: 0,
          error: error.message
        })
      }
    }
    
    return results
  }

  // Update lead scores in database
  static async updateLeadScores(userId, scores) {
    try {
      const updates = scores.map(({ id, score }) => ({
        id,
        lead_score: score,
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('crm_records')
        .upsert(updates, { onConflict: 'id' })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update lead scores error:', error)
      return { data: null, error: error.message }
    }
  }

  // Get lead scoring criteria explanation
  static getScoringCriteria() {
    return {
      dataCompleteness: {
        weight: 30,
        description: 'Complete contact information (email, phone, LinkedIn)',
        factors: ['Email available (+15)', 'Phone available (+10)', 'LinkedIn profile (+10)']
      },
      companyProfile: {
        weight: 25,
        description: 'Company size and industry fit',
        factors: ['Tech industry (+10)', 'Large company 100+ employees (+15)', 'Medium company 25-100 employees (+10)']
      },
      engagement: {
        weight: 20,
        description: 'Recent interaction and status',
        factors: ['Contacted within 7 days (+10)', 'Hot status (+15)', 'Qualified status (+10)']
      },
      aiAnalysis: {
        weight: 25,
        description: 'AI-powered conversion probability analysis',
        factors: ['Pattern recognition', 'Industry benchmarks', 'Historical data analysis']
      }
    }
  }

  // Get lead priority categories
  static getLeadPriority(score) {
    if (score >= 80) {
      return {
        category: 'hot',
        label: 'Hot Lead',
        color: 'red',
        action: 'Contact immediately',
        priority: 1
      }
    } else if (score >= 60) {
      return {
        category: 'warm',
        label: 'Warm Lead',
        color: 'orange',
        action: 'Contact within 24 hours',
        priority: 2
      }
    } else if (score >= 40) {
      return {
        category: 'qualified',
        label: 'Qualified Lead',
        color: 'yellow',
        action: 'Add to nurture sequence',
        priority: 3
      }
    } else {
      return {
        category: 'cold',
        label: 'Cold Lead',
        color: 'gray',
        action: 'Long-term nurture',
        priority: 4
      }
    }
  }

  // Generate lead scoring report
  static generateScoringReport(records) {
    const totalRecords = records.length
    const averageScore = records.reduce((sum, record) => sum + (record.lead_score || 0), 0) / totalRecords
    
    const distribution = {
      hot: records.filter(r => (r.lead_score || 0) >= 80).length,
      warm: records.filter(r => (r.lead_score || 0) >= 60 && (r.lead_score || 0) < 80).length,
      qualified: records.filter(r => (r.lead_score || 0) >= 40 && (r.lead_score || 0) < 60).length,
      cold: records.filter(r => (r.lead_score || 0) < 40).length
    }

    return {
      totalRecords,
      averageScore: Math.round(averageScore),
      distribution,
      recommendations: this.generateRecommendations(distribution, totalRecords)
    }
  }

  // Generate recommendations based on lead distribution
  static generateRecommendations(distribution, total) {
    const recommendations = []

    const hotPercentage = (distribution.hot / total) * 100
    const warmPercentage = (distribution.warm / total) * 100

    if (hotPercentage > 20) {
      recommendations.push({
        type: 'action',
        message: `You have ${distribution.hot} hot leads (${hotPercentage.toFixed(1)}%). Focus on immediate outreach to maximize conversions.`
      })
    }

    if (warmPercentage > 30) {
      recommendations.push({
        type: 'opportunity',
        message: `${distribution.warm} warm leads are ready for engagement. Consider automated follow-up sequences.`
      })
    }

    if (distribution.cold > total * 0.5) {
      recommendations.push({
        type: 'improvement',
        message: 'High percentage of cold leads. Consider improving data enrichment or lead qualification criteria.'
      })
    }

    return recommendations
  }
}
