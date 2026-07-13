from PIL import Image
import numpy as np

# Open the original image
img = Image.open('public/MrXSteroid_Hero_Section.webp').convert('RGBA')
data = np.array(img)

# Extract channels
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Define white background: pixels that are close to white (R>200, G>200, B>200)
# Use a threshold approach - the closer to white, the more transparent
# This preserves edge pixels with partial transparency (anti-aliasing)
threshold = 230  # pixels above this in all channels are considered "white background"
tolerance = 50   # range for smooth transition

# Calculate how "white" each pixel is (minimum brightness needed in all channels)
whiteness = np.minimum(np.minimum(r.astype(float), g.astype(float)), b.astype(float))

# Create new alpha based on how non-white the pixel is
# Fully white (255,255,255) -> alpha=0 (transparent)
# Fully colored -> alpha unchanged
new_alpha = np.where(
    whiteness >= threshold,
    # Smooth transition for near-white pixels
    np.clip((255 - whiteness) * 255 / (255 - threshold + tolerance), 0, 255).astype(np.uint8),
    a  # keep original alpha for clearly non-white pixels
)

data[:,:,3] = new_alpha.astype(np.uint8)

result = Image.fromarray(data, 'RGBA')

# Save back as WebP with transparency
result.save('public/MrXSteroid_Hero_Section.webp', 'WEBP', quality=95)
print('Done! Image saved with transparent white background.')

# Report stats
total_pixels = data.shape[0] * data.shape[1]
transparent_pixels = np.sum(new_alpha < 128)
print(f'Image size: {result.size}')
print(f'Transparent pixels: {transparent_pixels} / {total_pixels} ({100*transparent_pixels//total_pixels}%)')
