const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height, r, g, b, a = 255) {
  // Create RGBA pixel data
  const pixels = [];
  for (let y = 0; y < height; y++) {
    pixels.push(0); // Filter byte for each scanline
    for (let x = 0; x < width; x++) {
      pixels.push(r, g, b, a);
    }
  }
  
  const pixelData = Buffer.from(pixels);
  const compressed = zlib.deflateSync(pixelData);
  
  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(6, 17); // Color type (RGBA)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  ihdr.writeUInt32BE(crc32(ihdr.slice(4, 21)), 21);
  
  // IDAT chunk
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  idat.writeUInt32BE(crc32(idat.slice(4, idat.length - 4)), idat.length - 4);
  
  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

// CRC32 lookup table
const crc32Table = (() => {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

// Create icons directory
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Creating simple placeholder PNG icons...\n');

// Theme color: #4CAF50 (76, 175, 80)
const r = 76, g = 175, b = 80;

// Create 192x192 icon
const icon192 = createPNG(192, 192, r, g, b);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192);
console.log('✓ Created icon-192x192.png (192x192, green)');

// Create 512x512 icon
const icon512 = createPNG(512, 512, r, g, b);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512);
console.log('✓ Created icon-512x512.png (512x512, green)');

// Create maskable 192x192 icon
const iconMaskable192 = createPNG(192, 192, r, g, b);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192x192.png'), iconMaskable192);
console.log('✓ Created icon-maskable-192x192.png (192x192, green)');

// Create maskable 512x512 icon
const iconMaskable512 = createPNG(512, 512, r, g, b);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), iconMaskable512);
console.log('✓ Created icon-maskable-512x512.png (512x512, green)');

console.log('\n✅ All placeholder PNG icons created successfully!');
console.log('📝 Note: These are simple green placeholder icons.');
console.log('   For better icons, you can:');
console.log('   - Replace them with custom designs');
console.log('   - Use the SVG files in assets/icons/ as templates');
console.log('   - Use an online icon generator\n');