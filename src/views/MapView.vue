<!-- src/views/MapView.vue - Fixed inject() usage -->
<template>
  <div>
    <PageHeader 
      title="Locations Map" 
      subtitle="Global view of all edge installations and locations"
    />
    
    <div class="card map-container">
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-xl font-semibold">Map Filters</h2>
        
        <div class="flex flex-col sm:flex-row gap-2">
          <!-- Edge Filter -->
          <Dropdown
            v-model="selectedEdge"
            :options="edges"
            optionLabel="name"
            optionValue="id"
            placeholder="All Edges"
            class="w-full sm:w-auto"
            @change="filterLocations"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                {{ getEdgeName(slotProps.value) }}
              </div>
              <div v-else>All Edges</div>
            </template>
          </Dropdown>
          
          <!-- Location Type Filter -->
          <Dropdown
            v-model="selectedLocationType"
            :options="locationTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="All Types"
            class="w-full sm:w-auto"
            @change="filterLocations"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                {{ getLocationTypeName(slotProps.value) }}
              </div>
              <div v-else>All Types</div>
            </template>
          </Dropdown>
          
          <!-- Reset Filters Button -->
          <Button
            label="Reset Filters"
            icon="pi pi-filter-slash"
            class="p-button-outlined"
            @click="resetFilters"
          />
        </div>
      </div>
      
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <ProgressSpinner strokeWidth="4" />
      </div>
      
      <!-- Global Map -->
      <div v-else class="global-map-container" :class="{'sidebar-open': injectedSidebarOpen}">
        <GlobalMap
          :locations="filteredLocations"
          :edges="edges"
          @location-click="navigateToLocation"
          ref="mapRef"
        />
      </div>
      
      <!-- Location Listing -->
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Locations ({{ filteredLocations.length }})</h2>
        <DataTable
          :items="filteredLocations"
          :columns="columns"
          :searchable="true"
          :searchFields="['code', 'name', 'path', 'expand.edge_id.code']"
          empty-message="No locations found"
          @row-click="navigateToLocation"
          :paginated="true"
          :rows="5"
        >
          <!-- Code column with custom formatting -->
          <template #code-body="{ data }">
            <div class="font-medium text-primary-700">{{ data.code }}</div>
          </template>
          
          <!-- Type column with badge -->
          <template #type-body="{ data }">
            <span 
              class="px-2 py-1 text-xs rounded-full font-medium"
              :class="getTypeClass(data.type)"
            >
              {{ getTypeName(data.type) }}
            </span>
          </template>
          
          <!-- Edge column with code -->
          <template #edge_id-body="{ data }">
            <router-link 
              v-if="data.expand && data.expand.edge_id"
              :to="{ name: 'edge-detail', params: { id: data.edge_id } }"
              class="text-primary-600 hover:underline flex items-center"
              @click.stop
            >
              {{ data.expand.edge_id.code }}
            </router-link>
            <span v-else class="text-gray-500">Unknown Edge</span>
          </template>
          
          <!-- Actions column -->
          <template #actions="{ data }">
            <div class="flex gap-1 justify-center">
              <Button 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-text p-button-sm" 
                @click.stop="navigateToLocation(data)"
                tooltip="View"
                tooltipOptions="{ position: 'top' }"
              />
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, inject } from 'vue'
import { useRouter } from 'vue-router'
import { locationService, locationTypes } from '../services/location'
import { edgeService } from '../services/edge'
import PageHeader from '../components/common/PageHeader.vue'
import GlobalMap from '../components/map/GlobalMap.vue'
import DataTable from '../components/common/DataTable.vue'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const mapRef = ref(null);

// Data
const locations = ref([])
const edges = ref([])
const loading = ref(true)
const selectedEdge = ref(null)
const selectedLocationType = ref(null)
const resizeObserver = ref(null)

// FIXED: Properly inject sidebar state (call inject directly in setup)
// First inject the sidebarOpen state
const injectedSidebarOpen = inject('sidebarOpen', ref(false))
// Then inject the methods
const toggleSidebar = inject('toggleSidebar', () => {})
const closeSidebar = inject('closeSidebar', () => {})

// Watch for sidebar state changes to update the map
watch(injectedSidebarOpen, () => {
  if (mapRef.value) {
    // Handle map resize when sidebar state changes, with a delay
    setTimeout(() => {
      if (mapRef.value.$el) {
        // Force redraw of map when sidebar changes
        try {
          const event = new Event('resize')
          window.dispatchEvent(event)
        } catch (err) {
          console.warn('Error dispatching resize event:', err)
        }
      }
    }, 400) // Wait for animation to complete
  }
})

// Table columns definition
const columns = [
  { field: 'code', header: 'Code', sortable: true },
  { field: 'name', header: 'Name', sortable: true },
  { field: 'type', header: 'Type', sortable: true },
  { field: 'edge_id', header: 'Edge', sortable: true },
  { field: 'actions', header: 'Actions', sortable: false }
]

// Filtered locations based on selected filters
const filteredLocations = computed(() => {
  let result = [...locations.value]
  
  // Filter by edge
  if (selectedEdge.value) {
    result = result.filter(location => location.edge_id === selectedEdge.value)
  }
  
  // Filter by location type
  if (selectedLocationType.value) {
    result = result.filter(location => location.type === selectedLocationType.value)
  }
  
  return result.filter(location => hasValidCoordinates(location))
})

// Fetch data on component mount
onMounted(async () => {
  await Promise.all([
    fetchLocations(),
    fetchEdges()
  ])
  loading.value = false
  
  // Set up resize observer to handle container resizing
  setupResizeObserver()
})

// Detect mobile device
const isMobile = ref(false)

// Update mobile status 
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth < 1024;
}

// Check initial mobile status
onMounted(() => {
  updateMobileStatus()
  window.addEventListener('resize', updateMobileStatus)
})

// Clean up
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileStatus)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
  
  // Remove any global event listeners
  window.removeEventListener('resize', () => {
    if (mapRef.value && mapRef.value.$el) {
      mapRef.value.$el.dispatchEvent(new Event('resize'));
    }
  });
})

// Set up resize observer
const setupResizeObserver = () => {
  // If ResizeObserver is available, use it to detect container size changes
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver.value = new ResizeObserver(() => {
      if (mapRef.value && mapRef.value.$el) {
        const event = new Event('resize')
        window.dispatchEvent(event)
      }
    })
    
    // Start observing container
    const container = document.querySelector('.map-container')
    if (container) {
      resizeObserver.value.observe(container)
    }
  }
}

// Methods
const fetchLocations = async () => {
  try {
    const response = await locationService.getLocations({ sort: 'name', perPage: 100 })
    locations.value = response.data.items || []
    
    // Parse metadata for each location
    locations.value.forEach(location => {
      if (location.metadata && typeof location.metadata === 'string') {
        try {
          location.metadata = JSON.parse(location.metadata)
        } catch (e) {
          console.warn('Failed to parse metadata for location:', location.code)
          location.metadata = {}
        }
      }
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
  }
}

const fetchEdges = async () => {
  try {
    const response = await edgeService.getEdges({ sort: 'name' })
    edges.value = response.data.items || []
  } catch (error) {
    console.error('Error fetching edges:', error)
  }
}

const hasValidCoordinates = (location) => {
  return location.metadata && 
         location.metadata.coordinates && 
         location.metadata.coordinates.lat && 
         (location.metadata.coordinates.lng || location.metadata.coordinates.long)
}

const navigateToLocation = (location) => {
  router.push({ name: 'location-detail', params: { id: location.id } })
}

const filterLocations = () => {
  // This function is called when filters change
  // The filtering is handled by the computed property
}

const resetFilters = () => {
  selectedEdge.value = null
  selectedLocationType.value = null
}

// Helper functions
const getEdgeName = (edgeId) => {
  const edge = edges.value.find(e => e.id === edgeId)
  return edge ? edge.name : 'Unknown Edge'
}

const getTypeName = (typeCode) => {
  const type = locationTypes.find(t => t.value === typeCode)
  return type ? type.label : typeCode
}

const getLocationTypeName = (typeCode) => {
  const type = locationTypes.find(t => t.value === typeCode)
  return type ? type.label : typeCode
}

const getTypeClass = (typeCode) => {
  switch (typeCode) {
    case 'entrance': return 'bg-blue-100 text-blue-800'
    case 'work-area': return 'bg-green-100 text-green-800'
    case 'meeting-room': return 'bg-purple-100 text-purple-800'
    case 'break-area': return 'bg-amber-100 text-amber-800'
    case 'reception': return 'bg-indigo-100 text-indigo-800'
    case 'security': return 'bg-red-100 text-red-800'
    case 'server-room': return 'bg-cyan-100 text-cyan-800'
    case 'utility-room': return 'bg-teal-100 text-teal-800'
    case 'storage': return 'bg-gray-100 text-gray-800'
    case 'entrance-hall': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<style scoped>
.global-map-container {
  height: 600px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  transition: width 0.3s ease-in-out;
}

/* Add specific styling to handle sidebar interactions */
@media (max-width: 1023px) {
  .global-map-container.sidebar-open {
    /* Ensure the map stays within its container when sidebar is open */
    width: 100%;
    max-width: 100%;
  }
}
</style>
