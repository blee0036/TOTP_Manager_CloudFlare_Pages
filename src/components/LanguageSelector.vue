<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        icon
      >
        <v-icon>mdi-translate</v-icon>
      </v-btn>
    </template>

    <v-list density="compact" max-height="400" class="lang-list">
      <v-list-item
        v-for="locale in supportedLocales"
        :key="locale.code"
        :value="locale.code"
        @click="changeLocale(locale.code)"
        :class="{ 'lang-item-active': currentLocale === locale.code }"
      >
        <v-list-item-title>{{ locale.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { supportedLocales, setLocale } from '@/i18n';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

const changeLocale = async (newLocale: string) => {
  await setLocale(newLocale);
};
</script>

<style scoped>
.lang-list {
  background: rgb(24, 24, 27) !important;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px !important;
}

.lang-list :deep(.v-list-item) {
  min-height: 40px;
  border-radius: 8px;
  margin: 2px 4px;
  color: #A1A1AA;
}

.lang-list :deep(.v-list-item:hover) {
  background: rgba(139, 92, 246, 0.1) !important;
  color: #E4E4E7;
}

.lang-item-active {
  background: rgba(139, 92, 246, 0.15) !important;
  color: #A78BFA !important;
}

.lang-item-active :deep(.v-list-item-title) {
  color: #A78BFA !important;
  font-weight: 500;
}
</style>
