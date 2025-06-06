<!-- src/components/common/AppHeader.vue -->
<template>
  <header 
    class="app-header h-16 border-b theme-transition shadow-sm fixed top-0 left-0 right-0 z-40
           bg-surface-primary dark:bg-surface-primary-dark border-border-primary dark:border-border-primary-dark"
  >
    <div class="flex items-center justify-between h-full px-4 w-full">
      <!-- Left section - Contains logo (desktop) and mobile menu button -->
      <div class="flex items-center">
        <!-- Mobile menu button - hidden on desktop -->
        <button 
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-md text-content-secondary dark:text-gray-300 focus-ring mobile-menu-button hidden"
          :class="{'block lg:!hidden': true}"
          aria-label="Toggle navigation menu"
        >
          <i class="pi pi-bars"></i>
        </button>
        
        <!-- Logo & Title - Hidden on mobile, visible on desktop and aligned left -->
        <router-link 
          to="/" 
          class="hidden lg:flex items-center space-x-2 ml-1"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-md text-primary-600 dark:text-primary-400">
            <!-- Custom SVG Logo -->
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 256 256" 
              class="logo-image"
              aria-label="Company Logo"
            >
              <path 
                d="M 128,0 C 57.343,0 0,57.343 0,128 C 0,198.657 57.343,256 128,256 C 198.657,256 256,198.657 256,128 C 256,57.343 198.657,0 128,0 z M 128,28 C 181.423,28 224.757,71.334 224.757,124.757 C 224.757,139.486 221.04,153.32 214.356,165.42 C 198.756,148.231 178.567,138.124 162.876,124.331 C 155.723,124.214 128.543,124.043 113.254,124.043 C 113.254,147.334 113.254,172.064 113.254,190.513 C 100.456,179.347 94.543,156.243 94.543,156.243 C 83.432,147.065 31.243,124.757 31.243,124.757 C 31.243,71.334 74.577,28 128,28 z" 
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 class="text-xl font-semibold whitespace-nowrap text-content-primary dark:text-content-primary-dark">Stone-Age.io</h1>
        </router-link>
      </div>
      
      <!-- Center section - Logo only (mobile view) - Hidden on desktop -->
      <div class="flex lg:hidden items-center justify-center absolute left-1/2 transform -translate-x-1/2">
        <router-link to="/" class="flex items-center">
          <div class="w-8 h-8 flex items-center justify-center rounded-md text-primary-600 dark:text-primary-400">
            <!-- Custom SVG Logo -->
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 256 256" 
              class="logo-image"
              aria-label="Company Logo"
            >
              <path 
                d="M 128,0 C 57.343,0 0,57.343 0,128 C 0,198.657 57.343,256 128,256 C 198.657,256 256,198.657 256,128 C 256,57.343 198.657,0 128,0 z M 128,28 C 181.423,28 224.757,71.334 224.757,124.757 C 224.757,139.486 221.04,153.32 214.356,165.42 C 198.756,148.231 178.567,138.124 162.876,124.331 C 155.723,124.214 128.543,124.043 113.254,124.043 C 113.254,147.334 113.254,172.064 113.254,190.513 C 100.456,179.347 94.543,156.243 94.543,156.243 C 83.432,147.065 31.243,124.757 31.243,124.757 C 31.243,71.334 74.577,28 128,28 z" 
                fill="currentColor"
              />
            </svg>
          </div>
        </router-link>
      </div>
      
      <!-- Right section - Actions Menu and User Menu -->
      <div class="flex items-center space-x-1">
        <!-- Header Actions (combines Cache Control and Theme Toggle) -->
        <HeaderActions :collection-name="currentCollectionName" />
        
        <!-- User Menu -->
        <div class="relative">
          <!-- Button to toggle menu -->
          <button 
            @click="toggleUserMenu"
            class="user-menu-button flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full cursor-pointer"
            aria-haspopup="true"
            :aria-expanded="isUserMenuOpen ? 'true' : 'false'"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-semibold
                     bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
            >
              {{ userInitials }}
            </div>
            <span class="hidden sm:inline-block ml-2 text-content-primary dark:text-content-primary-dark">{{ userFullName }}</span>
            <i class="pi pi-angle-down ml-1 hidden sm:block dark:text-gray-300"></i>
          </button>
          
          <!-- User Menu Dropdown - Now with Tailwind-first approach -->
          <div 
            v-show="isUserMenuOpen"
            class="absolute right-0 top-[calc(100%+0.5rem)] w-[200px] rounded-md border z-50 shadow-theme-md
                   bg-surface-primary dark:bg-surface-primary-dark 
                   border-border-primary dark:border-border-primary-dark
                   dropdown-animation"
            ref="userMenuDropdown"
          >
            <div class="py-1" role="menu">
              <router-link 
                to="/profile" 
                class="flex items-center px-4 py-2 text-content-primary dark:text-content-primary-dark 
                       hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors" 
                role="menuitem"
                @click="closeUserMenu"
              >
                <i class="pi pi-user mr-3 text-content-secondary dark:text-content-secondary-dark"></i>
                <span>Profile</span>
              </router-link>
              
              <router-link 
                to="/settings" 
                class="flex items-center px-4 py-2 text-content-primary dark:text-content-primary-dark 
                       hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors" 
                role="menuitem"
                @click="closeUserMenu"
              >
                <i class="pi pi-cog mr-3 text-content-secondary dark:text-content-secondary-dark"></i>
                <span>Settings</span>
              </router-link>
              
              <div class="border-t border-border-secondary dark:border-border-secondary-dark my-1"></div>
              
              <button 
                class="flex w-full items-center px-4 py-2 text-left text-content-primary dark:text-content-primary-dark 
                       hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
                role="menuitem"
                @click="handleLogout"
              >
                <i class="pi pi-sign-out mr-3 text-content-secondary dark:text-content-secondary-dark"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Backdrop overlay that closes the menu when clicking outside -->
  <div 
    v-if="isUserMenuOpen"
    class="fixed inset-0 z-30 bg-transparent"
    @click="closeUserMenu"
  ></div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import HeaderActions from './HeaderActions.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)
const userMenuDropdown = ref(null)

// User info from the auth store
const userFullName = computed(() => authStore.userFullName)
const userInitials = computed(() => authStore.userInitials)

// Get the current collection name based on route
const currentCollectionName = computed(() => {
  const path = route.path
  
  // Extract collection name from route path
  if (path.includes('/edges')) return 'edges'
  if (path.includes('/locations')) return 'locations'
  if (path.includes('/things')) return 'things'
  if (path.includes('/clients')) return 'clients'
  if (path.includes('/permissions')) return 'topic_permissions'
  
  // Handle type routes
  if (path.includes('/types/edge-types')) return 'edge_types'
  if (path.includes('/types/edge-regions')) return 'edge_regions'
  if (path.includes('/types/location-types')) return 'location_types'
  if (path.includes('/types/thing-types')) return 'thing_types'
  
  return null
})

// Props and emits
defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])

// Toggle user menu
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

// Close user menu
const closeUserMenu = () => {
  isUserMenuOpen.value = false;
}

// Handle logout action
const handleLogout = () => {
  closeUserMenu();
  authStore.logout();
}

// Close menu on escape key
const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && isUserMenuOpen.value) {
    closeUserMenu();
  }
}

// Handle click outside to close menu, but not when clicking menu items
const handleClickOutside = (event) => {
  // Close only if user menu is open and click is outside both the button and dropdown
  if (isUserMenuOpen.value && userMenuDropdown.value) {
    const dropdown = userMenuDropdown.value;
    const isClickInsideDropdown = dropdown.contains(event.target);
    const isClickInsideButton = event.target.closest('.user-menu-button');
    
    if (!isClickInsideDropdown && !isClickInsideButton) {
      closeUserMenu();
    }
  }
}

// Handle mobile menu visibility on resize
const handleResize = () => {
  // Close user menu on resize to prevent positioning issues
  if (isUserMenuOpen.value) {
    closeUserMenu();
  }
  
  // Set mobile menu button visibility
  const mobileMenuBtn = document.querySelector('.mobile-menu-button');
  if (mobileMenuBtn) {
    if (window.innerWidth >= 1024) {
      mobileMenuBtn.classList.add('!hidden');
    } else {
      mobileMenuBtn.classList.remove('!hidden');
      mobileMenuBtn.classList.add('block');
    }
  }
}

// Close menu when route changes
watch(() => router.currentRoute.value.fullPath, () => {
  closeUserMenu();
});

// Add event listeners
onMounted(() => {
  window.addEventListener('keydown', handleEscapeKey);
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutside);
  
  // Initial size check
  handleResize();
});

// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscapeKey);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
/* Custom styling for the logo */
.logo-image {
  fill: currentColor;
  transition: fill 0.2s ease;
}

/* Hover effect for the logo */
.router-link-active .logo-image,
a:hover .logo-image {
  fill: var(--primary-color-hover);
}

/* Force important for mobile menu visibility */
.mobile-menu-button {
  display: none !important; /* Default hidden */
}

@media (max-width: 1023px) {
  .mobile-menu-button {
    display: block !important; /* Show on mobile */
  }
}

/* Focus styles for better accessibility */
button:focus-visible,
a:focus-visible {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
  @apply dark:ring-primary-400 dark:ring-offset-gray-800;
}

/* Animation for dropdown */
.dropdown-animation {
  animation: dropdown-in 0.15s ease-out;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* User button styling to prevent layout shifts */
.user-menu-button {
  position: relative;
  z-index: 40;
  transition: background-color 0.2s ease;
}
</style>
