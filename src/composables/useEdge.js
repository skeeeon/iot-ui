// src/composables/useEdge.js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import dayjs from 'dayjs'
import { edgeService, edgeRegions, edgeTypes, generateEdgeCode, validateEdgeCode } from '../services'

/**
 * Composable for edge-related functionality
 * Centralizes edge operations, formatting helpers, and navigation
 */
export function useEdge() {
  const router = useRouter()
  const toast = useToast()
  
  // Common state
  const edges = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return dayjs(dateString).format('MMM D, YYYY HH:mm')
  }
  
  /**
   * Get edge type display name
   * @param {string} typeCode - Edge type code
   * @returns {string} - Display name
   */
  const getTypeName = (typeCode) => {
    const type = edgeTypes.find(t => t.value === typeCode)
    return type ? type.label : typeCode
  }
  
  /**
   * Get edge region display name
   * @param {string} regionCode - Region code
   * @returns {string} - Display name
   */
  const getRegionName = (regionCode) => {
    const region = edgeRegions.find(r => r.value === regionCode)
    return region ? region.label : regionCode
  }
  
  /**
   * Get CSS class for edge type badge
   * @param {string} typeCode - Edge type code
   * @returns {string} - CSS class
   */
  const getTypeClass = (typeCode) => {
    switch (typeCode) {
      case 'bld': return 'bg-blue-100 text-blue-800'
      case 'dc': return 'bg-purple-100 text-purple-800'
      case 'wh': return 'bg-amber-100 text-amber-800'
      case 'camp': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  /**
   * Get CSS class for region badge
   * @param {string} regionCode - Region code
   * @returns {string} - CSS class
   */
  const getRegionClass = (regionCode) => {
    switch (regionCode) {
      case 'na': return 'bg-red-100 text-red-800'
      case 'eu': return 'bg-blue-100 text-blue-800'
      case 'ap': return 'bg-green-100 text-green-800'
      case 'sa': return 'bg-yellow-100 text-yellow-800'
      case 'af': return 'bg-orange-100 text-orange-800'
      case 'me': return 'bg-purple-100 text-purple-800'
      case 'aus': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  /**
   * Get a summary of metadata for display
   * @param {Object} metadata - Metadata object
   * @returns {string} - Summary text
   */
  const getMetadataSummary = (metadata) => {
    if (!metadata || typeof metadata !== 'object') {
      return 'No metadata'
    }
    
    const keys = Object.keys(metadata)
    if (keys.length === 0) {
      return 'Empty metadata'
    }
    
    // Display a summary of the first few keys
    const displayKeys = keys.slice(0, 2)
    const summary = displayKeys.map(key => {
      const value = metadata[key]
      return `${key}: ${typeof value === 'object' ? '{...}' : value}`
    }).join(', ')
    
    return keys.length > 2 ? `${summary}, +${keys.length - 2} more` : summary
  }
  
  /**
   * Check if an edge has metadata
   * @param {Object} edge - Edge object
   * @returns {boolean} - True if metadata exists
   */
  const hasMetadata = (edge) => {
    return edge && 
           edge.metadata && 
           typeof edge.metadata === 'object' && 
           Object.keys(edge.metadata).length > 0
  }
  
  /**
   * Fetch all edges with optional filtering
   * @param {Object} params - Optional query params
   * @returns {Promise<Array>} - List of edges
   */
  const fetchEdges = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await edgeService.getEdges({ 
        withMetadata: true,
        sort: '-created',
        ...params
      })
      edges.value = response.data.items || []
      return edges.value
    } catch (err) {
      console.error('Error fetching edges:', err)
      error.value = 'Failed to load edges. Please try again.'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load edges',
        life: 3000
      })
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch a single edge by ID
   * @param {string} id - Edge ID
   * @returns {Promise<Object>} - Edge data
   */
  const fetchEdge = async (id) => {
    if (!id) {
      error.value = 'Invalid edge ID'
      return null
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await edgeService.getEdge(id)
      return response.data
    } catch (err) {
      console.error('Error fetching edge:', err)
      error.value = 'Failed to load edge details. Please try again.'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load edge details',
        life: 3000
      })
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Delete an edge
   * @param {string} id - Edge ID
   * @param {string} code - Edge code for display
   * @returns {Promise<boolean>} - Success status
   */
  const deleteEdge = async (id, code) => {
    loading.value = true
    try {
      await edgeService.deleteEdge(id)
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Edge ${code} has been deleted`,
        life: 3000
      })
      
      return true
    } catch (error) {
      console.error('Error deleting edge:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete edge',
        life: 3000
      })
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Open Grafana dashboard for an edge
   * @param {string} edgeId - Edge ID
   */
  const openInGrafana = (edgeId) => {
    const grafanaUrl = import.meta.env.VITE_GRAFANA_URL || 'https://grafana.domain.com'
    const dashboardUrl = `${grafanaUrl}/d/edge-overview/edge-overview?var-edge_id=${edgeId}`
    window.open(dashboardUrl, '_blank')
  }
  
  // Navigation methods
  const navigateToEdgeList = () => router.push({ name: 'edges' })
  const navigateToEdgeDetail = (id) => router.push({ name: 'edge-detail', params: { id } })
  const navigateToEdgeEdit = (id) => router.push({ name: 'edit-edge', params: { id } })
  const navigateToEdgeCreate = () => router.push({ name: 'create-edge' })
  const navigateToLocations = (edgeId) => router.push({ name: 'locations', query: { edge: edgeId } })
  const navigateToThings = (edgeId) => router.push({ name: 'things', query: { edge: edgeId } })
  
  return {
    // State
    edges,
    loading,
    error,
    edgeTypes,
    edgeRegions,
    
    // Helpers
    formatDate,
    getTypeName,
    getRegionName,
    getTypeClass,
    getRegionClass,
    getMetadataSummary,
    hasMetadata,
    generateEdgeCode,
    validateEdgeCode,
    
    // Operations
    fetchEdges,
    fetchEdge,
    deleteEdge,
    openInGrafana,
    
    // Navigation
    navigateToEdgeList,
    navigateToEdgeDetail,
    navigateToEdgeEdit,
    navigateToEdgeCreate,
    navigateToLocations,
    navigateToThings
  }
}
