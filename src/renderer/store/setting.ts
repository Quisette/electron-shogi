import {
  AppSetting,
  AppSettingUpdate,
  BackgroundImageType,
  BoardImageType,
  BoardLabelType,
  ClockSoundTarget,
  EvaluationViewFrom,
  LeftSideControlType,
  PieceImageType,
  PieceStandImageType,
  PositionImageStyle,
  RightSideControlType,
  Tab,
  TabPaneType,
  TextDecodingRule,
  Thema,
  buildUpdatedAppSetting,
  defaultAppSetting,
} from "@/common/settings/app";
import { UnwrapNestedRefs, reactive } from "vue";
import api from "@/renderer/ipc/api";
import { LogLevel } from "@/common/log";
import { Language } from "@/common/i18n";

class AppSettingStore {
  private setting = defaultAppSetting();

  get raw(): AppSetting {
    return this.setting;
  }
  get language(): Language {
    return this.setting.language;
  }
  get thema(): Thema {
    return this.setting.thema;
  }
  get pieceImage(): PieceImageType {
    return this.setting.pieceImage;
  }
  get backgroundImageType(): BackgroundImageType {
    return this.setting.backgroundImageType;
  }
  get backgroundImageFileURL(): string | undefined {
    return this.setting.backgroundImageFileURL;
  }
  get boardImage(): BoardImageType {
    return this.setting.boardImage;
  }
  get boardImageFileURL(): string | undefined {
    return this.setting.boardImageFileURL;
  }
  get pieceStandImage(): PieceStandImageType {
    return this.setting.pieceStandImage;
  }
  get pieceStandImageFileURL(): string | undefined {
    return this.setting.pieceStandImageFileURL;
  }
  get boardLabelType(): BoardLabelType {
    return this.setting.boardLabelType;
  }
  get leftSideControlType(): LeftSideControlType {
    return this.setting.leftSideControlType;
  }
  get rightSideControlType(): RightSideControlType {
    return this.setting.rightSideControlType;
  }
  get pieceVolume(): number {
    return this.setting.pieceVolume;
  }
  get clockVolume(): number {
    return this.setting.clockVolume;
  }
  get clockPitch(): number {
    return this.setting.clockPitch;
  }
  get clockSoundTarget(): ClockSoundTarget {
    return this.setting.clockSoundTarget;
  }
  get boardFlipping(): boolean {
    return this.setting.boardFlipping;
  }
  get tabPaneType(): TabPaneType {
    return this.setting.tabPaneType;
  }
  get tab(): Tab {
    return this.setting.tab;
  }
  get tab2(): Tab {
    return this.setting.tab2;
  }
  get topPaneHeightPercentage(): number {
    return this.setting.topPaneHeightPercentage;
  }
  get topPanePreviousHeightPercentage(): number {
    return this.setting.topPanePreviousHeightPercentage;
  }
  get bottomLeftPaneWidthPercentage(): number {
    return this.setting.bottomLeftPaneWidthPercentage;
  }
  get textDecodingRule(): TextDecodingRule {
    return this.setting.textDecodingRule;
  }
  get returnCode(): string {
    return this.setting.returnCode;
  }
  get autoSaveDirectory(): string {
    return this.setting.autoSaveDirectory;
  }
  get translateEngineOptionName(): boolean {
    return this.setting.translateEngineOptionName;
  }
  get engineTimeoutSeconds(): number {
    return this.setting.engineTimeoutSeconds;
  }
  get evaluationViewFrom(): EvaluationViewFrom {
    return this.setting.evaluationViewFrom;
  }
  get coefficientInSigmoid(): number {
    return this.setting.coefficientInSigmoid;
  }
  get badMoveLevelThreshold1(): number {
    return this.setting.badMoveLevelThreshold1;
  }
  get badMoveLevelThreshold2(): number {
    return this.setting.badMoveLevelThreshold2;
  }
  get badMoveLevelThreshold3(): number {
    return this.setting.badMoveLevelThreshold3;
  }
  get badMoveLevelThreshold4(): number {
    return this.setting.badMoveLevelThreshold4;
  }
  get showElapsedTimeInRecordView(): boolean {
    return this.setting.showElapsedTimeInRecordView;
  }
  get showCommentInRecordView(): boolean {
    return this.setting.showCommentInRecordView;
  }
  get enableAppLog(): boolean {
    return this.setting.enableAppLog;
  }
  get enableUSILog(): boolean {
    return this.setting.enableUSILog;
  }
  get enableCSALog(): boolean {
    return this.setting.enableCSALog;
  }
  get logLevel(): LogLevel {
    return this.setting.logLevel;
  }
  get positionImageStyle(): PositionImageStyle {
    return this.setting.positionImageStyle;
  }
  get positionImageSize(): number {
    return this.setting.positionImageSize;
  }
  get positionImageHeader(): string {
    return this.setting.positionImageHeader;
  }
  get lastRecordFilePath(): string {
    return this.setting.lastRecordFilePath;
  }
  get lastUSIEngineFilePath(): string {
    return this.setting.lastUSIEngineFilePath;
  }
  get lastImageExportFilePath(): string {
    return this.setting.lastImageExportFilePath;
  }
  get lastOtherFilePath(): string {
    return this.setting.lastOtherFilePath;
  }
  get emptyRecordInfoVisibility(): boolean {
    return this.setting.emptyRecordInfoVisibility;
  }

  async loadAppSetting(): Promise<void> {
    this.setting = await api.loadAppSetting();
  }

  async updateAppSetting(update: AppSettingUpdate): Promise<void> {
    const updated = buildUpdatedAppSetting(this.setting, update);
    if (updated instanceof Error) {
      throw updated;
    }
    await api.saveAppSetting(updated);
    this.setting = updated;
  }

  flipBoard(): void {
    this.setting.boardFlipping = !this.setting.boardFlipping;
    api.saveAppSetting(this.setting);
  }
}

export function createAppSetting(): UnwrapNestedRefs<AppSettingStore> {
  return reactive(new AppSettingStore());
}

let app: UnwrapNestedRefs<AppSettingStore>;

export function useAppSetting(): UnwrapNestedRefs<AppSettingStore> {
  if (!app) {
    app = createAppSetting();
  }
  return app;
}
