export interface PanelState {
  translationId: string;
  bookCode: string;
  chapter: number;
}

export type SyncMode = "off" | "verse";

export interface ReaderState {
  left: PanelState;
  right: PanelState;
  sync: SyncMode;
  showHeadings: boolean;
  parallel: boolean;
}
