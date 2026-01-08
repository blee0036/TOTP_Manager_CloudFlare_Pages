/**
 * Vuetify Plugin Configuration
 * 
 * Configures Material Design 3 (Material You) theme with Google brand colors
 * Supports light and dark themes with proper typography system
 */

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Light theme configuration with Google brand colors
const lightTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',      // Google Blue
    secondary: '#424242',    // Grey 800
    accent: '#82B1FF',       // Blue Accent
    error: '#D32F2F',        // Red 700
    info: '#2196F3',         // Blue 500
    success: '#4CAF50',      // Green 500
    warning: '#FB8C00',      // Orange 600
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#000000',
    'on-surface': '#000000',
  }
}

// Dark theme configuration with Material Design dark colors
const darkTheme = {
  dark: true,
  colors: {
    primary: '#90CAF9',      // Blue 200
    secondary: '#424242',    // Grey 800
    accent: '#82B1FF',       // Blue Accent
    error: '#EF5350',        // Red 400
    info: '#42A5F5',         // Blue 400
    success: '#66BB6A',      // Green 400
    warning: '#FFA726',      // Orange 400
    background: '#121212',
    surface: '#1E1E1E',
    'on-primary': '#000000',
    'on-secondary': '#FFFFFF',
    'on-background': '#FFFFFF',
    'on-surface': '#FFFFFF',
  }
}

// Create Vuetify instance with Material Design configuration
export default createVuetify({
  components,
  directives,
  
  // Icon configuration
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  
  // Theme configuration
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
    variations: {
      colors: ['primary', 'secondary', 'accent'],
      lighten: 5,
      darken: 5,
    },
  },
  
  // Typography configuration (Roboto font)
  defaults: {
    VBtn: {
      style: 'text-transform: uppercase; font-weight: 500;',
      rounded: 'sm',
    },
    VCard: {
      rounded: 'sm',
      elevation: 2,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VDialog: {
      maxWidth: 600,
    },
  },
})
