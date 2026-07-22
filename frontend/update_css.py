import re
import sys

with open('d:/fort-trace/ForTrace/frontend/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace :root color variables
css = re.sub(r'--c-primary:.*?;', '--c-primary: #b1b7ab;', css)
css = re.sub(r'--c-secondary:.*?;', '--c-secondary: #276152;', css)
css = re.sub(r'--c-accent:.*?;', '--c-accent: #0d3a35;', css) # use tertiary as accent for fallback

if '--c-tertiary:' not in css:
    css = css.replace('--c-secondary: #276152;', '--c-secondary: #276152;\n  --c-tertiary: #0d3a35;')

# Glass blur and utilities in root
if '--glass-bg:' not in css:
    css = re.sub(r'--glass-blur:.*?;', '--glass-bg: rgba(255, 255, 255, 0.75);\n  --glass-blur: blur(12px);\n  --transition-base: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n  --hover-scale: scale(1.02);', css, count=1)

# Dark theme adjustments
if '--glass-bg: rgba(30, 41, 59, 0.75);' not in css:
    css = re.sub(r'--shadow-elevated: 0 8px 24px rgba\(0, 0, 0, 0.4\);', '--shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.4);\n  --glass-bg: rgba(30, 41, 59, 0.75);', css, count=1)

# Replace background for glass components
css = re.sub(r'background: var\(--c-surface\);\s*backdrop-filter: var\(--glass-blur\);', 'background: var(--glass-bg);\n  backdrop-filter: var(--glass-blur);', css)

# Fix hover scale for kpi cards
css = re.sub(r'(\.kpi-card:hover\s*{[\s\S]*?)transform:\s*translateY\(-2px\);', r'\1transform: var(--hover-scale);', css)

# Ensure transitions use --transition-base
css = re.sub(r'transition:\s*transform 0\.2s ease, box-shadow 0\.2s ease;', 'transition: var(--transition-base);', css)
css = re.sub(r'transition:\s*all 0\.2s ease;', 'transition: var(--transition-base);', css)

# Make sure all .card:hover has scale 1.02
if '.card:hover' not in css:
    card_hover = '''
.card {
  transition: var(--transition-base);
}

.card:hover {
  transform: var(--hover-scale);
  box-shadow: var(--shadow-elevated);
}
'''
    css = css.replace('.card-body {', card_hover + '\n.card-body {')


with open('d:/fort-trace/ForTrace/frontend/index.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated index.css successfully.")
