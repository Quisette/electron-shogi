<template>
  <div class="root full" :class="appSetting.thema" :style="style">
    <StandardLayout class="full" />
    <GameDialog v-if="store.appState === AppState.GAME_DIALOG" />
    <CSAGameDialog v-if="store.appState === AppState.CSA_GAME_DIALOG" />
    <ResearchDialog v-if="store.appState === AppState.RESEARCH_DIALOG" />
    <AnalysisDialog v-if="store.appState === AppState.ANALYSIS_DIALOG" />
    <MateSearchDialog v-if="store.appState === AppState.MATE_SEARCH_DIALOG" />
    <USIEngineManagementDialog
      v-if="store.appState === AppState.USI_ENGINE_SETTING_DIALOG"
    />
    <ExportPositionImageDialog
      v-if="store.appState === AppState.EXPORT_POSITION_IMAGE_DIALOG"
    />
    <AppSettingDialog v-if="store.isAppSettingDialogVisible" />
    <PasteDialog v-if="store.appState === AppState.PASTE_DIALOG" />
    <BussyMessage v-if="store.isBussy" />
    <ConfirmDialog v-if="store.confirmation" />
    <CSAGameReadyDialog
      v-if="
        store.csaGameState === CSAGameState.WAITING_LOGIN ||
        store.csaGameState === CSAGameState.READY ||
        store.csaGameState === CSAGameState.LOGIN_RETRY_INTERVAL
      "
    />
    <PVPreviewDialog
      v-if="store.pvPreview"
      :position="store.pvPreview.position"
      :pv="store.pvPreview.pv"
      :infos="store.pvPreview.infos"
      @close="store.closePVPreviewDialog()"
    />
    <InfoMessage v-if="store.hasMessage" />
    <ErrorMessage v-if="store.hasError" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import StandardLayout from "@/renderer/view/main/StandardLayout.vue";
import GameDialog from "@/renderer/view/dialog/GameDialog.vue";
import CSAGameDialog from "@/renderer/view/dialog/CSAGameDialog.vue";
import ResearchDialog from "@/renderer/view/dialog/ResearchDialog.vue";
import USIEngineManagementDialog from "@/renderer/view/dialog/USIEngineManagementDialog.vue";
import ExportPositionImageDialog from "@/renderer/view/dialog/ExportPositionImageDialog.vue";
import AppSettingDialog from "@/renderer/view/dialog/AppSettingDialog.vue";
import PasteDialog from "@/renderer/view/dialog/PasteDialog.vue";
import BussyMessage from "@/renderer/view/dialog/BussyMessage.vue";
import ConfirmDialog from "@/renderer/view/dialog/ConfirmDialog.vue";
import InfoMessage from "@/renderer/view/dialog/InfoMessage.vue";
import ErrorMessage from "@/renderer/view/dialog/ErrorMessage.vue";
import { useStore } from "@/renderer/store";
import { AppState } from "@/common/control/state.js";
import AnalysisDialog from "@/renderer/view/dialog/AnalysisDialog.vue";
import CSAGameReadyDialog from "@/renderer/view/dialog/CSAGameReadyDialog.vue";
import { CSAGameState } from "@/renderer/store/csa";
import { useAppSetting } from "./store/setting";
import { BackgroundImageType } from "@/common/settings/app";
import MateSearchDialog from "./view/dialog/MateSearchDialog.vue";
import PVPreviewDialog from "./view/dialog/PVPreviewDialog.vue";

const appSetting = useAppSetting();
const store = useStore();

onMounted(() => {
  const body = document.getElementsByTagName("body")[0];
  body.addEventListener("copy", (event) => {
    store.copyRecordKIF();
    event.preventDefault();
  });
  body.addEventListener("paste", (event) => {
    store.showPasteDialog();
    event.preventDefault();
  });
  body.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault();
  });
  body.addEventListener("drop", (event: DragEvent) => {
    if (event.dataTransfer && event.dataTransfer.files[0]) {
      const path = event.dataTransfer.files[0].path;
      store.openRecord(path);
    }
    event.preventDefault();
  });
});

const style = computed(() => {
  if (
    appSetting.backgroundImageType == BackgroundImageType.NONE ||
    !appSetting.backgroundImageFileURL
  ) {
    return {};
  }
  let size = "";
  switch (appSetting.backgroundImageType) {
    case BackgroundImageType.COVER:
      size = "cover";
      break;
    case BackgroundImageType.CONTAIN:
      size = "contain";
      break;
    case BackgroundImageType.TILE:
      size = "auto";
      break;
  }
  return {
    "background-image": `url("${appSetting.backgroundImageFileURL}")`,
    "background-size": size,
  };
});
</script>

<style scoped>
.root {
  color: var(--main-color);
  background-color: var(--main-bg-color);
}
</style>
