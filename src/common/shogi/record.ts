import {
  Position,
  DoMoveOption,
  ImmutablePosition,
  Move,
  Color,
  reverseColor,
  parseUSIMove,
  InvalidUSIError,
  InvalidMoveError,
} from ".";
import { millisecondsToHMMSS, millisecondsToMSS } from "@/common/helpers/time";
import { getMoveDisplayText, getSpecialMoveDisplayString } from "./text";

export enum RecordMetadataKey {
  // 柿木形式で規定されている項目
  TITLE = "title", // 表題
  BLACK_NAME = "blackName", // 先手
  WHITE_NAME = "whiteName", // 後手
  START_DATETIME = "startDatetime", // 開始日時
  END_DATETIME = "endDatetime", // 終了日時
  DATE = "date", // 対局日
  TOURNAMENT = "tournament", // 棋戦
  STRATEGY = "strategy", // 戦型
  TIME_LIMIT = "timeLimit", // 持ち時間
  TIME_SPENT = "timeSpent", // 消費時間
  PLACE = "place", // 場所
  POSTED_ON = "postedOn", // 掲載
  NOTE = "note", // 備考
  BLACK_SHORT_NAME = "blackShortName", // 先手省略名
  WHITE_SHORT_NAME = "whiteShortName", // 後手省略名

  // 柿木形式で規定されている詰将棋に関する項目
  OPUS_NO = "opusNo", // 作品番号
  OPUS_NAME = "opusName", // 作品名
  AUTHOR = "author", // 作者
  PUBLISHED_BY = "publishedBy", // 発表誌
  PUBLISHED_AT = "publishedAt", // 発表年月
  SOURCE = "source", // 出典
  LENGTH = "length", // 手数
  INTEGRITY = "integrity", // 完全性
  CATEGORY = "category", // 分類
  AWARD = "award", // 受賞
}

export interface ImmutableRecordMetadata {
  get standardMetadataKeys(): IterableIterator<RecordMetadataKey>;
  getStandardMetadata(key: RecordMetadataKey): string | undefined;
  get customMetadataKeys(): IterableIterator<string>;
  getCustomMetadata(key: string): string | undefined;
}

export class RecordMetadata {
  private standard = new Map<RecordMetadataKey, string>();
  private custom = new Map<string, string>();

  get standardMetadataKeys(): IterableIterator<RecordMetadataKey> {
    return this.standard.keys();
  }

  getStandardMetadata(key: RecordMetadataKey): string | undefined {
    return this.standard.get(key);
  }

  setStandardMetadata(key: RecordMetadataKey, value: string): void {
    if (value) {
      this.standard.set(key, value);
    } else {
      this.standard.delete(key);
    }
  }

  get customMetadataKeys(): IterableIterator<string> {
    return this.custom.keys();
  }

  getCustomMetadata(key: string): string | undefined {
    return this.custom.get(key);
  }

  setCustomMetadata(key: string, value: string): void {
    if (value) {
      this.custom.set(key, value);
    } else {
      this.custom.delete(key);
    }
  }
}

export enum SpecialMove {
  START = "start",
  INTERRUPT = "interrupt",
  RESIGN = "resign",
  IMPASS = "impass",
  DRAW = "draw",
  REPETITION_DRAW = "repetitionDraw",
  MATE = "mate",
  TIMEOUT = "timeout",
  FOUL_WIN = "foulWin", // 手番側の勝ち(直前の指し手が反則手)
  FOUL_LOSE = "foulLose", // 手番側の負け
  ENTERING_OF_KING = "enteringOfKing",
  WIN_BY_DEFAULT = "winByDefault",
  LOSE_BY_DEFAULT = "loseByDefault",
  SEALED_MOVE = "sealedMove",
}

export interface ImmutableNode {
  readonly number: number;
  readonly prev: Node | null;
  readonly next: Node | null;
  readonly branch: Node | null;
  readonly branchIndex: number;
  readonly activeBranch: boolean;
  readonly nextColor: Color;
  readonly move: Move | SpecialMove;
  readonly isCheck: boolean;
  readonly comment: string;
  readonly customData: unknown;
  readonly displayText: string;
  readonly timeText: string;
  readonly hasBranch: boolean;
  readonly isFirstBranch: boolean;
  readonly isLastMove: boolean;
  readonly elapsedMs: number;
  readonly totalElapsedMs: number;
}

export interface Node extends ImmutableNode {
  comment: string;
  customData: unknown;
  setElapsedMs(elapsedMs: number): void;
}

class NodeImpl implements Node {
  public next: NodeImpl | null = null;
  public branch: NodeImpl | null = null;
  public comment = "";
  public customData: unknown;
  public elapsedMs = 0;
  public totalElapsedMs = 0;

  constructor(
    public number: number,
    public prev: NodeImpl | null,
    public branchIndex: number,
    public activeBranch: boolean,
    public nextColor: Color,
    public move: Move | SpecialMove,
    public isCheck: boolean,
    public displayText: string
  ) {}

  get timeText(): string {
    const elapsed = millisecondsToMSS(this.elapsedMs);
    const totalElapsed = millisecondsToHMMSS(this.totalElapsedMs);
    return `${elapsed} / ${totalElapsed}`;
  }

  get hasBranch(): boolean {
    return !!this.prev && !!this.prev.next && !!this.prev.next.branch;
  }

  get isFirstBranch(): boolean {
    return !this.prev || this.prev.next === this;
  }

  get isLastMove(): boolean {
    if (!this.next) {
      return true;
    }
    for (let p: Node | null = this.next; p; p = p.branch) {
      if (p.move instanceof Move) {
        return false;
      }
    }
    return true;
  }

  private updateTotalElapsedMs() {
    this.totalElapsedMs = this.elapsedMs;
    if (this.prev && this.prev.prev) {
      this.totalElapsedMs += this.prev.prev.totalElapsedMs;
    }
  }

  setElapsedMs(elapsedMs: number): void {
    this.elapsedMs = elapsedMs;
    this.updateTotalElapsedMs();
    let p = this.next;
    const stack: NodeImpl[] = [];
    while (p) {
      p.updateTotalElapsedMs();
      if (p.branch) {
        stack.push(p.branch);
      }
      if (p.next) {
        p = p.next;
      } else {
        p = stack.pop() || null;
      }
    }
  }

  static newRootEntry(color: Color): NodeImpl {
    return new NodeImpl(
      0, // number
      null, // prev
      0, // branchIndex
      true, // activeBranch
      color, // color
      SpecialMove.START, // move
      false, // isCheck
      "開始局面" // displayText
    );
  }
}

export interface ImmutableRecord {
  readonly metadata: ImmutableRecordMetadata;
  readonly initialPosition: ImmutablePosition;
  readonly position: ImmutablePosition;
  readonly first: ImmutableNode;
  readonly current: ImmutableNode;
  readonly moves: Array<ImmutableNode>;
  readonly movesBefore: Array<ImmutableNode>;
  readonly length: number;
  readonly branchBegin: ImmutableNode;
  readonly repetition: boolean;
  readonly perpetualCheck: Color | null;
  readonly usi: string;
  readonly usiAll: string;
  readonly sfen: string;
  // 深さ優先で全てのノードを訪問します。
  forEach(handler: (node: ImmutableNode) => void): void;
  on(event: "changePosition", handler: () => void): void;
}

export class Record {
  public metadata: RecordMetadata;
  private _initialPosition: ImmutablePosition;
  private _position: Position;
  private _first: NodeImpl;
  private _current: NodeImpl;
  private repetitionCounts: { [sfen: string]: number } = {};
  private repetitionStart: { [sfen: string]: number } = {};
  private onChangePosition = (): void => {
    /* noop */
  };

  constructor(position?: ImmutablePosition) {
    this.metadata = new RecordMetadata();
    this._initialPosition = position ? position.clone() : new Position();
    this._position = this.initialPosition.clone();
    this._first = NodeImpl.newRootEntry(this._initialPosition.color);
    this._current = this._first;
    this.incrementRepetition();
  }

  get initialPosition(): ImmutablePosition {
    return this._initialPosition;
  }

  get position(): ImmutablePosition {
    return this._position;
  }

  get first(): Node {
    return this._first;
  }

  get current(): Node {
    return this._current;
  }

  get moves(): Array<Node> {
    const moves = this.movesBefore;
    for (let p = this._current.next; p; p = p.next) {
      while (!p.activeBranch) {
        p = p.branch as NodeImpl;
      }
      moves.push(p);
    }
    return moves;
  }

  get movesBefore(): Array<Node> {
    return this._movesBefore;
  }

  private get _movesBefore(): Array<NodeImpl> {
    const moves = new Array<NodeImpl>();
    moves.unshift(this._current);
    for (let p = this._current.prev; p; p = p.prev) {
      moves.unshift(p);
    }
    return moves;
  }

  get length(): number {
    let len = this._current.number;
    for (let p = this._current.next; p; p = p.next) {
      while (!p.activeBranch) {
        p = p.branch as NodeImpl;
      }
      len = p.number;
    }
    return len;
  }

  get branchBegin(): Node {
    return this._current.prev
      ? (this._current.prev.next as Node)
      : this._current;
  }

  clear(position?: ImmutablePosition): void {
    this.metadata = new RecordMetadata();
    if (position) {
      this._initialPosition = position.clone();
    }
    this._position = this.initialPosition.clone();
    this._first = NodeImpl.newRootEntry(this._initialPosition.color);
    this._current = this._first;
    this.repetitionCounts = {};
    this.repetitionStart = {};
    this.incrementRepetition();
    this.onChangePosition();
  }

  goBack(): boolean {
    if (this._goBack()) {
      this.onChangePosition();
      return true;
    }
    return false;
  }

  private _goBack(): boolean {
    if (this._current.prev) {
      if (this._current.move instanceof Move) {
        this.decrementRepetition();
        this._position.undoMove(this._current.move);
      }
      this._current = this._current.prev;
      return true;
    }
    return false;
  }

  goForward(): boolean {
    if (this._goForward()) {
      this.onChangePosition();
      return true;
    }
    return false;
  }

  private _goForward(): boolean {
    if (this._current.next) {
      this._current = this._current.next;
      while (!this._current.activeBranch) {
        this._current = this._current.branch as NodeImpl;
      }
      if (this._current.move instanceof Move) {
        this._position.doMove(this._current.move, {
          ignoreValidation: true,
        });
        this.incrementRepetition();
      }
      return true;
    }
    return false;
  }

  goto(number: number): void {
    while (number < this._current.number) {
      if (!this._goBack()) {
        break;
      }
    }
    while (number > this._current.number) {
      if (!this._goForward()) {
        break;
      }
    }
    this.onChangePosition();
  }

  resetAllBranchSelection(): void {
    this._forEach((node) => {
      node.activeBranch = node.isFirstBranch;
    });
  }

  switchBranchByIndex(index: number): boolean {
    if (this.current.branchIndex === index) {
      return true;
    }
    if (!this._current.prev) {
      return false;
    }
    let ok = false;
    for (let p = this._current.prev.next; p; p = p.branch) {
      if (p.branchIndex === index) {
        p.activeBranch = true;
        if (this._current.move instanceof Move) {
          this.decrementRepetition();
          this._position.undoMove(this._current.move);
        }
        this._current = p;
        if (this._current.move instanceof Move) {
          this._position.doMove(this._current.move, {
            ignoreValidation: true,
          });
          this.incrementRepetition();
        }
        ok = true;
      } else {
        p.activeBranch = false;
      }
    }
    if (ok) {
      this.onChangePosition();
    }
    return ok;
  }

  append(move: Move | SpecialMove, opt?: DoMoveOption): boolean {
    // 指し手を表す文字列を取得する。
    const prevMove =
      this.current.move instanceof Move ? this.current.move : undefined;
    const displayText =
      move instanceof Move
        ? getMoveDisplayText(this.position, move, { prev: prevMove })
        : getSpecialMoveDisplayString(move);

    // 局面を動かす。
    let isCheck = false;
    if (move instanceof Move) {
      if (!this._position.doMove(move, opt)) {
        return false;
      }
      this.incrementRepetition();
      isCheck = this.position.checked;
    }

    // 特殊な指し手のノードの場合は前のノードに戻る。
    if (this._current !== this.first && !(this._current.move instanceof Move)) {
      this.goBack();
    }

    // 最終ノードの場合は単に新しいノードを追加する。
    if (!this._current.next) {
      this._current.next = new NodeImpl(
        this._current.number + 1, // number
        this._current, // prev
        0, // branchIndex
        true, // activeBranch
        this.position.color, // nextColor
        move,
        isCheck,
        displayText
      );
      this._current = this._current.next;
      this._current.setElapsedMs(0);
      this.onChangePosition();
      return true;
    }

    // 既存の兄弟ノードから選択を解除する。
    let p: NodeImpl | null;
    for (p = this._current.next; p; p = p.branch) {
      p.activeBranch = false;
    }

    // 同じ指し手が既に存在する場合はそのノードへ移動して終わる。
    let lastBranch = this._current.next;
    for (p = this._current.next; p; p = p.branch) {
      if (
        (p.move instanceof Move &&
          move instanceof Move &&
          move.equals(p.move)) ||
        move === p.move
      ) {
        this._current = p;
        this._current.activeBranch = true;
        this.onChangePosition();
        return true;
      }
      lastBranch = p;
    }

    // 兄弟ノードを追加する。
    this._current = new NodeImpl(
      this._current.number + 1, // number
      this._current, // prev
      lastBranch.branchIndex + 1, // branchIndex
      true, // activeBranch
      this.position.color, // nextColor
      move,
      isCheck,
      displayText
    );
    this._current.setElapsedMs(0);
    lastBranch.branch = this._current;
    this.onChangePosition();
    return true;
  }

  swapWithNextBranch(): boolean {
    if (!this._current.branch) {
      return false;
    }
    return Record.swapWithPreviousBranch(this._current.branch);
  }

  swapWithPreviousBranch(): boolean {
    return Record.swapWithPreviousBranch(this._current);
  }

  private static swapWithPreviousBranch(target: NodeImpl): boolean {
    const prev = target.prev;
    if (!prev || !prev.next || prev.next == target) {
      return false;
    }
    if (prev.next.branch === target) {
      const pair = prev.next;
      pair.branch = target.branch;
      target.branch = pair;
      prev.next = target;
      [target.branchIndex, pair.branchIndex] = [
        pair.branchIndex,
        target.branchIndex,
      ];
      return true;
    }
    for (let p = prev.next; p.branch; p = p.branch) {
      if (p.branch.branch === target) {
        const pair = p.branch;
        pair.branch = target.branch;
        target.branch = pair;
        p.branch = target;
        [target.branchIndex, pair.branchIndex] = [
          pair.branchIndex,
          target.branchIndex,
        ];
        return true;
      }
    }
    return false;
  }

  removeCurrentMove(): void {
    const target = this._current;
    if (!this.goBack()) {
      this._current.next = null;
      return;
    }
    if (this._current.next === target) {
      this._current.next = target.branch;
    } else {
      for (let p = this._current.next; p; p = p.branch) {
        if (p.branch === target) {
          p.branch = target.branch;
          break;
        }
      }
    }
    let branchIndex = 0;
    for (let p = this._current.next; p; p = p.branch) {
      p.branchIndex = branchIndex;
      branchIndex += 1;
    }
    if (this._current.next) {
      this._current.next.activeBranch = true;
    }
    this.onChangePosition();
  }

  removeNextMove(): void {
    this._current.next = null;
  }

  private incrementRepetition(): void {
    const sfen = this.position.sfen;
    if (this.repetitionCounts[sfen]) {
      this.repetitionCounts[sfen] += 1;
    } else {
      this.repetitionCounts[sfen] = 1;
      this.repetitionStart[sfen] = this.current.number;
    }
  }

  private decrementRepetition(): void {
    const sfen = this.position.sfen;
    this.repetitionCounts[sfen] -= 1;
    if (this.repetitionCounts[sfen] === 0) {
      delete this.repetitionCounts[sfen];
      delete this.repetitionStart[sfen];
    }
  }

  get repetition(): boolean {
    return this.repetitionCounts[this.position.sfen] >= 4;
  }

  get perpetualCheck(): Color | null {
    if (!this.repetition) {
      return null;
    }
    const sfen = this.position.sfen;
    const since = this.repetitionStart[sfen];
    let black = true;
    let white = true;
    let color = this.position.color;
    for (let p = this.current; p.number >= since; p = p.prev as Node) {
      color = reverseColor(color);
      if (p.isCheck) {
        continue;
      }
      if (color === Color.BLACK) {
        black = false;
      } else {
        white = false;
      }
    }
    return black ? Color.BLACK : white ? Color.WHITE : null;
  }

  // USI プロトコルの position コマンドを返却します。
  // USI プロトコルでは平手の場合に "position startpos" を使用することができるとされていますが、
  // 一貫性を持たせるために "position sfen" のみを使用します。
  get usi(): string {
    let ret = "position sfen " + this.initialPosition.sfen + " moves";
    this.movesBefore.forEach((node) => {
      if (node.move instanceof Move) {
        ret += " " + node.move.usi;
      }
    });
    return ret;
  }

  get usiAll(): string {
    let ret = this.usi;
    for (let p = this._current.next; p; p = p.next) {
      while (!p.activeBranch) {
        p = p.branch as NodeImpl;
      }
      if (p.move instanceof Move) {
        ret += " " + p.move.usi;
      }
    }
    return ret;
  }

  get sfen(): string {
    return this.position.getSFEN(this._current.number + 1);
  }

  // 深さ優先で全てのノードを訪問します。
  forEach(handler: (node: Node) => void): void {
    this._forEach(handler);
  }

  private _forEach(handler: (node: NodeImpl) => void): void {
    let p: NodeImpl | null = this._first;
    const stack: NodeImpl[] = [];
    while (p) {
      handler(p);
      if (p.branch) {
        stack.push(p.branch);
      }
      if (p.next) {
        p = p.next;
      } else {
        p = stack.pop() || null;
      }
    }
  }

  on(event: "changePosition", handler: () => void): void;
  on(event: string, handler: unknown): void {
    switch (event) {
      case "changePosition":
        this.onChangePosition = handler as () => void;
        break;
    }
  }

  static newByUSI(data: string): Record | Error {
    const prefixPositionStartpos = "position startpos ";
    const prefixPositionSfen = "position sfen ";
    const prefixStartpos = "startpos ";
    const prefixSfen = "sfen ";
    const prefixMoves = "moves ";
    if (data.startsWith(prefixPositionStartpos)) {
      return Record.newByUSIFromMoves(
        new Position(),
        data.slice(prefixPositionStartpos.length)
      );
    } else if (data.startsWith(prefixPositionSfen)) {
      return Record.newByUSIFromSFEN(data.slice(prefixPositionSfen.length));
    } else if (data.startsWith(prefixStartpos)) {
      return Record.newByUSIFromMoves(
        new Position(),
        data.slice(prefixStartpos.length)
      );
    } else if (data.startsWith(prefixSfen)) {
      return Record.newByUSIFromSFEN(data.slice(prefixSfen.length));
    } else if (data.startsWith(prefixMoves)) {
      return Record.newByUSIFromMoves(new Position(), data);
    } else {
      return new InvalidUSIError(data);
    }
  }

  private static newByUSIFromSFEN(data: string): Record | Error {
    const sections = data.split(" ");
    if (sections.length < 4) {
      return new InvalidUSIError(data);
    }
    const position = Position.newBySFEN(sections.slice(0, 4).join(" "));
    if (!position) {
      return new InvalidUSIError(data);
    }
    return Record.newByUSIFromMoves(position, sections.slice(4).join(" "));
  }

  private static newByUSIFromMoves(
    position: ImmutablePosition,
    data: string
  ): Record | Error {
    const record = new Record(position);
    if (data.length === 0) {
      return record;
    }
    const sections = data.split(" ");
    if (sections[0] !== "moves") {
      return new InvalidUSIError(data);
    }
    for (let i = 1; i < sections.length; i++) {
      const parsed = parseUSIMove(sections[i]);
      if (!parsed) {
        break;
      }
      let move = record.position.createMove(parsed.from, parsed.to);
      if (!move) {
        return new InvalidMoveError(sections[i]);
      }
      if (parsed.promote) {
        move = move.withPromote();
      }
      record.append(move, { ignoreValidation: true });
    }
    return record;
  }
}

export function getNextColorFromUSI(usi: string): Color {
  const sections = usi.trim().split(" ");
  if (sections[1] === "startpos" || sections[3] === "b") {
    return sections.length % 2 === 1 ? Color.BLACK : Color.WHITE;
  }
  return sections.length % 2 === 0 ? Color.BLACK : Color.WHITE;
}
