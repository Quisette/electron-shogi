<template>
  <div>
    <dialog ref="dialog" class="root">
      <div class="title">{{ t.csaProtocolOnlineGame }}</div>
      <div class="form-group scroll">
        <div v-if="!logEnabled" class="form-group warning">
          <div class="note">
            {{ t.someLogsDisabled }}
            {{ t.logsRecommendedForCSAProtocol }}
            {{ t.pleaseEnableLogsAndRestart }}
          </div>
        </div>
        <div class="form-group">
          <div>{{ t.player }}</div>
          <PlayerSelector
            :player-uri="playerURI"
            :contains-human="true"
            :engine-settings="engineSettings"
            :display-ponder-state="true"
            :display-thread-state="true"
            :display-multi-pv-state="true"
            @update-engine-setting="onUpdatePlayerSetting"
            @select-player="onSelectPlayer"
          />
        </div>
        <div class="form-group">
          <div class="form-item">
            <div class="form-item-label-wide">
              {{ t.selectFromHistory }}
            </div>
            <select class="long-text" value="0" @change="onChangeHistory">
              <option v-if="history.serverHistory.length === 0" value="0">
                {{ t.noHistory }}
              </option>
              <option
                v-for="(server, index) in history.serverHistory"
                :key="index"
                :value="index"
              >
                {{ server.host }}:{{ server.port }} {{ server.id }}
              </option>
            </select>
          </div>
          <hr />
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.version }}</div>
            <select
              ref="protocolVersion"
              class="long-text"
              value="CSA_v121"
              @change="onChangeProtocolVersion"
            >
              <option :value="CSAProtocolVersion.V121">
                {{ t.csaProtocolV121 }}
              </option>
              <option :value="CSAProtocolVersion.V121_FLOODGATE">
                {{ t.csaProtocolV121WithPVComment }}
              </option>
            </select>
          </div>
          <div
            v-if="selectedProtocolVersion === CSAProtocolVersion.V121"
            class="form-group warning"
          >
            <div class="note">
              {{ t.notSendPVOnStandardCSAProtocol }}
            </div>
          </div>
          <div
            v-if="selectedProtocolVersion === CSAProtocolVersion.V121_FLOODGATE"
            class="form-group warning"
          >
            <div class="note">
              {{ t.sendPVDoNotUseOnWCSC }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.hostToConnect }}</div>
            <input
              ref="host"
              class="long-text"
              list="csa-server-host"
              type="text"
            />
            <datalist id="csa-server-host">
              <option value="gserver.computer-shogi.org" />
              <option value="wdoor.c.u-tokyo.ac.jp" />
              <option value="localhost" />
            </datalist>
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.portNumber }}</div>
            <input
              ref="port"
              class="number"
              list="csa-server-port-number"
              type="number"
            />
            <datalist id="csa-server-port-number">
              <option value="4081" />
            </datalist>
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">ID</div>
            <input ref="id" class="long-text" type="text" />
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.password }}</div>
            <input ref="password" class="long-text" type="password" />
          </div>
          <div class="form-item">
            <div class="form-item-label-wide"></div>
            <ToggleButton
              :label="t.showPassword"
              :value="false"
              @change="onTogglePasswordVisibility"
            />
          </div>
          <div class="form-group warning">
            <div v-if="isEncryptionAvailable" class="note">
              {{ t.csaProtocolSendPlaintextPassword }}
            </div>
            <div v-else class="note">
              {{
                t.passwordWillSavedPlaintextBecauseOSSideEncryptionNotAvailable
              }}
              {{ t.pleaseUncheckSaveHistoryIfNotWantSave }}
              {{ t.csaProtocolSendPlaintextPasswordRegardlessOfHistory }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.saveHistory }}</div>
            <ToggleButton
              :value="saveHistory"
              @change="
                (value: boolean) => {
                  saveHistory = value;
                }
              "
            />
          </div>
        </div>
        <div class="form-group">
          <div class="form-item">
            <div class="form-item-label-wide number">
              {{ t.gameRepetition }}
            </div>
            <input ref="repeat" class="number" type="number" min="1" />
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.autoRelogin }}</div>
            <ToggleButton
              :value="autoRelogin"
              @change="
                (value: boolean) => {
                  autoRelogin = value;
                }
              "
            />
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">{{ t.outputComments }}</div>
            <ToggleButton
              :value="enableComment"
              @change="
                (value: boolean) => {
                  enableComment = value;
                }
              "
            />
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">
              {{ t.saveRecordAutomatically }}
            </div>
            <ToggleButton
              :value="enableAutoSave"
              @change="
                (value: boolean) => {
                  enableAutoSave = value;
                }
              "
            />
          </div>
          <div class="form-item">
            <div class="form-item-label-wide">
              {{ t.adjustBoardAutomatically }}
            </div>
            <ToggleButton
              :value="autoFlip"
              @change="
                (value: boolean) => {
                  autoFlip = value;
                }
              "
            />
          </div>
        </div>
      </div>
      <div class="main-buttons">
        <button data-hotkey="Enter" autofocus @click="onStart()">
          {{ t.startGame }}
        </button>
        <button data-hotkey="Escape" @click="onCancel()">
          {{ t.cancel }}
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { t } from "@/common/i18n";
import { USIEngineSetting, USIEngineSettings } from "@/common/settings/usi";
import { ref, onMounted, computed, onUpdated, onBeforeUnmount } from "vue";
import api from "@/renderer/ipc/api";
import { useStore } from "@/renderer/store";
import {
  CSAProtocolVersion,
  CSAGameSetting,
  validateCSAGameSetting,
  buildCSAGameSettingByHistory,
  defaultCSAGameSettingHistory,
} from "@/common/settings/csa";
import { showModalDialog } from "@/renderer/helpers/dialog.js";
import * as uri from "@/common/uri.js";
import PlayerSelector from "@/renderer/view/dialog/PlayerSelector.vue";
import { PlayerSetting } from "@/common/settings/player";
import { readInputAsNumber } from "@/renderer/helpers/form.js";
import {
  installHotKeyForDialog,
  uninstallHotKeyForDialog,
} from "@/renderer/keyboard/hotkey";
import { useAppSetting } from "@/renderer/store/setting";
import ToggleButton from "@/renderer/view/primitive/ToggleButton.vue";

const store = useStore();
const dialog = ref();
const protocolVersion = ref();
const selectedProtocolVersion = ref(CSAProtocolVersion.V121);
const host = ref();
const port = ref();
const id = ref();
const password = ref();
const saveHistory = ref(true);
const repeat = ref();
const autoRelogin = ref(false);
const enableComment = ref(false);
const enableAutoSave = ref(false);
const autoFlip = ref(false);
const isEncryptionAvailable = ref(false);
const history = ref(defaultCSAGameSettingHistory());
const engineSettings = ref(new USIEngineSettings());
const playerURI = ref("");

let defaultValueLoaded = false;
let defaultValueApplied = false;
store.retainBussyState();

onMounted(async () => {
  try {
    isEncryptionAvailable.value = await api.isEncryptionAvailable();
    history.value = await api.loadCSAGameSettingHistory();
    engineSettings.value = await api.loadUSIEngineSetting();
    showModalDialog(dialog.value);
    installHotKeyForDialog(dialog.value);
    defaultValueLoaded = true;
  } catch (e) {
    store.pushError(e);
    store.destroyModalDialog();
  } finally {
    store.releaseBussyState();
  }
});

onBeforeUnmount(() => {
  uninstallHotKeyForDialog(dialog.value);
});

onUpdated(() => {
  if (!defaultValueLoaded || defaultValueApplied) {
    return;
  }
  const defaultSetting = buildCSAGameSettingByHistory(history.value, 0);
  protocolVersion.value.value = selectedProtocolVersion.value =
    defaultSetting.server.protocolVersion;
  host.value.value = defaultSetting.server.host;
  port.value.value = defaultSetting.server.port;
  id.value.value = defaultSetting.server.id;
  password.value.value = defaultSetting.server.password;
  repeat.value.value = defaultSetting.repeat;
  autoRelogin.value = defaultSetting.autoRelogin;
  enableComment.value = defaultSetting.enableComment;
  enableAutoSave.value = defaultSetting.enableAutoSave;
  autoFlip.value = defaultSetting.autoFlip;
  playerURI.value = defaultSetting.player.uri;
  defaultValueApplied = true;
});

const buildPlayerSetting = (playerURI: string): PlayerSetting => {
  if (uri.isUSIEngine(playerURI) && engineSettings.value.hasEngine(playerURI)) {
    const engine = engineSettings.value.getEngine(
      playerURI
    ) as USIEngineSetting;
    return {
      name: engine.name,
      uri: playerURI,
      usi: engine,
    };
  }
  return {
    name: "人",
    uri: uri.ES_HUMAN,
  };
};

const onStart = () => {
  const csaGameSetting: CSAGameSetting = {
    player: buildPlayerSetting(playerURI.value),
    server: {
      protocolVersion: protocolVersion.value.value,
      host: String(host.value.value || "").trim(),
      port: Number(port.value.value),
      id: String(id.value.value || ""),
      password: String(password.value.value || ""),
    },
    repeat: readInputAsNumber(repeat.value),
    autoRelogin: autoRelogin.value,
    enableComment: enableComment.value,
    enableAutoSave: enableAutoSave.value,
    autoFlip: autoFlip.value,
  };
  const error = validateCSAGameSetting(csaGameSetting);
  if (error) {
    store.pushError(error);
  } else {
    store.loginCSAGame(csaGameSetting, {
      saveHistory: saveHistory.value,
    });
  }
};

const onCancel = () => {
  store.closeModalDialog();
};

const onUpdatePlayerSetting = async (settings: USIEngineSettings) => {
  engineSettings.value = settings;
};

const onSelectPlayer = (uri: string) => {
  playerURI.value = uri;
};

const onTogglePasswordVisibility = (value: boolean) => {
  password.value.type = value ? "text" : "password";
};

const onChangeHistory = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const server = history.value.serverHistory[Number(select.value)];
  if (server) {
    protocolVersion.value.value = server.protocolVersion;
    host.value.value = server.host;
    port.value.value = server.port;
    id.value.value = server.id;
    password.value.value = server.password;
  }
};

const onChangeProtocolVersion = () => {
  selectedProtocolVersion.value = protocolVersion.value.value;
};

const logEnabled = computed(() => {
  const appSetting = useAppSetting();
  return (
    appSetting.enableCSALog &&
    appSetting.enableAppLog &&
    appSetting.enableUSILog
  );
});
</script>

<style scoped>
.root {
  width: 560px;
}
input.number {
  width: 100px;
}
.long-text {
  width: 250px;
}
</style>
