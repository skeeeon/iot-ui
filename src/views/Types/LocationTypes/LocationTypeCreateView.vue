<template>
  <div>
    <PageHeader 
      title="Create Location Type" 
      subtitle="Add a new location type definition"
    >
      <template #actions>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-outlined"
          @click="$router.back()" 
        />
      </template>
    </PageHeader>
    
    <div class="bg-surface-primary dark:bg-surface-primary-dark rounded-lg border border-border-primary dark:border-border-primary-dark shadow-theme-md theme-transition">
      <div class="p-6 border-b border-border-primary dark:border-border-primary-dark">
        <h2 class="text-xl font-semibold text-content-primary dark:text-content-primary-dark">Location Type Information</h2>
      </div>
      <div class="p-6">
        <EntityForm
          :loading="loading"
          submit-label="Create Location Type"
          @submit="submitForm"
          @cancel="$router.back()"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Type Name -->
            <FormField
              id="type"
              label="Type Name"
              :required="true"
              :error-message="v$.type.$errors[0]?.$message"
              class="md:col-span-2"
            >
              <InputText
                id="type"
                v-model="type.type"
                placeholder="Meeting Room"
                class="w-full"
                :class="{ 'p-invalid': v$.type.$error }"
                @blur="generateCode"
              />
            </FormField>
            
            <!-- Code -->
            <FormField
              id="code"
              label="Code"
              :required="true"
              :error-message="v$.code.$errors[0]?.$message"
              help-text="Short code used in location identifiers (e.g., 'meeting-room')"
            >
              <InputText
                id="code"
                v-model="type.code"
                placeholder="meeting-room"
                class="w-full font-mono"
                :class="{ 'p-invalid': v$.code.$error }"
              />
            </FormField>
            
            <!-- Description -->
            <FormField
              id="description"
              label="Description"
              :error-message="v$.description.$errors[0]?.$message"
              class="md:col-span-2"
            >
              <Textarea
                id="description"
                v-model="type.description"
                rows="3"
                placeholder="Enter a description for this location type"
                class="w-full"
                :class="{ 'p-invalid': v$.description.$error }"
              />
            </FormField>

            <!-- Style Preview -->
            <FormField
              id="style-preview"
              label="Style Preview"
              class="md:col-span-2"
            >
              <div class="flex items-center mt-2">
                <span 
                  :class="[getTypeClass(type.code || 'default'), 'px-3 py-1 rounded-full text-sm']"
                >
                  {{ type.type || 'Location Type' }}
                </span>
              </div>
            </FormField>
          </div>
          
          <!-- Form guidance -->
          <div class="mt-6 p-4 rounded-md text-sm bg-surface-secondary dark:bg-surface-secondary-dark border border-border-secondary dark:border-border-secondary-dark text-content-secondary dark:text-content-secondary-dark">
            <div class="flex items-start">
              <i class="pi pi-info-circle mt-0.5 mr-2 text-blue-500 dark:text-blue-400"></i>
              <div>
                <p><strong>Note:</strong> The code should be a kebab-case identifier (lowercase with hyphens) that will be used in location codes.</p>
                <p class="mt-1">Example: 'meeting-room', 'break-area', 'entrance-hall', etc.</p>
              </div>
            </div>
          </div>
        </EntityForm>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLocationType } from '../../../composables/useLocationType'
import { useTypeForm } from '../../../composables/useTypeForm'
import { locationTypeService } from '../../../services'
import PageHeader from '../../../components/common/PageHeader.vue'
import EntityForm from '../../../components/common/EntityForm.vue'
import FormField from '../../../components/common/FormField.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

// Get location type validation function and style class helper
const { validateCode, getTypeClass } = useLocationType()

// Route names for navigation
const routeNames = {
  list: 'location-types',
  detail: 'location-type-detail',
  create: 'create-location-type', 
  edit: 'edit-location-type'
}

// Use the type form composable
const { 
  type, 
  v$, 
  loading, 
  generateCode,
  submitForm 
} = useTypeForm(locationTypeService, {
  mode: 'create',
  entityName: 'Location Type',
  routeNames,
  validateCode
})
</script>

<style scoped>
/* Form input styling */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-textarea) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-color: var(--surface-border);
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-dropdown:enabled:focus),
:deep(.p-textarea:enabled:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem var(--primary-color-transparent);
}

/* Fix PrimeVue components styling in dark mode */
:deep(.dark .p-inputtext),
:deep(.dark .p-dropdown),
:deep(.dark .p-textarea) {
  background-color: var(--surface-hover);
  color: var(--text-color);
  border-color: var(--surface-border);
}

:deep(.dark .p-dropdown-panel),
:deep(.dark .p-dropdown-items-wrapper) {
  background-color: var(--surface-hover);
  color: var(--text-color);
}
</style>
