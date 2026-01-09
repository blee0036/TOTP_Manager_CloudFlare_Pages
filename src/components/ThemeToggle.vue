<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :icon="currentThemeIcon"
        variant="text"
        :aria-label="$t('theme.toggle')"
      />
    </template>
    
    <v-list density="compact">
      <v-list-item
        v-for="option in themeOptions"
        :key="option.value"
        :value="option.value"
        :active="theme === option.value"
        color="primary"
        @click="setTheme(option.value)"
      >
        <template v-slot:prepend>
          <v-icon :icon="option.icon" />
        </template>
        <v-list-item-title>{{ option.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useSettingsStore } from '../stores/settings'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const vuetifyTheme = useTheme()
const settingsStore = useSettingsStore()

// Theme options
const themeOptions = computed(() => [
  {
    value: 'light' as const,
    label: t('theme.light'),
    icon: 'mdi-white-balance-sunny'
  },
  {
    value: 'dark' as const,
    label: t('theme.dark'),
    icon: 'mdi-moon-waning-crescent'
  },
  {
    value: 'auto' as const,
    label: t('theme.auto'),
    icon: 'mdi-theme-light-dark'
  }
])

// Current theme from store
const theme = computed(() => settingsStore.theme)

// Current theme icon based on effective theme
const currentThemeIcon = computed(() => {
  const effectiveTheme = settingsStore.getEffectiveTheme()
  if (theme.value === 'auto') {
    return 'mdi-theme-light-dark'
  }
  return effectiveTheme === 'dark' ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny'
})

/**
 * Set theme and apply to Vuetify
 */
function setTheme(newTheme: 'light' | 'dark' | 'auto'): void {
  settingsStore.setTheme(newTheme)
  applyTheme()
}

/**
 * Apply the effective theme to Vuetify
 */
function applyTheme(): void {
  const effectiveTheme = settingsStore.getEffectiveTheme()
  vuetifyTheme.global.name.value = effectiveTheme
}

/**
 * Watch for theme changes
 */
watch(() => settingsStore.theme, () => {
  applyTheme()
})

/**
 * Watch for system theme changes when theme is set to auto
 */
onMounted(() => {
  // Apply initial theme
  applyTheme()
  
  // Watch system theme changes
  settingsStore.watchSystemTheme((systemTheme) => {
    if (settingsStore.theme === 'auto') {
      vuetifyTheme.global.name.value = systemTheme
    }
  })
})
</script>

<style scoped>
/* No additional styles needed - using Vuetify components */
</style>
