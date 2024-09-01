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


let getlenses = (exports0,memory0) => {
    const utf8Decoder = new TextDecoder();

    const ret = exports0['leno:lsp/lenses#getlenses']();
    var len2 = dataView(memory0).getInt32(ret + 4, true);
    var base2 = dataView(memory0).getInt32(ret + 0, true);
    var result2 = [];
    for (let i = 0; i < len2; i++) {
      const base = base2 + i * 32;
      var ptr0 = dataView(memory0).getInt32(base + 16, true);
      var len0 = dataView(memory0).getInt32(base + 20, true);
      var result0 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr0, len0));
      var ptr1 = dataView(memory0).getInt32(base + 24, true);
      var len1 = dataView(memory0).getInt32(base + 28, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      result2.push({
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
          title: result0,
          command: result1,
        },
      });
    }
    return result2;
  }
  

(async () => {
    const wasm = await WebAssembly.compile(
      await readFile('lsp.gr.wasm'),
    );

    const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
    const instance = await WebAssembly.instantiate(wasm, importObject);  // wasi.getImportObject()

    wasi.start(instance);
    
    const { memory } = instance.exports;

    const result0 = getlenses(instance.exports, memory)

    console.log(result0)

  })();