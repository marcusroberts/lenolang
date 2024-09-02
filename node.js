// Assume add.wasm file exists that contains a single function adding 2 provided arguments
const { readFile } = require('node:fs/promises');
const { WASI } = require('node:wasi');
const { argv, env } = require('node:process');

let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const wasi = new WASI({
    //version: 'preview1', // node 20 or later
    args: argv,
    env,
  });

  const utf8Decoder = new TextDecoder();
  const utf8Encoder = new TextEncoder();
  let utf8EncodedLen = 0;

  

  let utf8Encode = (s, realloc, memory) => {
    if (typeof s !== 'string') throw new TypeError('expected a string');
    if (s.length === 0) {
      utf8EncodedLen = 0;
      return 1;
    }
    let buf = utf8Encoder.encode(s);
    let ptr = realloc(0, 0, 1, buf.length);
    new Uint8Array(memory.buffer).set(buf, ptr);
    utf8EncodedLen = buf.length;
    return ptr;
  }



  function getlenses(arg0,exports0,memory0,realloc0) {
    var ptr0 = utf8Encode(arg0, realloc0, memory0);
    var len0 = utf8EncodedLen;
    const ret = exports0['leno:lsp/lenses#getlenses'](ptr0, len0);
    var len3 = dataView(memory0).getInt32(ret + 4, true);
    var base3 = dataView(memory0).getInt32(ret + 0, true);
    var result3 = [];
    for (let i = 0; i < len3; i++) {
      const base = base3 + i * 32;
      var ptr1 = dataView(memory0).getInt32(base + 16, true);
      var len1 = dataView(memory0).getInt32(base + 20, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      var ptr2 = dataView(memory0).getInt32(base + 24, true);
      var len2 = dataView(memory0).getInt32(base + 28, true);
      var result2 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr2, len2));
      result3.push({
        range: {
          start: {
            line: dataView(memory0).getInt32(base + 0, true) >>> 0,
            character: dataView(memory0).getInt32(base + 4, true) >>> 0,
          },
          end: {
            line: dataView(memory0).getInt32(base + 8, true) >>> 0,
            character: dataView(memory0).getInt32(base + 12, true) >>> 0,
          },
        },
        command: {
          title: result1,
          command: result2,
        },
      });
    }
    return result3;
  }
  

(async () => {
    const wasm = await WebAssembly.compile(
      await readFile('lsp.gr.wasm'),
    );

    const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
    const instance = await WebAssembly.instantiate(wasm, importObject);  // wasi.getImportObject()

    wasi.start(instance);
    
    const { memory } = instance.exports;

    const realloc = instance.exports.cabi_realloc;

    const result0 = getlenses("let x = 10;",instance.exports, memory,realloc)

    console.log(result0)

  })();