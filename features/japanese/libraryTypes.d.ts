declare module "kuroshiro" {
  interface ConvertOptions {
    to?: "hiragana" | "katakana" | "romaji";
    mode?: "normal" | "spaced" | "okurigana" | "furigana";
    romajiSystem?: "nippon" | "passport" | "hepburn";
  }

  interface KuroshiroInstance {
    init(analyzer: unknown): Promise<void>;
    convert(text: string, options?: ConvertOptions): Promise<string>;
  }

  const Kuroshiro: new () => KuroshiroInstance;
  export default Kuroshiro;
}

declare module "kuroshiro-analyzer-kuromoji" {
  interface AnalyzerOptions {
    dictPath?: string;
  }

  export interface Token {
    surface_form: string;
    basic_form: string;
    reading?: string;
    pronunciation?: string;
    pos: string;
    pos_detail_1: string;
  }

  const KuromojiAnalyzer: new (options?: AnalyzerOptions) => {
    init(): Promise<void>;
    parse(text: string): Promise<Token[]>;
  };

  export default KuromojiAnalyzer;
}

declare module "kuroshiro-analyzer-kuromoji/dist/kuroshiro-analyzer-kuromoji.js" {
  export * from "kuroshiro-analyzer-kuromoji";
  import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
  export default KuromojiAnalyzer;
}