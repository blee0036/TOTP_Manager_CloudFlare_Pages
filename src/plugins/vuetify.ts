/**
 * Vuetify Plugin Configuration
 * 
 * Modern black-purple theme - Elegant, sleek, and sophisticated
 */

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Light theme - Light gray-white background + purple accent
const lightTheme = {
  dark: false,
  colors: {
    primary: '#7C3AED',           // Darker purple for better contrast with white text
    'primary-darken-1': '#6D28D9', // Even deeper purple
    secondary: '#A78BFA',          // Light purple
    accent: '#C4B5FD',             // Pale purple
    error: '#EF4444',              // Red
    warning: '#F59E0B',            // Amber
    success: '#10B981',            // Green
    info: '#7C3AED',               // Purple (same as primary)
    background: '#FAFAFA',         // Light gray-white background
    surface: '#FFFFFF',            // Pure white surface
    'surface-variant': '#F5F3FF',  // Pale purple surface
    'surface-bright': '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#1F2937',     // Dark text for better contrast on light purple
    'on-background': '#1F2937',    // Dark gray text
    'on-surface': '#1F2937',
    'on-surface-variant': '#4B5563', // Darker gray for WCAG AA compliance (4.5:1 contrast)
  }
}

// Dark theme - Deep black background + purple accent
const darkTheme = {
  dark: true,
  colors: {
    primary: '#A78BFA',            // Bright purple
    'primary-darken-1': '#8B5CF6', // Purple
    secondary: '#C4B5FD',          // Light purple
    accent: '#DDD6FE',             // Pale purple
    error: '#F87171',              // Light red
    warning: '#FBBF24',            // Light amber
    success: '#34D399',            // Light green
    info: '#A78BFA',               // Purple
    background: '#0A0A0B',         // Deep black background
    surface: '#18181B',            // Dark gray surface
    'surface-variant': '#27272A',  // Medium gray surface
    'surface-bright': '#3F3F46',   // Bright gray surface
    'on-primary': '#0A0A0B',
    'on-secondary': '#0A0A0B',
    'on-background': '#F4F4F5',    // Light gray text
    'on-surface': '#F4F4F5',
    'on-surface-variant': '#A1A1AA',
  }
}

// Create Vuetify instance
export default createVuetify({
  components,
  directives,
  
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  
  // Modern component defaults with purple accent
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-weight: 500; letter-spacing: 0.25px;',
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      hideDetails: true,
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      hideDetails: true,
      menuProps: {
        rounded: 'lg',
      },
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      hideDetails: true,
    },
    VDialog: {
      maxWidth: 600,
      rounded: 'xl',
    },
    VSheet: {
      rounded: 'lg',
    },
    VChip: {
      rounded: 'pill',
    },
    VList: {
      rounded: 'lg',
    },
    VListItem: {
      rounded: 'lg',
    },
    VAppBar: {
      elevation: 0,
    },
    VNavigationDrawer: {
      elevation: 0,
    },
  },
})
