import { useEffect, useState } from "react";
import type { ReaderState } from "../../features/reader/readerTypes";
import { DEFAULT_READER_STATE, loadReaderState, saveReaderState } from "../../features/reader/readerStore";
import { getUrlState, updateUrl } from "../ui/useUrlState";

export function useReader(): [ReaderState, React.Dispatch<React.SetStateAction<ReaderState>>] {
  const [reader, setReader] = useState<ReaderState>(() => ({
    ...DEFAULT_READER_STATE,
    ...loadReaderState(),
    ...getUrlState()
  }));

  useEffect(() => {
    saveReaderState(reader);
    updateUrl(reader);
  }, [reader]);

  return [reader, setReader];
}