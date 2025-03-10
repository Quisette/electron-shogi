<template>
  <div ref="root" class="full column record-pane">
    <div class="auto record">
      <RecordView
        :record="store.record"
        :operational="isRecordOperational"
        :show-comment="appSetting.showCommentInRecordView"
        :show-elapsed-time="appSetting.showElapsedTimeInRecordView"
        :elapsed-time-toggle-label="t.elapsedTime"
        :comment-toggle-label="t.comments"
        @go-begin="goBegin"
        @go-back="goBack"
        @go-forward="goForward"
        @go-end="goEnd"
        @select-move="selectMove"
        @select-branch="selectBranch"
        @swap-with-previous-branch="swapWithPreviousBranch"
        @swap-with-next-branch="swapWithNextBranch"
        @toggle-show-elapsed-time="onToggleElapsedTime"
        @toggle-show-comment="onToggleComment"
      />
    </div>
  </div>
</template>

<script lang="ts">
export const minWidth = 200;
</script>

<script setup lang="ts">
import { t } from "@/common/i18n";
import { computed, onMounted, onUnmounted, ref } from "vue";
import RecordView from "@/renderer/view/primitive/RecordView.vue";
import { useStore } from "@/renderer/store";
import { AppState } from "@/common/control/state.js";
import {
  installHotKeyForMainWindow,
  uninstallHotKeyForMainWindow,
} from "@/renderer/keyboard/hotkey";
import { useAppSetting } from "@/renderer/store/setting";

const store = useStore();
const appSetting = useAppSetting();
const root = ref();

onMounted(() => {
  installHotKeyForMainWindow(root.value);
});

onUnmounted(() => {
  uninstallHotKeyForMainWindow(root.value);
});

const goto = (ply: number) => {
  store.changePly(ply);
};

const goBegin = () => {
  goto(0);
};

const goBack = () => {
  goto(store.record.current.number - 1);
};

const goForward = () => {
  goto(store.record.current.number + 1);
};

const goEnd = () => {
  goto(Number.MAX_SAFE_INTEGER);
};

const selectMove = (ply: number) => {
  goto(ply);
};

const selectBranch = (index: number) => {
  store.changeBranch(index);
};

const swapWithPreviousBranch = () => {
  store.swapWithPreviousBranch();
};

const swapWithNextBranch = () => {
  store.swapWithNextBranch();
};

const onToggleElapsedTime = (enabled: boolean) => {
  appSetting.updateAppSetting({
    showElapsedTimeInRecordView: enabled,
  });
};

const onToggleComment = (enabled: boolean) => {
  appSetting.updateAppSetting({
    showCommentInRecordView: enabled,
  });
};

const isRecordOperational = computed(() => {
  return (
    store.appState === AppState.NORMAL || store.appState === AppState.RESEARCH
  );
});
</script>

<style scoped>
.record-pane {
  box-sizing: border-box;
}
.record {
  width: 100%;
  min-height: 0;
}
</style>
