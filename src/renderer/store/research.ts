import { ResearchSetting } from "@/common/settings/research";
import { USIPlayer } from "@/renderer/players/usi";
import { SearchInfo } from "@/renderer/players/player";
import { ImmutableRecord } from "@/common/shogi";
import { USIEngineSetting } from "@/common/settings/usi";
import { SearchInfoSenderType } from "./record";
import { useAppSetting } from "./setting";

function getSenderTypeByIndex(index: number): SearchInfoSenderType | undefined {
  switch (index) {
    case 0:
      return SearchInfoSenderType.RESEARCHER;
    case 1:
      return SearchInfoSenderType.RESEARCHER_2;
    case 2:
      return SearchInfoSenderType.RESEARCHER_3;
    case 3:
      return SearchInfoSenderType.RESEARCHER_4;
    default:
      return undefined;
  }
}

type UpdateSearchInfoCallback = (
  type: SearchInfoSenderType,
  info: SearchInfo
) => void;

export class ResearchManager {
  private engines: USIPlayer[] = [];
  private onUpdateSearchInfo: UpdateSearchInfoCallback = () => {
    /* noop */
  };
  private onError: ErrorCallback = () => {
    /* noop */
  };

  on(event: "updateSearchInfo", handler: UpdateSearchInfoCallback): this;
  on(event: "error", handler: ErrorCallback): this;
  on(event: string, handler: unknown): this {
    switch (event) {
      case "updateSearchInfo":
        this.onUpdateSearchInfo = handler as UpdateSearchInfoCallback;
        break;
      case "error":
        this.onError = handler as ErrorCallback;
        break;
    }
    return this;
  }

  async launch(setting: ResearchSetting) {
    // Validation
    if (setting.usi === undefined) {
      throw new Error("ResearchManager#launch: USIエンジンの設定は必須です。");
    }
    for (const s of setting.secondaries || []) {
      if (s.usi === undefined) {
        throw new Error(
          "ResearchManager#launch: USIエンジンの設定は必須です。"
        );
      }
    }
    if (this.engines.length > 0) {
      throw new Error(
        "ResearchManager#launch: 前回のエンジンが終了していません。数秒待ってからもう一度試してください。"
      );
    }
    // エンジンを設定する。
    const appSetting = useAppSetting();
    const engineSettings = [
      setting.usi,
      ...(setting.secondaries?.map((s) => s.usi) || []),
    ].filter((usi) => !!usi);
    this.engines = engineSettings.map((usi, index) => {
      const type = getSenderTypeByIndex(index);
      return new USIPlayer(
        usi as USIEngineSetting,
        appSetting.engineTimeoutSeconds,
        (info) => {
          if (type !== undefined) {
            this.onUpdateSearchInfo(type, info);
          }
        }
      );
    });
    // エンジンを起動する。
    try {
      await Promise.all(this.engines.map((engine) => engine.launch()));
    } catch (e) {
      this.close();
      throw e;
    }
  }

  updatePosition(record: ImmutableRecord) {
    this.engines.forEach((engine) => engine.startResearch(record));
  }

  close() {
    Promise.allSettled(this.engines.map((engine) => engine.close()))
      .then(() => {
        this.engines = [];
      })
      .catch((e) => {
        this.onError(e);
      });
  }
}
