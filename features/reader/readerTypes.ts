export interface PassageState {
  bookCode: string;
  chapter: number;
  verseFilter?: { start: number; end: number };
}

export interface PanelState extends PassageState {
  translationId: string;
  passages?: PassageState[];
  bookCode: string;
  chapter: number;
  verseFilter?: { start: number; end: number };
}

export type SyncMode = "off" | "verse";

export interface ReaderState {
  left: PanelState;
  right: PanelState;
  sync: SyncMode;
  showHeadings: boolean;
  parallel: boolean;
  search?: string;
}
