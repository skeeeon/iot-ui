// src/services/config/configService.js

/**
 * Centralized configuration service
 * 
 * This service provides a single point of access for application configuration
 * including environment variables, API endpoints, and feature flags.
 */
class ConfigService {
  constructor() {
    // Store environment variables
    this.env = {
      // API configuration
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
      API_TIMEOUT: 30000,
      
      // NATS configuration
      MQTT_HOST: import.meta.env.VITE_MQTT_HOST || 'mqtt://localhost:1883',
      
      // External integrations
      GRAFANA_URL: import.meta.env.VITE_GRAFANA_URL || 'https://grafana.domain.com',
      
      // Feature flags
      ENABLE_MAP_FEATURES: import.meta.env.VITE_ENABLE_MAP_FEATURES === 'true'
    }
    
    // API endpoints
    this.endpoints = {
      AUTH: {
        LOGIN: '/collections/users/auth-with-password',
        REFRESH: '/collections/users/auth-refresh',
        PROFILE: '/collections/users/auth-refresh'
      },
      
      // External service endpoints
      HASH_PASSWORD: 'http://100.98.139.111:9000/sec/api/hash-password'
    }
    
    // Collection names
    this.collections = {
      EDGES: 'edges',
      LOCATIONS: 'locations',
      THINGS: 'things',
      CLIENTS: 'clients',
      TOPIC_PERMISSIONS: 'topic_permissions',
      USERS: 'users'
    }
    
    // Default pagination settings
    this.pagination = {
      DEFAULT_PAGE_SIZE: 10,
      MAX_PAGE_SIZE: 100
    }
    
    // Cache configuration
    this.cache = {
      enabled: true,
      defaultTTL: 5, // minutes
      longTTL: 60,   // minutes
      // Which collections should use long TTL
      longTTLCollections: ['edge_types', 'edge_regions', 'location_types', 'thing_types'],
      // TTL overrides for specific collections (minutes)
      ttlOverrides: {
        'audit_logs': 2,
        'dashboard': 1
      }
    }
  }
  
  /**
   * Get API base URL with appropriate prefix
   * @returns {string} - API base URL
   */
  getApiBaseUrl() {
    return this.env.API_URL
  }
  
  /**
   * Get PocketBase API endpoint URL
   * @param {string} path - API path (without /pb prefix)
   * @returns {string} - Full PocketBase API URL
   */
  getPocketBaseUrl(path) {
    return `${this.env.API_URL}/pb/api${path}`
  }
  
  /**
   * Generate a PocketBase collection endpoint URL
   * @param {string} collection - Collection name
   * @param {string} [recordId] - Optional record ID for single-record operations
   * @returns {string} - API endpoint URL
   */
  getCollectionEndpoint(collection, recordId = null) {
    const base = `/pb/api/collections/${collection}/records`
    return recordId ? `${base}/${recordId}` : base
  }
  
  /**
   * Get Grafana dashboard URL
   * @param {string} dashboard - Dashboard name
   * @param {Object} params - Dashboard parameters
   * @returns {string} - Grafana dashboard URL
   */
  getGrafanaDashboardUrl(dashboard, params = {}) {
    const baseUrl = this.env.GRAFANA_URL
    const queryParams = Object.entries(params)
      .map(([key, value]) => `var-${key}=${encodeURIComponent(value)}`)
      .join('&')
    
    return `${baseUrl}/d/${dashboard}/${dashboard}${queryParams ? '?' + queryParams : ''}`
  }
  
  /**
   * Get file URL for PocketBase file attachment
   * @param {string} collection - Collection name
   * @param {string} recordId - Record ID
   * @param {string} filename - File name
   * @returns {string} - File URL
   */
  getFileUrl(collection, recordId, filename) {
    return `${this.env.API_URL}/pb/api/files/${collection}/${recordId}/${filename}`
  }
  
  /**
   * Get TTL for a collection
   * @param {string} collectionName - Collection name
   * @param {string} operation - Operation type (list, detail, etc)
   * @returns {number} - TTL in minutes
   */
  getTTL(collectionName, operation = 'list') {
    // Types usually change less frequently, use longer cache
    if (this.cache.longTTLCollections.includes(collectionName)) {
      return this.cache.longTTL;
    }
    
    // Check for specific overrides
    if (this.cache.ttlOverrides[collectionName]) {
      return this.cache.ttlOverrides[collectionName];
    }
    
    // For detail views, cache a bit longer
    if (operation === 'detail') {
      return this.cache.defaultTTL * 2;
    }
    
    // Default TTL
    return this.cache.defaultTTL;
  }
  
  /**
   * Check if cache is enabled
   * @returns {boolean} - Whether cache is enabled
   */
  isCacheEnabled() {
    return this.cache.enabled;
  }
}

// Create singleton instance
export const configService = new ConfigService()

// Export for use in other services
export default configService
