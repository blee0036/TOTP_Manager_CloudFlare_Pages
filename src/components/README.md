# Vue Components

This directory contains all Vue components for the TOTP Manager application.

## Components

### TokenCard.vue
Displays a TOTP token with automatic refresh and countdown timer.

**Features:**
- Displays 6-digit TOTP token in formatted style (XXX XXX)
- Auto-refreshes token every 30 seconds
- Shows countdown progress bar with color coding (green → yellow → red)
- Copy to clipboard functionality
- Loading and error states
- Material Design styling

**Props:**
- `id`: Key identifier (string | number)
- `remark`: Display name for the key
- `secret`: Base32 encoded secret key

**Events:**
- `copy`: Emitted when token is copied (payload: token string)
- `manage`: Emitted when manage button is clicked (payload: key id)

**Usage:**
```vue
<TokenCard
  :id="key.id"
  :remark="key.remark"
  :secret="key.secret"
  @copy="handleCopy"
  @manage="handleManage"
/>
```

---

### SearchBar.vue
Real-time search input with debouncing and result count display.

**Features:**
- Debounced search input (300ms default)
- Clear button
- Optional result count badge
- Material Design outlined style
- Responsive width

**Props:**
- `modelValue`: Current search query (v-model support)
- `label`: Input label (default: from i18n)
- `placeholder`: Input placeholder (default: from i18n)
- `showResultCount`: Show result count badge (default: false)
- `resultCount`: Number of results to display
- `debounce`: Debounce delay in ms (default: 300)

**Events:**
- `update:modelValue`: Emitted on input change (immediate)
- `search`: Emitted after debounce delay
- `clear`: Emitted when clear button is clicked

**Usage:**
```vue
<SearchBar
  v-model="searchQuery"
  :show-result-count="true"
  :result-count="filteredKeys.length"
  @search="handleSearch"
/>
```

---

### KeyForm.vue
Form for adding or editing TOTP keys with validation.

**Features:**
- Remark field with required validation
- Secret key field with Base32 validation
- Auto-detection of OTPAuth URI format
- Auto-extraction of secret and remark from URI
- Real-time validation feedback
- Material Design form styling
- Support for add and edit modes

**Props:**
- `mode`: Form mode ('add' | 'edit')
- `initialData`: Initial form values (optional)
- `showCancel`: Show cancel button (default: true)
- `loading`: Loading state for submit button

**Events:**
- `submit`: Emitted on form submission (payload: { remark, secret })
- `cancel`: Emitted when cancel button is clicked

**Usage:**
```vue
<KeyForm
  mode="add"
  :loading="isSubmitting"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

---

### QRScanner.vue
QR code scanner for importing TOTP keys from images.

**Features:**
- File upload with image preview
- QR code parsing using jsQR library
- OTPAuth URI extraction
- Auto-scan on file selection (optional)
- Success and error feedback
- Material Design file input

**Props:**
- `accept`: Accepted file types (default: 'image/*')
- `label`: Input label (default: from i18n)
- `placeholder`: Input placeholder (default: from i18n)
- `showPreview`: Show image preview (default: true)
- `autoScan`: Auto-scan on file select (default: true)

**Events:**
- `scan`: Emitted on successful scan (payload: { secret, remark? })
- `error`: Emitted on scan error (payload: Error)

**Usage:**
```vue
<QRScanner
  :show-preview="true"
  :auto-scan="true"
  @scan="handleScan"
  @error="handleError"
/>
```

---

## Shared Components

### LanguageSelector.vue
Language selection dropdown (already implemented in task 11.5)

### ThemeToggle.vue
Theme toggle button (already implemented in task 12.2)

---

## Component Architecture

All components follow these principles:

1. **TypeScript**: Fully typed with interfaces for props and emits
2. **Composition API**: Using `<script setup>` syntax
3. **i18n**: All text is internationalized using vue-i18n
4. **Vuetify**: Material Design components and styling
5. **Composables**: Reusing logic from composables (useTOTP, useKeyValidation)
6. **Accessibility**: Proper ARIA labels and keyboard navigation
7. **Responsive**: Mobile-friendly layouts

---

## Testing

Components can be tested using Vitest with Vue Test Utils:

```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TokenCard from './TokenCard.vue';

describe('TokenCard', () => {
  it('renders token correctly', () => {
    const wrapper = mount(TokenCard, {
      props: {
        id: 1,
        remark: 'Test Key',
        secret: 'JBSWY3DPEHPK3PXP'
      }
    });
    
    expect(wrapper.text()).toContain('Test Key');
  });
});
```

---

## Requirements Validation

### Task 13.1 - TokenCard Component ✓
- ✓ Displays TOTP token
- ✓ Displays countdown progress bar
- ✓ Implements copy functionality
- ✓ Implements token auto-update
- ✓ Validates requirements: 4.4, 4.5, 4.6

### Task 13.2 - SearchBar Component ✓
- ✓ Implements search input box
- ✓ Implements real-time filtering
- ✓ Implements highlight matching text (via parent component)
- ✓ Validates requirements: 8.2, 8.3, 8.4, 8.8

### Task 13.3 - KeyForm Component ✓
- ✓ Implements key input form
- ✓ Implements required remark validation
- ✓ Implements key format validation
- ✓ Real-time validation error display
- ✓ Validates requirements: 6.1, 6.5, 6.6, 6.7, 6.8

### Task 13.4 - QRScanner Component ✓
- ✓ Implements file upload
- ✓ Integrates jsQR library
- ✓ Parses QR code content
- ✓ Auto-fills form
- ✓ Validates requirements: 6.3, 6.4
