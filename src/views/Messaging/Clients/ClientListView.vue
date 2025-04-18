<!-- src/views/Messaging/Clients/ClientListView.vue -->
<template>
  <div>
    <PageHeader title="Messaging Clients" subtitle="Manage NATS authentication clients">
      <template #actions>
        <Button 
          label="Create Client" 
          icon="pi pi-plus" 
          @click="navigateToClientCreate"
        />
      </template>
    </PageHeader>
    
    <Card>
      <template #content>
        <DataTable
          :items="clients"
          :columns="columns"
          :loading="loading"
          :searchable="true"
          :searchFields="['username', 'expand.role_id.name']"
          empty-message="No clients found"
          @row-click="(data) => navigateToClientDetail(data.id)"
          :paginated="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
        >
          <!-- Username column with custom formatting -->
          <template #username-body="{ data }">
            <div :class="['font-medium font-mono', themeValue.class('text-primary-700', 'text-primary-400')]">
              {{ data.username }}
            </div>
          </template>
          
          <!-- Role column with reference -->
          <template #role_id-body="{ data }">
            <div v-if="data.expand && data.expand.role_id">
              <router-link 
                :to="{ name: 'topic-permission-detail', params: { id: data.role_id } }"
                :class="themeValue.class('text-primary-600 hover:text-primary-700', 'text-primary-400 hover:text-primary-300') + ' hover:underline'"
                @click.stop
              >
                {{ data.expand.role_id.name }}
              </router-link>
            </div>
            <span v-else :class="textColor.secondary">No role assigned</span>
          </template>
          
          <!-- Status column with badge -->
          <template #active-body="{ data }">
            <span 
              class="px-2 py-1 text-xs rounded-full font-medium inline-block"
              :class="data.active ? 
                themeValue.class('bg-green-100 text-green-800', 'bg-green-900/30 text-green-300') : 
                themeValue.class('bg-gray-100 text-gray-800', 'bg-gray-700 text-gray-300')"
            >
              {{ data.active ? 'Active' : 'Inactive' }}
            </span>
          </template>
          
          <!-- Created column with formatted date -->
          <template #created-body="{ data }">
            <span :class="textColor.secondary">{{ formatDate(data.created) }}</span>
          </template>
          
          <!-- Actions column -->
          <template #row-actions="{ data }">
            <div class="flex gap-1 justify-center">
              <Button 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-text p-button-sm" 
                @click.stop="navigateToClientDetail(data.id)"
                tooltip="View"
                tooltipOptions="{ position: 'top' }"
              />
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-sm" 
                @click.stop="navigateToClientEdit(data.id)"
                tooltip="Edit"
                tooltipOptions="{ position: 'top' }"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-sm p-button-danger" 
                @click.stop="confirmDelete(data)"
                tooltip="Delete"
                tooltipOptions="{ position: 'top' }"
              />
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
    
    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:visible="deleteDialog.visible"
      title="Delete Client"
      type="danger"
      confirm-label="Delete"
      confirm-icon="pi pi-trash"
      :loading="deleteDialog.loading"
      :message="`Are you sure you want to delete client '${deleteDialog.item?.username || ''}'?`"
      details="This action cannot be undone."
      @confirm="handleDeleteClient"
    />
    
    <!-- Toast for success/error messages -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClient } from '../../../composables/useClient'
import { useTheme } from '../../../composables/useTheme'
import DataTable from '../../../components/common/DataTable.vue'
import PageHeader from '../../../components/common/PageHeader.vue'
import ConfirmationDialog from '../../../components/common/ConfirmationDialog.vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Card from 'primevue/card'

// Theme composable for theme-aware styling
const { themeValue, backgroundColor, textColor, borderColor } = useTheme()

// Use the client composable
const { 
  clients,
  loading,
  fetchClients,
  formatDate,
  deleteClient,
  navigateToClientCreate,
  navigateToClientDetail,
  navigateToClientEdit
} = useClient()

// Table columns definition
const columns = [
  { field: 'username', header: 'Username', sortable: true },
  { field: 'role_id', header: 'Role', sortable: true },
  { field: 'active', header: 'Status', sortable: true },
  { field: 'created', header: 'Created', sortable: true }
]

// Delete confirmation dialog
const deleteDialog = ref({
  visible: false,
  loading: false,
  item: null
})

// Fetch clients on component mount
onMounted(async () => {
  await fetchClients()
})

// Delete confirmation
const confirmDelete = (data) => {
  deleteDialog.value.item = data
  deleteDialog.value.visible = true
}

// Delete client
const handleDeleteClient = async () => {
  if (!deleteDialog.value.item) return
  
  deleteDialog.value.loading = true
  try {
    const success = await deleteClient(
      deleteDialog.value.item.id, 
      deleteDialog.value.item.username
    )
    
    if (success) {
      // Remove the deleted item from the list without refetching
      clients.value = clients.value.filter(
        item => item.id !== deleteDialog.value.item.id
      )
      deleteDialog.value.visible = false
    }
  } finally {
    deleteDialog.value.loading = false
  }
}
</script>

<style scoped>
/* Theme-aware styling */
:deep(.p-card) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-radius: 0.5rem;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--surface-border);
  transition: all 0.2s ease;
}

:deep(.p-card .p-card-title) {
  padding: 1.25rem 1.5rem;
  margin-bottom: 0;
  border-bottom: 1px solid var(--surface-border);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-card .p-card-content) {
  padding: 1.5rem;
}

/* Basic DataTable styling */
:deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover);
  cursor: pointer;
}

/* Fix for dark mode table */
:deep(.dark .p-datatable .p-datatable-thead > tr > th) {
  background-color: var(--surface-ground);
  color: var(--text-color-secondary);
  border-color: var(--surface-border);
}

:deep(.dark .p-datatable .p-datatable-tbody > tr) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-color: var(--surface-border);
}

:deep(.dark .p-datatable .p-datatable-tbody > tr > td) {
  border-color: var(--surface-border);
}

:deep(.dark .p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover);
}
</style>
