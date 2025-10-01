const fs = require('fs');
const path = require('path');

// Simple PNG creator using Canvas if available
async function createIcons() {
  try {
    // Try to load canvas
    const { createCanvas } = require('canvas');
    
    function createBookIcon(size, isMaskable = false) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Colors
      const bgColor = '#4CAF50';
      const bookColor = '#FFFFFF';
      const spineColor = '#e6e6e6';
      const pageColor = '#c8c8c8';
      
      // Calculate safe zone for maskable icons
      const padding = isMaskable ? size * 0.2 : size * 0.1;
      
      // Draw background
      if (isMaskable) {
        // Circular background for maskable
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Rounded rectangle background
        const radius = size * 0.1;
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.fill();
      }
      
      // Book dimensions
      const bookWidth = size - (padding * 2);
      const bookHeight = bookWidth * 1.3;
      const bookX = padding;
      const bookY = (size - bookHeight) / 2;
      const bookRadius = size * 0.03;
      
      // Draw book cover
      ctx.fillStyle = bookColor;
      ctx.beginPath();
      ctx.roundRect(bookX, bookY, bookWidth, bookHeight, bookRadius);
      ctx.fill();
      
      // Draw spine
      ctx.fillStyle = spineColor;
      ctx.fillRect(bookX, bookY, bookWidth * 0.08, bookHeight);
      
      // Draw page lines
      ctx.strokeStyle = pageColor;
      ctx.lineWidth = 2;
      const pageOffset = bookWidth * 0.93;
      const lineSpacing = bookHeight * 0.1;
      
      for (let i = 0; i < 3; i++) {
        const yPos = bookY + (i + 2) * lineSpacing;
        if (yPos < bookY + bookHeight - lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(bookX + pageOffset, yPos);
          ctx.lineTo(bookX + bookWidth, yPos);
          ctx.stroke();
        }
      }
      
      return canvas;
    }
    
    // Create directory
    const iconsDir = path.join(__dirname, 'assets', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // Generate icons
    console.log('Generating icons using Node Canvas...');
    
    const icon192 = createBookIcon(192, false);
    fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192.toBuffer('image/png'));
    console.log('✓ Created icon-192x192.png');
    
    const icon512 = createBookIcon(512, false);
    fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512.toBuffer('image/png'));
    console.log('✓ Created icon-512x512.png');
    
    const iconMaskable192 = createBookIcon(192, true);
    fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192x192.png'), iconMaskable192.toBuffer('image/png'));
    console.log('✓ Created icon-maskable-192x192.png');
    
    const iconMaskable512 = createBookIcon(512, true);
    fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), iconMaskable512.toBuffer('image/png'));
    console.log('✓ Created icon-maskable-512x512.png');
    
    console.log('\n✅ All PNG icons generated successfully!');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Canvas module not available. SVG icons already created.');
      console.log('To generate PNG icons, install canvas: npm install canvas');
      console.log('Or manually convert SVG to PNG using an online tool.');
      process.exit(0);
    } else {
      throw error;
    }
  }
}

createIcons().catch(console.error);