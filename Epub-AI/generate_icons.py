#!/usr/bin/env python3
"""
Generate placeholder PWA icons for EPUB Reader
Creates simple book-themed icons in various sizes
"""

import os

# Create the icons directory
os.makedirs('assets/icons', exist_ok=True)

# Try to use PIL/Pillow if available, otherwise create SVG placeholders
try:
    from PIL import Image, ImageDraw, ImageFont
    
    def create_book_icon(size, is_maskable=False):
        """Create a simple book icon"""
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Define colors
        bg_color = (76, 175, 80, 255)  # Green theme color
        book_color = (255, 255, 255, 255)  # White
        
        # Calculate safe zone for maskable icons
        if is_maskable:
            # Maskable icons need 40% safe zone (20% padding on each side)
            padding = int(size * 0.2)
        else:
            padding = int(size * 0.1)
        
        # Draw circular background for maskable icons
        if is_maskable:
            draw.ellipse([0, 0, size, size], fill=bg_color)
        else:
            # Draw rounded rectangle background
            radius = int(size * 0.1)
            draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)
        
        # Draw book shape
        book_width = size - (padding * 2)
        book_height = int(book_width * 1.3)
        book_x = padding
        book_y = (size - book_height) // 2
        
        # Book cover (main rectangle)
        draw.rounded_rectangle(
            [book_x, book_y, book_x + book_width, book_y + book_height],
            radius=int(size * 0.03),
            fill=book_color
        )
        
        # Book spine (left edge highlight)
        spine_width = int(book_width * 0.08)
        draw.rectangle(
            [book_x, book_y, book_x + spine_width, book_y + book_height],
            fill=(230, 230, 230, 255)
        )
        
        # Book pages (right edge lines)
        page_offset = int(book_width * 0.93)
        line_spacing = int(book_height * 0.1)
        for i in range(3):
            y_pos = book_y + (i + 2) * line_spacing
            if y_pos < book_y + book_height - line_spacing:
                draw.line(
                    [book_x + page_offset, y_pos, book_x + book_width, y_pos],
                    fill=(200, 200, 200, 255),
                    width=2
                )
        
        return img
    
    # Generate all icon sizes
    print("Generating icons using PIL...")
    
    # Standard icons
    icon_192 = create_book_icon(192, is_maskable=False)
    icon_192.save('assets/icons/icon-192x192.png', 'PNG')
    print("✓ Created icon-192x192.png")
    
    icon_512 = create_book_icon(512, is_maskable=False)
    icon_512.save('assets/icons/icon-512x512.png', 'PNG')
    print("✓ Created icon-512x512.png")
    
    # Maskable icons (with safe zone)
    icon_maskable_192 = create_book_icon(192, is_maskable=True)
    icon_maskable_192.save('assets/icons/icon-maskable-192x192.png', 'PNG')
    print("✓ Created icon-maskable-192x192.png")
    
    icon_maskable_512 = create_book_icon(512, is_maskable=True)
    icon_maskable_512.save('assets/icons/icon-maskable-512x512.png', 'PNG')
    print("✓ Created icon-maskable-512x512.png")
    
    print("\n✅ All icons generated successfully!")
    
except ImportError:
    # If PIL is not available, create SVG placeholders
    print("PIL not available, creating SVG placeholders...")
    
    def create_svg_icon(size, is_maskable=False):
        """Create SVG book icon"""
        padding = int(size * 0.2) if is_maskable else int(size * 0.1)
        book_width = size - (padding * 2)
        book_height = int(book_width * 1.3)
        book_x = padding
        book_y = (size - book_height) // 2
        
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  {'<circle cx="' + str(size//2) + '" cy="' + str(size//2) + '" r="' + str(size//2) + '" fill="#4CAF50"/>' if is_maskable else '<rect width="' + str(size) + '" height="' + str(size) + '" rx="' + str(size//10) + '" fill="#4CAF50"/>'}
  
  <!-- Book -->
  <rect x="{book_x}" y="{book_y}" width="{book_width}" height="{book_height}" rx="{size//33}" fill="white"/>
  
  <!-- Spine -->
  <rect x="{book_x}" y="{book_y}" width="{int(book_width * 0.08)}" height="{book_height}" fill="#e6e6e6"/>
  
  <!-- Pages -->
  <line x1="{book_x + int(book_width * 0.93)}" y1="{book_y + int(book_height * 0.3)}" 
        x2="{book_x + book_width}" y2="{book_y + int(book_height * 0.3)}" 
        stroke="#c8c8c8" stroke-width="2"/>
  <line x1="{book_x + int(book_width * 0.93)}" y1="{book_y + int(book_height * 0.5)}" 
        x2="{book_x + book_width}" y2="{book_y + int(book_height * 0.5)}" 
        stroke="#c8c8c8" stroke-width="2"/>
  <line x1="{book_x + int(book_width * 0.93)}" y1="{book_y + int(book_height * 0.7)}" 
        x2="{book_x + book_width}" y2="{book_y + int(book_height * 0.7)}" 
        stroke="#c8c8c8" stroke-width="2"/>
</svg>'''
        return svg_content
    
    # Create SVG files as placeholders
    with open('assets/icons/icon-192x192.svg', 'w') as f:
        f.write(create_svg_icon(192, False))
    print("✓ Created icon-192x192.svg (Please convert to PNG)")
    
    with open('assets/icons/icon-512x512.svg', 'w') as f:
        f.write(create_svg_icon(512, False))
    print("✓ Created icon-512x512.svg (Please convert to PNG)")
    
    with open('assets/icons/icon-maskable-192x192.svg', 'w') as f:
        f.write(create_svg_icon(192, True))
    print("✓ Created icon-maskable-192x192.svg (Please convert to PNG)")
    
    with open('assets/icons/icon-maskable-512x512.svg', 'w') as f:
        f.write(create_svg_icon(512, True))
    print("✓ Created icon-maskable-512x512.svg (Please convert to PNG)")
    
    print("\n⚠️  SVG files created. You'll need to convert them to PNG:")
    print("   Use an online tool or ImageMagick: convert icon.svg icon.png")