import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  user: null, // Will be set after authentication
  loading: {
    auth: false,
    enrichment: false,
    scoring: false,
    cadences: false
  },
  crmRecords: [
    {
      id: 1,
      name: 'John Smith',
      company: 'Tech Startup Inc',
      email: 'john@techstartup.com',
      phone: '+1-555-0123',
      linkedinProfile: 'https://linkedin.com/in/johnsmith',
      leadScore: 85,
      status: 'qualified',
      lastContacted: '2024-01-20',
      enrichedData: { industry: 'Technology', employees: '50-100' }
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Marketing Pro LLC',
      email: 'sarah@marketingpro.com',
      phone: null,
      linkedinProfile: null,
      leadScore: 72,
      status: 'new',
      lastContacted: null,
      enrichedData: { industry: 'Marketing', employees: '10-25' }
    },
    {
      id: 3,
      name: 'Mike Chen',
      company: 'DataFlow Systems',
      email: 'mike@dataflow.com',
      phone: '+1-555-0456',
      linkedinProfile: 'https://linkedin.com/in/mikechen',
      leadScore: 91,
      status: 'hot',
      lastContacted: '2024-01-19',
      enrichedData: { industry: 'Software', employees: '100-250' }
    }
  ],
  enrichmentJobs: [
    {
      id: 1,
      status: 'completed',
      recordsProcessed: 150,
      recordsEnriched: 127,
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      status: 'running',
      recordsProcessed: 45,
      recordsEnriched: 38,
      createdAt: '2024-01-21T14:15:00Z'
    }
  ],
  followUpCadences: [
    {
      id: 1,
      name: 'New Lead Welcome Series',
      triggerCondition: 'status = new',
      steps: [
        { id: 1, type: 'email', content: 'Welcome email', delayDays: 0 },
        { id: 2, type: 'email', content: 'Follow-up #1', delayDays: 3 },
        { id: 3, type: 'task', content: 'Personal outreach', delayDays: 7 }
      ]
    },
    {
      id: 2,
      name: 'Hot Lead Pursuit',
      triggerCondition: 'leadScore > 80',
      steps: [
        { id: 1, type: 'task', content: 'Call within 24hrs', delayDays: 0 },
        { id: 2, type: 'email', content: 'Proposal follow-up', delayDays: 2 }
      ]
    }
  ]
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      }
    case 'CLEAR_USER':
      return {
        ...state,
        user: null
      }
    case 'UPDATE_CRM_RECORD':
      return {
        ...state,
        crmRecords: state.crmRecords.map(record =>
          record.id === action.payload.id ? { ...record, ...action.payload } : record
        )
      }
    case 'ADD_CRM_RECORD':
      return {
        ...state,
        crmRecords: [...state.crmRecords, action.payload]
      }
    case 'SET_CRM_RECORDS':
      return {
        ...state,
        crmRecords: action.payload
      }
    case 'DELETE_CRM_RECORD':
      return {
        ...state,
        crmRecords: state.crmRecords.filter(record => record.id !== action.payload)
      }
    case 'START_ENRICHMENT_JOB':
      return {
        ...state,
        enrichmentJobs: [...state.enrichmentJobs, action.payload]
      }
    case 'UPDATE_ENRICHMENT_JOB':
      return {
        ...state,
        enrichmentJobs: state.enrichmentJobs.map(job =>
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        )
      }
    case 'SET_ENRICHMENT_JOBS':
      return {
        ...state,
        enrichmentJobs: action.payload
      }
    case 'ADD_FOLLOW_UP_CADENCE':
      return {
        ...state,
        followUpCadences: [...state.followUpCadences, action.payload]
      }
    case 'UPDATE_FOLLOW_UP_CADENCE':
      return {
        ...state,
        followUpCadences: state.followUpCadences.map(cadence =>
          cadence.id === action.payload.id ? { ...cadence, ...action.payload } : cadence
        )
      }
    case 'DELETE_FOLLOW_UP_CADENCE':
      return {
        ...state,
        followUpCadences: state.followUpCadences.filter(cadence => cadence.id !== action.payload)
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const value = {
    ...state,
    dispatch
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
