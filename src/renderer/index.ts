import "./css/font.css";
import "./css/color.css";
import "./css/basic.css";
import "./css/control.css";
import "./css/dialog.css";
import { createApp, watch } from "vue";
import App from "@/renderer/App.vue";
import api, { appInfo, isMobileWebApp } from "@/renderer/ipc/api";
import { setup as setupIPC } from "@/renderer/ipc/setup";
import { useStore } from "@/renderer/store";
import { Chart, registerables } from "chart.js";
import { LogLevel } from "@/common/log";
import { useAppSettings } from "./store/settings";
import { setLanguage, t } from "@/common/i18n";
import { default as dayjs } from "dayjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _en from "dayjs/locale/en";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _ja from "dayjs/locale/ja";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _zh_tw from "dayjs/locale/zh-tw";
import relativeTime from "dayjs/plugin/relativeTime";
import { useErrorStore } from "@/renderer/store/error";

api.log(LogLevel.INFO, `start renderer process: APP_VERSION=${appInfo.appVersion}`);

// setup libraries
import("dayjs/locale/en");
import("dayjs/locale/ja");
import("dayjs/locale/zh-tw");
dayjs.extend(relativeTime);
Chart.register(...registerables);

setupIPC();

const store = useStore();

// ファイル名の変更を監視してタイトルを更新する。
function updateTitle(path: string | undefined, unsaved: boolean) {
  if (!document) {
    return;
  }
  const appName = t.shogiHome;
  const appVersion = appInfo.appVersion;
  if (isMobileWebApp()) {
    document.title = `${appName} Version ${appVersion} for Mobile Web Browser`;
    return;
  }
  if (path || unsaved) {
    const unsavedMaker = unsaved ? `${t.unsaved}: ` : "";
    const name = path ? path : t.newRecord;
    document.title = `${appName} Version ${appVersion} - ${unsavedMaker}${name}`;
  } else {
    document.title = `${appName} Version ${appVersion}`;
  }
}
watch([() => store.recordFilePath, () => store.isRecordFileUnsaved], ([path, unsaved]) => {
  updateTitle(path, unsaved);
});

Promise.allSettled([
  // アプリ設定の読み込み
  useAppSettings()
    .loadAppSettings()
    .catch((e) => {
      useErrorStore().add(new Error("アプリ設定の読み込み中にエラーが発生しました: " + e));
    }),
  // 起動時パラメータで指定された棋譜の読み込み
  api
    .fetchInitialRecordFileRequest()
    .then((request) => {
      if (request) {
        store.openRecord(request.path, {
          ply: request.ply,
        });
      }
    })
    .catch((e) => {
      useErrorStore().add(new Error("起動パラメーターの取得に失敗しました: " + e));
    }),
]).finally(() => {
  // 言語設定の反映
  const language = useAppSettings().language;
  api.log(LogLevel.INFO, `set language: ${language}`);
  setLanguage(language);

  // タイトルの更新
  updateTitle(store.recordFilePath, store.isRecordFileUnsaved);

  api.log(LogLevel.INFO, "mount app");
  createApp(App).mount("#app");
});
