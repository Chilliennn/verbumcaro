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

declare module "kuromoji/src/dict/DynamicDictionaries" {
  const DynamicDictionaries: new () => {
    loadTrie(base: Int32Array, check: Int32Array): void;
    loadTokenInfoDictionaries(token_info_buffer: Uint8Array, pos_buffer: Uint8Array, target_map_buffer: Uint8Array): void;
    loadConnectionCosts(connection_costs_buffer: Int16Array): void;
    loadUnknownDictionaries(
      unk_buffer: Uint8Array,
      unk_pos_buffer: Uint8Array,
      unk_map_buffer: Uint8Array,
      cat_map_buffer: Uint8Array,
      compat_cat_map_buffer: Uint32Array,
      invoke_def_buffer: Uint8Array
    ): void;
  };
  export default DynamicDictionaries;
}

declare module "zlibjs/bin/gunzip.min.js" {
  export namespace Zlib {
    class Gunzip {
      constructor(data: Uint8Array);
      decompress(): Uint8Array;
    }
  }
  const zlib: {
    Zlib: {
      Gunzip: new (data: Uint8Array) => {
        decompress(): Uint8Array;
      };
    };
  };
  export default zlib;
}