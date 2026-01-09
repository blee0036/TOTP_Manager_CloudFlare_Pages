/**
 * Vuetify Plugin Configuration
 * 
 * Modern, eye-friendly theme with rounded corners and soft colors
 * Optimized for readability and visual comfort
 */

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Light theme - Modern and eye-friendly
const lightTheme = {
  dark: false,
  colors: {
    primary: '#3B82F6',      // Modern blue
    secondary: '#64748B',    // Slate gray
    accent: '#06B6D4',       // Cyan accent
    error: '#EF4444',        // Soft red
    info: '#3B82F6',         // Blue
    success: '#10B981',      // Emerald green
    warning: '#F59E0B',      // Amber
    background: '#F8FAFC',   // Very light gray-blue (护眼)
    surface: '#FFFFFF',      // Pure white
    'surface-variant': '#F1F5F9',  // Light slate
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#1E293B',    // Dark slate (高对比度)
    'on-surface': '#1E293B',       // Dark slate (高对比度)
    'on-surface-variant': '#475569', // Medium slate
  }
}

// Dark theme - Soft and comfortable for eyes
const darkTheme = {
  dark: true,
  colors: {
    primary: '#60A5FA',      // Lighter blue
    secondary: '#64748B',    // Slate gray
    accent: '#22D3EE',       // Bright cyan
    error: '#F87171',        // Soft red
    info: '#60A5FA',         // Blue
    success: '#34D399',      // Emerald
    warning: '#FBBF24',      // Amber
    background: '#0F172A',   // Very dark slate (护眼深色)
    surface: '#1E293B',      // Dark slate (提高对比度)
    'surface-variant': '#334155',  // Medium slate
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#F1F5F9',    // Light text (高对比度)
    'on-surface': '#F1F5F9',       // Light text (高对比度)
    'on-surface-variant': '#CBD5E1', // Light slate
  }
}

// Create Vuetify instance with modern configuration
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
  
  // Modern component defaults with rounded corners
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-weight: 500;', // 去掉全大写
      rounded: 'lg',  // 更圆滑
      elevation: 0,   // 扁平化
    },
    VCard: {
      rounded: 'xl',  // 更圆滑的卡片
      elevation: 0,   // 扁平化
      border: 'sm',   // 添加边框
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',  // 圆角输入框
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VDialog: {
      maxWidth: 600,
      rounded: 'xl',  // 圆角对话框
    },
    VSheet: {
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
  },
})
