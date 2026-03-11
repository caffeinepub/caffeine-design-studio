# Caffeine Design Studio

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Canvas-based graphic design tool
- Template presets for banners, social media posts, posters, and network diagrams
- Text tool: add/edit text, font size, font family, color, bold/italic
- Shape tools: rectangle, circle, line, arrow
- Color fill and stroke controls
- Background color/gradient picker
- Image upload and placement on canvas
- Layer management (bring forward, send back, delete)
- Export canvas as PNG/JPEG
- Undo/redo history
- Canvas size presets (banner 1200x400, Instagram 1080x1080, Twitter/X post, A4, custom)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: minimal canister (no persistent data needed, purely frontend tool)
2. Frontend: React canvas editor using HTML5 Canvas + Fabric.js-style interaction via canvas events
   - Toolbar: tools (select, text, rect, circle, line, arrow, image upload)
   - Canvas area: interactive design surface
   - Right panel: properties (color, size, opacity, font controls)
   - Bottom bar: canvas size presets, zoom, export button
   - Layer panel: list of objects, reorder, delete
   - Undo/redo
