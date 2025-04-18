// src/composables/useApiOperation.js
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

/**
 * Composable for handling common API operations
 * Provides a consistent way to handle loading states, errors, and toast notifications
 * @returns {Object} - API operation handler functions
 */
export function useApiOperation() {
  const toast = useToast()

  /**
   * Perform an API operation with consistent loading state and error handling
   * @param {Function} operation - Async function that performs the API call
   * @param {Object} options - Operation options
   * @param {Ref} options.loadingRef - Loading state ref
   * @param {Ref} options.errorRef - Error state ref
   * @param {string} options.errorMessage - User-friendly error message
   * @param {string} options.successMessage - Success message to display (optional)
   * @param {Function} options.onSuccess - Callback for successful operation (optional)
   * @param {Function} options.onError - Callback for failed operation (optional)
   * @returns {Promise<any>} - Result of the operation
   */
  const performOperation = async (operation, options) => {
    const {
      loadingRef,
      errorRef,
      errorMessage = 'Operation failed',
      successMessage,
      onSuccess,
      onError
    } = options

    // Set loading state
    if (loadingRef) loadingRef.value = true
    if (errorRef) errorRef.value = null

    try {
      // Perform the operation
      const response = await operation()
      
      // Skip loading indicator immediately if response is from cache
      if (response?.fromCache && loadingRef) {
        loadingRef.value = false
      }

      // Show success toast if provided (only for non-cache responses)
      if (successMessage && !response?.fromCache) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: successMessage,
          life: 3000
        })
      }

      // Call success callback if provided
      if (onSuccess) {
        return onSuccess(response)
      }

      return response
    } catch (err) {
      console.error(`Error: ${errorMessage}`, err)

      // Set error state
      if (errorRef) {
        errorRef.value = errorMessage
      }

      // Show error toast
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      })

      // Call error callback if provided
      if (onError) {
        return onError(err)
      }

      // Return a default value or rethrow
      return null
    } finally {
      // Reset loading state if not already done for cached responses
      // Only modify loading state if it exists and we're not dealing with a cached response
      if (loadingRef) {
        loadingRef.value = false
      }
    }
  }

  /**
   * Perform a create operation with consistent handling
   * @param {Function} operation - Create operation function
   * @param {Object} options - Operation options
   * @param {string} options.entityName - Name of entity being created
   * @param {string} options.entityIdentifier - Identifier field of entity (e.g., 'code', 'name')
   * @returns {Promise<any>} - Created entity
   */
  const performCreate = async (operation, options) => {
    const {
      entityName = 'item',
      entityIdentifier,
      ...restOptions
    } = options

    return performOperation(operation, {
      successMessage: entityIdentifier 
        ? `${entityName} ${entityIdentifier} has been created`
        : `${entityName} has been created`,
      ...restOptions
    })
  }

  /**
   * Perform an update operation with consistent handling
   * @param {Function} operation - Update operation function
   * @param {Object} options - Operation options
   * @param {string} options.entityName - Name of entity being updated
   * @param {string} options.entityIdentifier - Identifier field of entity (e.g., 'code', 'name')
   * @returns {Promise<any>} - Updated entity
   */
  const performUpdate = async (operation, options) => {
    const {
      entityName = 'item',
      entityIdentifier,
      ...restOptions
    } = options

    return performOperation(operation, {
      successMessage: entityIdentifier 
        ? `${entityName} ${entityIdentifier} has been updated`
        : `${entityName} has been updated`,
      ...restOptions
    })
  }

  /**
   * Perform a delete operation with consistent handling
   * @param {Function} operation - Delete operation function
   * @param {Object} options - Operation options
   * @param {string} options.entityName - Name of entity being deleted
   * @param {string} options.entityIdentifier - Identifier field of entity (e.g., 'code', 'name')
   * @returns {Promise<boolean>} - Success status
   */
  const performDelete = async (operation, options) => {
    const {
      entityName = 'item',
      entityIdentifier,
      ...restOptions
    } = options

    return performOperation(operation, {
      successMessage: entityIdentifier 
        ? `${entityName} ${entityIdentifier} has been deleted`
        : `${entityName} has been deleted`,
      onSuccess: () => true,
      ...restOptions
    })
  }

  return {
    performOperation,
    performCreate,
    performUpdate,
    performDelete
  }
}
