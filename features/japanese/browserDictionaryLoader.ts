import DynamicDictionaries from "kuromoji/src/dict/DynamicDictionaries";
import zlib from "zlibjs/bin/gunzip.min.js";

function joinUrl(base: string, filename: string): string {
  return base.replace(/\/$/, "") + "/" + filename;
}

function decompressIfNeeded(buffer: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const gz = new zlib.Zlib.Gunzip(bytes);
    const decompressed = gz.decompress();
    return decompressed.buffer as ArrayBuffer;
  }
  return buffer;
}

export class BrowserDictionaryLoader {
  dic_path: string;

  constructor(dic_path: string) {
    this.dic_path = dic_path;
  }

  load(callback: (err: Error | null, dic?: unknown) => void): void {
    const dic = new DynamicDictionaries();
    const fileNames = [
      "base.dat.gz",
      "check.dat.gz",
      "tid.dat.gz",
      "tid_pos.dat.gz",
      "tid_map.dat.gz",
      "cc.dat.gz",
      "unk.dat.gz",
      "unk_pos.dat.gz",
      "unk_map.dat.gz",
      "unk_char.dat.gz",
      "unk_compat.dat.gz",
      "unk_invoke.dat.gz"
    ];

    Promise.all(
      fileNames.map(async (name) => {
        const url = joinUrl(this.dic_path, name);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url} (HTTP ${res.status})`);
        }
        const arrayBuffer = await res.arrayBuffer();
        return decompressIfNeeded(arrayBuffer);
      })
    )
      .then((buffers) => {
        const [
          base,
          check,
          tid,
          tid_pos,
          tid_map,
          cc,
          unk,
          unk_pos,
          unk_map,
          unk_char,
          unk_compat,
          unk_invoke
        ] = buffers;

        dic.loadTrie(new Int32Array(base), new Int32Array(check));
        dic.loadTokenInfoDictionaries(
          new Uint8Array(tid),
          new Uint8Array(tid_pos),
          new Uint8Array(tid_map)
        );
        dic.loadConnectionCosts(new Int16Array(cc));
        dic.loadUnknownDictionaries(
          new Uint8Array(unk),
          new Uint8Array(unk_pos),
          new Uint8Array(unk_map),
          new Uint8Array(unk_char),
          new Uint32Array(unk_compat),
          new Uint8Array(unk_invoke)
        );

        callback(null, dic);
      })
      .catch((err: unknown) => {
        callback(err instanceof Error ? err : new Error(String(err)));
      });
  }
}

// Support both ES module default and CommonJS module.exports / interop
(BrowserDictionaryLoader as unknown as { default: typeof BrowserDictionaryLoader }).default = BrowserDictionaryLoader;

export default BrowserDictionaryLoader;
