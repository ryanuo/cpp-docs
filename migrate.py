#!/usr/bin/env python3
# Migration script: MyCppTutorial (VuePress) → cpp-docs (Nuxt Content 3)
# Run: python3 migrate.py

import os
import re
import glob

SOURCE_DIR = "/Users/ryanuo/dev/github/MyCppTutorial/src"
TARGET_DIR = "/Users/ryanuo/dev/github/cpp-docs/content"

# Directory icons for navigation
DIR_ICONS = {
    'ch00': 'i-lucide-monitor',
    'ch01': 'i-lucide-book-open',
    'ch02': 'i-lucide-code',
    'ch03': 'i-lucide-function-square',
    'ch04': 'i-lucide-layers',
    'ch05': 'i-lucide-copy',
    'ch06': 'i-lucide-component',
    'ch07': 'i-lucide-git-branch',
    'ch08': 'i-lucide-layout-template',
    'ch09': 'i-lucide-link',
    'ch10': 'i-lucide-hard-drive',
    'ch11': 'i-lucide-sparkles',
    'ch12': 'i-lucide-git-fork',
    'appendix': 'i-lucide-bookmark',
    'ch02/part1': 'i-lucide-database',
    'ch02/part1/type_system': 'i-lucide-dna',
    'ch02/part2': 'i-lucide-calculator',
    'ch02/part3': 'i-lucide-git-branch',
    'ch04/array': 'i-lucide-grid',
    'ch04/compare_with_c': 'i-lucide-arrow-right-left',
    'ch04/io': 'i-lucide-terminal',
    'ch04/list': 'i-lucide-list',
    'ch04/pointer': 'i-lucide-dot',
    'ch04/struct': 'i-lucide-box',
    'ch07/inheritance': 'i-lucide-share',
    'ch07/polymorphism': 'i-lucide-refresh',
    'ch08/stl_containers': 'i-lucide-container',
    'ch10/adt': 'i-lucide-shapes',
    'ch10/file_io': 'i-lucide-file-text',
    'ch10/smart_pointer': 'i-lucide-pointer',
    'ch11/advanced': 'i-lucide-graduation-cap',
    'ch11/grammar': 'i-lucide-book-text',
    'ch11/stl_algorithms': 'i-lucide-sort-asc',
    'ch12/static_dispatch': 'i-lucide-route',
}

# Special page icons (for non-chapter pages)
PAGE_ICONS = {
    'index': 'i-lucide-house',
    'preface': 'i-lucide-book-marked',
    'postscript': 'i-lucide-bookmark',
    'technical_info': 'i-lucide-info',
}

SKIP_FILES = {'todo.md'}


def get_all_md_files(base):
    result = []
    for root, dirs, files in os.walk(base):
        rel = os.path.relpath(root, base)
        if rel == '.':
            rel = ''
        for f in files:
            if f.endswith('.md') and f not in SKIP_FILES:
                result.append(os.path.join(rel, f) if rel else f)
    return sorted(result)


def get_title(content):
    """Extract title from first # heading"""
    m = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return None


def clean_description(text):
    """Remove markdown special characters for YAML safety"""
    # Remove bold/italic markers
    text = re.sub(r'\*{1,2}', '', text)
    # Remove links
    text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
    # Remove images
    text = re.sub(r'!\[([^\]]*)\]\([^)]*\)', r'\1', text)
    # Remove headings
    text = re.sub(r'^#+\s+', '', text)
    # Remove blockquotes marker
    text = re.sub(r'^>\s*', '', text)
    # Remove backticks
    text = text.replace('`', '')
    # Remove #
    text = text.replace('#', '')
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def make_description(content, max_len=100):
    """Make description from first paragraph (after title)"""
    # Remove frontmatter
    body = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL).strip()
    # Remove headings
    body = re.sub(r'^#+\s+.*$', '', body, flags=re.MULTILINE)
    # Remove code blocks
    body = re.sub(r'```.*?```', '', body, flags=re.DOTALL)
    # Get first non-empty paragraph
    paragraphs = [p.strip() for p in body.split('\n\n') if p.strip()]
    description = paragraphs[0] if paragraphs else ''
    # Clean markdown special chars
    description = clean_description(description)
    # Truncate
    if len(description) > max_len:
        description = description[:max_len].rsplit(' ', 1)[0] + '...'
    return description


def make_nav_icon(dirpath, name):
    """Generate navigation icon"""
    if dirpath == '' and name == 'index':
        return PAGE_ICONS.get('index', 'i-lucide-house')
    if dirpath == '':
        return PAGE_ICONS.get(name, 'i-lucide-file')
    # Try exact match
    icon = DIR_ICONS.get(dirpath)
    if icon:
        return icon
    # Try parent
    parts = dirpath.split('/')
    for i in range(len(parts), 0, -1):
        parent = '/'.join(parts[:i])
        if parent in DIR_ICONS:
            return DIR_ICONS[parent]
    return 'i-lucide-folder'


def convert_internal_links(content, src_path):
    """Convert VuePress relative links to Nuxt Content root-relative paths"""
    src_dir = os.path.dirname(src_path)
    
    def replacer(m):
        link_path = m.group(1)
        # Skip external links
        if link_path.startswith(('http://', 'https://', 'mailto:')):
            return m.group(0)
        # Extract anchor
        anchor = ''
        if '#' in link_path:
            link_path, anchor = link_path.split('#', 1)
            anchor = '#' + anchor
        # Remove .md extension
        link_path = re.sub(r'\.md$', '', link_path)
        # Resolve relative path
        if link_path.startswith('.'):
            # Relative to current file's directory
            link_path = os.path.normpath(os.path.join(src_dir, link_path))
        # Remove README suffix (README.md → index.md, URL is just the directory)
        link_path = re.sub(r'/README$', '/', link_path)
        link_path = re.sub(r'README$', '', link_path)
        # Remove trailing /
        link_path = link_path.rstrip('/')
        # Ensure starts with /
        if not link_path.startswith('/'):
            link_path = '/' + link_path
        # Empty path means root
        if link_path == '':
            link_path = '/'
        return f"]({link_path}{anchor})"
    
    return re.sub(r'\]\(([^\)]*)\)', replacer, content)


def convert_custom_blocks(content):
    """Convert VuePress custom blocks to Nuxt Content MDC syntax"""
    # tip/warning/danger containers
    # VuePress: ```tip ... ``` or container syntax :::tip
    # Nuxt Content: :::callout or > [!NOTE]
    def convert_container(m):
        ctype = m.group(1).strip().lower()
        body = m.group(2).strip()
        icon = {'tip': 'i-lucide-lightbulb', 'warning': 'i-lucide-alert-triangle', 'danger': 'i-lucide-x-circle'}.get(ctype, 'i-lucide-info')
        return f":::callout{{icon=\"{icon}\"}}\n{body}\n:::"

    # Match ```tip ... ``` ```warning ... ``` ```danger ... ```
    content = re.sub(r'```(tip|warning|danger)\s*\n(.*?)```', convert_container, content, flags=re.DOTALL)

    # Convert codemo blocks to Nuxt Content code blocks (degraded)
    # Convert codemo blocks to Nuxt Content code blocks (degraded)
    def convert_codemo(m):
        lang = m.group(1)
        code = m.group(2)
        # Strip codemo directives from code
        lines = code.split('\n')
        cleaned = []
        for line in lines:
            if '// codemo' in line:
                if '// codemo focus-next-line' in line or '// codemo hide' in line or '// codemo show' in line:
                    continue
                line = re.sub(r'\s*// codemo.*$', '', line)
            cleaned.append(line)
        code = '\n'.join(cleaned)
        return f"```{lang}\n{code}\n```"

    # Use a more precise pattern: match until a line starting with ```
    content = re.sub(r'```(cpp|c)\s+codemo[^\n]*\n(.*?)\n```', convert_codemo, content, flags=re.DOTALL)


    # Convert sdsc blocks to MDC syntax
    def convert_sdsc(m):
        code = m.group(1).strip()
        return f":::sdsc\n{code}\n:::"

    content = re.sub(r'```sdsc\s*\n(.*?)```', convert_sdsc, content, flags=re.DOTALL)

    # Convert io blocks to MDC syntax
    def convert_io(m):
        code = m.group(1).strip()
        return f":::io-block\n{code}\n:::"

    content = re.sub(r'```io\s*\n(.*?)```', convert_io, content, flags=re.DOTALL)

    # Convert inline sdsc @text@ (within backticks)
    # Already handled by sdsc parser, but in MDC these become <SdscInline> components
    # We'll leave @text@ as-is for later processing
    return content


def process_file(src_path, tgt_path):
    """Process a single markdown file"""
    full_src = os.path.join(SOURCE_DIR, src_path)
    full_tgt = os.path.join(TARGET_DIR, tgt_path)

    # Read source
    with open(full_src, 'r', encoding='utf-8') as f:
        content = f.read()

    # Strip existing VuePress frontmatter
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL).strip()

    # Extract info
    title = get_title(content) or os.path.splitext(os.path.basename(src_path))[0]
    description = make_description(content)

    # Convert links
    content = convert_internal_links(content, src_path)

    # Convert custom syntax
    content = convert_custom_blocks(content)

    # Build frontmatter
    rel_dir = os.path.dirname(tgt_path)
    base_name = os.path.splitext(os.path.basename(tgt_path))[0]

    nav_icon = make_nav_icon(rel_dir, base_name)

    # Escape double quotes in description for YAML safety
    desc_safe = description.replace('"', '\\"')

    frontmatter = f"""---
title: {title}
description: "{desc_safe}"
navigation:
  icon: {nav_icon}
---

"""

    # For homepage, don't add another title if already there
    if tgt_path == 'index.md':
        frontmatter = f"""---
title: {title}
description: {description}
---

"""

    # Ensure target directory exists
    os.makedirs(os.path.dirname(full_tgt), exist_ok=True)

    # Write file
    with open(full_tgt, 'w', encoding='utf-8') as f:
        f.write(frontmatter + content)


def create_navigation_files(dirs):
    """Create .navigation.yml for each directory"""
    for dirpath in sorted(dirs):
        # Get title from the README/title mapping
        title = chapter_titles.get(dirpath, dirpath.split('/')[-1] if dirpath else 'C++ 教程')
        icon = make_nav_icon(dirpath, '')

        nav_content = f"""title: {title}
"""
        if dirpath in DIR_ICONS or dirpath == '':
            nav_content += f"icon: {icon}\n"

        nav_path = os.path.join(TARGET_DIR, dirpath, '.navigation.yml')
        os.makedirs(os.path.dirname(nav_path), exist_ok=True)
        with open(nav_path, 'w', encoding='utf-8') as f:
            f.write(nav_content)


# Main
print("=== MyCppTutorial → cpp-docs Migration ===\n")

# Get all files
md_files = get_all_md_files(SOURCE_DIR)
print(f"Found {len(md_files)} markdown files to migrate")

# Get chapter titles for navigation
chapter_titles = {}
for root, dirs_list, files in os.walk(SOURCE_DIR):
    rel_root = os.path.relpath(root, SOURCE_DIR)
    if rel_root == '.':
        rel_root = ''
    if 'README.md' in files:
        full = os.path.join(root, 'README.md')
        with open(full, 'r', encoding='utf-8') as f:
            c = f.read()
        t = get_title(c)
        if t:
            chapter_titles[rel_root] = t

# Build file mappings
file_map = []
target_dirs = set()

for src_path in md_files:
    parts = src_path.split('/')
    if src_path == 'README.md':
        tgt_path = 'index.md'
    elif parts[-1] == 'README.md' and len(parts) > 1:
        tgt_path = '/'.join(parts[:-1]) + '/index.md'
    else:
        tgt_path = src_path

    file_map.append((src_path, tgt_path))
    d = os.path.dirname(tgt_path)
    if d:
        target_dirs.add(d)
        # Also add parents
        while d:
            d = os.path.dirname(d)
            if d:
                target_dirs.add(d)

# Add top-level directories too
for d in list(target_dirs):
    parts = d.split('/')
    for i in range(1, len(parts) + 1):
        target_dirs.add('/'.join(parts[:i]))

print(f"Target directories: {len(target_dirs)}")

# Clear existing content (except our template files)
import shutil
if os.path.exists(TARGET_DIR):
    for item in os.listdir(TARGET_DIR):
        item_path = os.path.join(TARGET_DIR, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        elif item != '.gitkeep':
            os.remove(item_path)

print("Cleared existing content/")

# Process all files
errors = []
for i, (src_path, tgt_path) in enumerate(file_map):
    try:
        process_file(src_path, tgt_path)
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(file_map)} files...")
    except Exception as e:
        errors.append((src_path, str(e)))

print(f"Processed {len(file_map)} files total")

# Create navigation files
create_navigation_files(target_dirs)
print(f"Created {len(target_dirs)} .navigation.yml files")

if errors:
    print(f"\n⚠️ {len(errors)} errors:")
    for src, err in errors[:10]:
        print(f"  {src}: {err}")
else:
    print("\n✅ Migration completed successfully!")

# Report summary
print(f"\n📊 Summary:")
print(f"  - Files migrated: {len(file_map)}")
print(f"  - Directories: {len(target_dirs)}")
print(f"  - Navigation files: {len(target_dirs)}")
