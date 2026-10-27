const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 1, 0xff, 0xd9]);

function load(relativePath, dependencies, globals = {}) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require: name => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    Uint8Array, Blob, atob, TextEncoder, ...globals,
  });
  return module.exports;
}

for (const platform of ['android', 'ios', 'web']) {
  test(`${platform}: preserves image bytes through Expo multipart and cleans up`, async () => {
    const files = new Map();
    class NativeBlob {
      constructor() {
        throw new Error('Creating blobs from ArrayBufferView is not supported');
      }
    }
    class File {
      constructor(directory, filename) {
        assert.equal(directory, 'app-cache');
        this.name = filename;
        this.type = 'image/jpeg';
      }
      create() { files.set(this.name, new Uint8Array()); }
      async write(bytes) {
        // Async deliberately: converting before write completes must fail the test.
        await Promise.resolve();
        files.set(this.name, bytes);
      }
      async bytes() { return files.get(this.name); }
      delete() { files.delete(this.name); }
    }
    const BlobClass = platform === 'web' ? Blob : NativeBlob;
    const store = load('src/services/notaFiscalCapture.ts', {
      'expo-file-system': { File, Paths: { cache: 'app-cache' } },
      'react-native': { Platform: { OS: platform } },
    }, { Blob: BlobClass });
    const converter = load('node_modules/expo/src/winter/fetch/convertFormData.ts', {
      '../../utils/blobUtils': { blobToArrayBufferAsync: blob => blob.arrayBuffer() },
    }, { Blob: BlobClass });
    const photo = store.saveNotaFiscalCapture(Buffer.from(jpeg).toString('base64'), 'image/jpeg');
    assert.equal(store.getNotaFiscalCapture(photo.id).uri, `data:image/jpeg;base64,${photo.base64}`);
    const attachment = await store.createNotaFiscalAttachment(photo);
    // Expo FormData keeps File objects intact; Node FormData stringifies them.
    const form = { entries: () => [['preco', '10.00'], ['imagem', attachment.blob]] };
    const converted = await converter.convertFormDataAsync(form, 'test-boundary');
    const multipart = Buffer.from(converted.body);
    assert.ok(multipart.includes(Buffer.from(jpeg)));
    assert.ok(multipart.includes(Buffer.from('content-type: image/jpeg')));
    if (platform !== 'web') {
      assert.ok(multipart.includes(Buffer.from(`filename="${attachment.blob.name}"`)));
      assert.equal(files.size, 1);
    }
    attachment.dispose();
    assert.equal(files.size, 0);
    // A failed request can retry from the retained capture after temp-file cleanup.
    const retry = await store.createNotaFiscalAttachment(store.getNotaFiscalCapture(photo.id));
    retry.dispose();
    store.clearNotaFiscalCapture(photo.id);
    assert.equal(store.getNotaFiscalCapture(photo.id), null);
  });
}
