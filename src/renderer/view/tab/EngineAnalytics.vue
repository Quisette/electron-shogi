<template>
  <div>
    <div class="full column">
      <EngineAnalyticsElement
        v-for="monitor in store.usiMonitors"
        :key="monitor.sessionID"
        :history-mode="historyMode"
        :name="monitor.name"
        :info="monitor"
        :height="elementHeight"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "@/renderer/store";
import { computed } from "vue";
import EngineAnalyticsElement from "@/renderer/view/tab/EngineAnalyticsElement.vue";
import { RectSize } from "@/common/graphics.js";

const props = defineProps({
  size: {
    type: RectSize,
    required: true,
  },
  historyMode: {
    type: Boolean,
    required: true,
  },
});

const store = useStore();
const elementHeight = computed(() => {
  const rows = store.usiMonitors.length;
  return rows !== 0 ? props.size.height / rows : 0;
});
</script>
