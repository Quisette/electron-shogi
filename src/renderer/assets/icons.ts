import preloadImage from "./preload";

export enum IconType {
  BUSY = "busy",
  ERROR = "error",
  INFO = "info",
  GAME = "game",
  INTERNET = "internet",
  STOP = "stop",
  RESIGN = "resign",
  RESEARCH = "research",
  END = "end",
  QUIZ = "quiz",
  EDIT = "edit",
  CHECK = "check",
  SWAP = "swap",
  SWAP_H = "swap_h",
  SETTINGS = "settings",
  ENGINE_SETTINGS = "engineSettings",
  FLIP = "flip",
  FILE = "file",
  OPEN = "open",
  SAVE = "save",
  SAVE_AS = "saveAs",
  PASTE = "paste",
  COPY = "copy",
  DELETE = "delete",
  COMMENT = "comment",
  BRAIN = "brain",
  PV = "pv",
  CHART = "chart",
  PERCENT = "percent",
  MONITOR = "monitor",
  ARROW_DROP = "arrowDrop",
  ARROW_UP = "arrowUp",
  FIRST = "first",
  BACK = "back",
  NEXT = "next",
  LAST = "last",
  QUESTION = "question",
  ANALYSIS = "analysis",
  DESCRIPTION = "description",
  PLAY = "play",
  CLOSE = "close",
  CALL = "call",
  SCORE = "score",
  GRID = "grid",
  MATE_SEARCH = "mateSearch",
  ADD = "add",
  TREE = "tree",
  NOTE = "note",
  BATCH = "batch",
  OPEN_FOLDER = "openFolder",
  HISTORY = "history",
  PAUSE = "pause",
  RESUME = "resume",
  HELP = "help",
  LICENSE = "license",
  LINK = "link",
  SHARE = "share",
  EQUALIZER = "equalizer",
  REFRESH = "refresh",
}

export const iconSourceMap = {
  [IconType.BUSY]: "icon/hourglass_empty.svg",
  [IconType.ERROR]: "icon/error_outline.svg",
  [IconType.INFO]: "icon/info.svg",
  [IconType.GAME]: "icon/sports_esports.svg",
  [IconType.INTERNET]: "icon/language_FILL0.svg",
  [IconType.STOP]: "icon/block.svg",
  [IconType.RESIGN]: "icon/flag.svg",
  [IconType.RESEARCH]: "icon/science.svg",
  [IconType.END]: "icon/do_disturb_on.svg",
  [IconType.QUIZ]: "icon/quiz_FILL0.svg",
  [IconType.EDIT]: "icon/app_registration.svg",
  [IconType.CHECK]: "icon/check_circle.svg",
  [IconType.SWAP]: "icon/swap_vert.svg",
  [IconType.SWAP_H]: "icon/swap_horiz.svg",
  [IconType.SETTINGS]: "icon/settings.svg",
  [IconType.ENGINE_SETTINGS]: "icon/settings_input_component.svg",
  [IconType.FLIP]: "icon/flip_camera_android.svg",
  [IconType.FILE]: "icon/draft_FILL0.svg",
  [IconType.OPEN]: "icon/file_open_FILL0.svg",
  [IconType.SAVE]: "icon/save_FILL0.svg",
  [IconType.SAVE_AS]: "icon/save_as_FILL0.svg",
  [IconType.PASTE]: "icon/content_paste.svg",
  [IconType.COPY]: "icon/content_copy.svg",
  [IconType.DELETE]: "icon/backspace.svg",
  [IconType.COMMENT]: "icon/edit_note.svg",
  [IconType.BRAIN]: "icon/psychology.svg",
  [IconType.PV]: "icon/manage_search_FILL0.svg",
  [IconType.CHART]: "icon/show_chart.svg",
  [IconType.PERCENT]: "icon/percent.svg",
  [IconType.MONITOR]: "icon/browse_activity_FILL0.svg",
  [IconType.ARROW_DROP]: "icon/arrow_drop_down.svg",
  [IconType.ARROW_UP]: "icon/arrow_drop_up_FILL0.svg",
  [IconType.FIRST]: "icon/first_page.svg",
  [IconType.BACK]: "icon/chevron_left.svg",
  [IconType.NEXT]: "icon/chevron_right.svg",
  [IconType.LAST]: "icon/last_page.svg",
  [IconType.QUESTION]: "icon/help.svg",
  [IconType.ANALYSIS]: "icon/query_stats.svg",
  [IconType.DESCRIPTION]: "icon/description.svg",
  [IconType.PLAY]: "icon/play_arrow_FILL1.svg",
  [IconType.CLOSE]: "icon/close_FILL0.svg",
  [IconType.CALL]: "icon/record_voice_over_FILL0.svg",
  [IconType.SCORE]: "icon/scoreboard_FILL0.svg",
  [IconType.GRID]: "icon/grid_on_FILL0.svg",
  [IconType.MATE_SEARCH]: "icon/psychology_alt_FILL0.svg",
  [IconType.ADD]: "icon/add_circle_FILL0.svg",
  [IconType.TREE]: "icon/account_tree_FILL0.svg",
  [IconType.NOTE]: "icon/note_alt_FILL0.svg",
  [IconType.BATCH]: "icon/home_storage_FILL0.svg",
  [IconType.OPEN_FOLDER]: "icon/folder_open_FILL0.svg",
  [IconType.HISTORY]: "icon/history_FILL0.svg",
  [IconType.PAUSE]: "icon/pause_circle_FILL0.svg",
  [IconType.RESUME]: "icon/play_circle_FILL0.svg",
  [IconType.HELP]: "icon/help_FILL0.svg",
  [IconType.LICENSE]: "icon/license_FILL0.svg",
  [IconType.LINK]: "icon/open_in_new_FILL0.svg",
  [IconType.SHARE]: "icon/share_FILL0.svg",
  [IconType.EQUALIZER]: "icon/instant_mix_FILL0.svg",
  [IconType.REFRESH]: "icon/refresh_FILL0.svg",
};

Object.values(iconSourceMap).forEach((source) => {
  preloadImage(source);
});
