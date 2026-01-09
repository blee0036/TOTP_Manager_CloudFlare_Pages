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

    <v-list density="compact" max-height="400">
      <v-list-item
        v-for="locale in supportedLocales"
        :key="locale.code"
        :value="locale.code"
        @click="changeLocale(locale.code)"
        :active="currentLocale === locale.code"
        color="primary"
      >
        <template v-slot:prepend>
          <span class="text-h6 mr-3">{{ locale.flag }}</span>
        </template>
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
/* 可选：添加自定义样式 */
</style>
