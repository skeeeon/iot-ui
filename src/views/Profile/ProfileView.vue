<!-- src/views/Profile/ProfileView.vue -->
<template>
  <div>
    <PageHeader 
      title="Profile" 
      subtitle="Manage your account information"
    />
    
    <div v-if="initialLoading" class="flex justify-center items-center py-12">
      <ProgressSpinner strokeWidth="4" />
    </div>
    
    <div v-else-if="error" class="card p-6 text-center">
      <div class="text-red-500 text-xl mb-4">
        <i class="pi pi-exclamation-circle mr-2"></i>
        Failed to load profile
      </div>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <Button label="Try Again" icon="pi pi-refresh" @click="fetchProfile" />
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information Card -->
      <div class="card lg:col-span-2">
        <h2 class="text-xl font-semibold mb-4">Profile Information</h2>
        
        <EntityForm
          :loading="loading"
          submit-label="Save Changes"
          @submit="submitProfileForm"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- First Name -->
            <FormField
              id="first_name"
              label="First Name"
              :required="true"
              :error-message="v$.first_name.$errors[0]?.$message"
            >
              <InputText
                id="first_name"
                v-model="profileForm.first_name"
                class="w-full"
                :class="{ 'p-invalid': v$.first_name.$error }"
              />
            </FormField>
            
            <!-- Last Name -->
            <FormField
              id="last_name"
              label="Last Name"
              :required="true"
              :error-message="v$.last_name.$errors[0]?.$message"
            >
              <InputText
                id="last_name"
                v-model="profileForm.last_name"
                class="w-full"
                :class="{ 'p-invalid': v$.last_name.$error }"
              />
            </FormField>
            
            <!-- Email -->
            <FormField
              id="email"
              label="Email"
              :required="true"
              :error-message="v$.email.$errors[0]?.$message"
              class="md:col-span-2"
            >
              <InputText
                id="email"
                v-model="profileForm.email"
                class="w-full"
                :class="{ 'p-invalid': v$.email.$error }"
                type="email"
              />
            </FormField>
            
            <!-- Username (readonly) -->
            <FormField
              id="username"
              label="Username"
              hint="Not editable"
              class="md:col-span-2"
            >
              <InputText
                id="username"
                v-model="profileForm.username"
                class="w-full"
                readonly
                disabled
              />
            </FormField>
          </div>
        </EntityForm>
      </div>
      
      <!-- Password Change Card -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Change Password</h2>
        
        <EntityForm
          :loading="loading"
          submit-label="Update Password"
          @submit="submitPasswordForm"
        >
          <div class="space-y-4">
            <!-- Current Password -->
            <FormField
              id="oldPassword"
              label="Current Password"
              :required="true"
              :error-message="p$.oldPassword.$errors[0]?.$message"
            >
              <Password
                id="oldPassword"
                v-model="passwordForm.oldPassword"
                class="w-full"
                :class="{ 'p-invalid': p$.oldPassword.$error }"
                toggleMask
                :feedback="false"
              />
            </FormField>
            
            <!-- New Password -->
            <FormField
              id="password"
              label="New Password"
              :required="true"
              :error-message="p$.password.$errors[0]?.$message"
            >
              <Password
                id="password"
                v-model="passwordForm.password"
                class="w-full"
                :class="{ 'p-invalid': p$.password.$error }"
                toggleMask
              />
            </FormField>
            
            <!-- Confirm Password -->
            <FormField
              id="passwordConfirm"
              label="Confirm Password"
              :required="true"
              :error-message="p$.passwordConfirm.$errors[0]?.$message"
            >
              <Password
                id="passwordConfirm"
                v-model="passwordForm.passwordConfirm"
                class="w-full"
                :class="{ 'p-invalid': p$.passwordConfirm.$error }"
                toggleMask
                :feedback="false"
              />
            </FormField>
          </div>
        </EntityForm>
      </div>
      
      <!-- Account Information Card (Non-editable) -->
      <div class="card lg:col-span-3">
        <h2 class="text-xl font-semibold mb-4">Account Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Created Date -->
          <div>
            <div class="text-sm text-gray-500 mb-1">Account Created</div>
            <div class="text-gray-800">{{ formatDate(profile.created) }}</div>
          </div>
          
          <!-- Last Updated -->
          <div>
            <div class="text-sm text-gray-500 mb-1">Last Updated</div>
            <div class="text-gray-800">{{ formatDate(profile.updated) }}</div>
          </div>
          
          <!-- Verified Status -->
          <div>
            <div class="text-sm text-gray-500 mb-1">Email Verified</div>
            <div class="flex items-center">
              <i :class="[profile.verified ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500', 'mr-2']"></i>
              <span>{{ profile.verified ? 'Verified' : 'Not Verified' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserProfile } from '../../composables/useUserProfile'
import { useProfileForm } from '../../composables/useProfileForm'
import PageHeader from '../../components/common/PageHeader.vue'
import EntityForm from '../../components/common/EntityForm.vue'
import FormField from '../../components/common/FormField.vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

// Get user profile functionality
const { profile, error, loading: profileLoading, fetchProfile, formatDate } = useUserProfile()

// Get form functionality
const { 
  profileForm, 
  passwordForm, 
  v$, 
  p$, 
  loading: formLoading, 
  loadProfile,
  submitProfileForm,
  submitPasswordForm
} = useProfileForm()

// Combined loading state
const loading = ref(false)
const initialLoading = ref(true)

// Watch loading states
watch([profileLoading, formLoading], () => {
  loading.value = profileLoading.value || formLoading.value
})

// Load profile data on mount
onMounted(async () => {
  try {
    const userData = await fetchProfile()
    if (userData) {
      loadProfile(userData)
    }
  } finally {
    initialLoading.value = false
  }
})
</script>
