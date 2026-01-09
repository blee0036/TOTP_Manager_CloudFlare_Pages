/**
 * Vuetify Plugin Configuration
 * 
 * Google Authenticator inspired theme - Clean, simple, and comfortable
 */

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Light theme - Google Authenticator style
const lightTheme = {
  dark: false,
  colors: {
    primary: '#1A73E8',      // Google Blue
    secondary: '#5F6368',    // Google Gray
    accent: '#1A73E8',       
    error: '#D93025',        // Google Red
    info: '#1A73E8',         
    success: '#1E8E3E',      // Google Green
    warning: '#F9AB00',      // Google Yellow
    background: '#FFFFFF',   // Pure white
    surface: '#F8F9FA',      // Very light gray
    'surface-variant': '#F1F3F4',  // Light gray
    'surface-bright': '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#202124',    // Almost black
    'on-surface': '#202124',       
    'on-surface-variant': '#5F6368', // Gray
  }
}

// Dark theme - Google Authenticator dark mode
const darkTheme = {
  dark: true,
  colors: {
    primary: '#8AB4F8',      // Light blue
    secondary: '#9AA0A6',    // Light gray
    accent: '#8AB4F8',       
    error: '#F28B82',        // Light red
    info: '#8AB4F8',         
    success: '#81C995',      // Light green
    warning: '#FDD663',      // Light yellow
    background: '#202124',   // Dark gray (Google dark)
    surface: '#292A2D',      // Slightly lighter
    'surface-variant': '#3C4043',  // Medium gray
    'surface-bright': '#3C4043',
    'on-primary': '#202124',
    'on-secondary': '#202124',
    'on-background': '#E8EAED',    // Light gray text
    'on-surface': '#E8EAED',       
    'on-surface-variant': '#9AA0A6', // Medium gray
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
  
  // Google-style component defaults
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-weight: 500; letter-spacing: 0.25px;',
      rounded: 'pill',  // 完全圆角
      elevation: 0,
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      bgColor: 'surface',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      bgColor: 'surface',
      menuProps: {
        rounded: 'lg',
      },
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      bgColor: 'surface',
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
      bgColor: 'surface',
      rounded: 'lg',
    },
    VListItem: {
      rounded: 'lg',
    },
  },
})
