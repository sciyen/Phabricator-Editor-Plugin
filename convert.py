import subprocess
import re
import sys
from pathlib import Path
from urllib.parse import quote


PLUGIN_FILE = Path('plugin.js')
BOOKMARKLET_FILE = Path('plugin-inline.js')
BAT_FILE = Path('install-phab-editor.bat')
BAT_NAME_PREFIX = '✏Phab Editor'


def minify_with_terser(js_code):
    """Minify JavaScript code using terser.

    Raises an exception if terser is not installed or minification fails.
    """
    try:
        result = subprocess.run(
            ['npx', '-y', 'terser', '--compress', '--mangle'],
            input=js_code,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        # Fallback when Node.js/npx is not installed.
        return js_code.strip()

    if result.returncode != 0:
        # Fallback when terser execution fails.
        return js_code.strip()
    return result.stdout.strip()


def build_bookmarklet(js_code):
    normalized = js_code.lstrip()
    if normalized.lower().startswith('javascript:'):
        normalized = normalized[len('javascript:'):].lstrip()
    wrapped = '(function(){' + normalized + '})()'
    # URL-encode the payload to make it safe for batch-file embedding.
    return 'javascript:' + quote(wrapped, safe='')


def extract_version(js_code):
    match = re.search(
        r"PLUGIN_VERSION\s*=\s*['\"]([^'\"]+)['\"]",
        js_code,
    )
    if not match:
        raise RuntimeError('Could not find PLUGIN_VERSION in plugin.js')
    return match.group(1)


def update_bat_bookmarklet(bat_path, bookmarklet, version):
    content = bat_path.read_text(encoding='utf-8')

    start_marker = 'rem :::URL_START:::'
    end_marker = 'rem :::URL_END:::'
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    if start_idx == -1 or end_idx == -1 or end_idx <= start_idx:
        raise RuntimeError('Could not locate URL markers in install-bookmarklet.bat')

    line_start = content.find('\n', start_idx)
    if line_start == -1:
        raise RuntimeError('Invalid install-bookmarklet.bat format near URL_START')
    line_start += 1

    before = content[:line_start]
    after = content[end_idx:]
    updated = before + bookmarklet + '\n' + after

    bm_name_line = f'set "BM_NAME={BAT_NAME_PREFIX} {version}"'
    updated_lines = []
    replaced_bm_name = False
    for line in updated.splitlines():
        if line.startswith('set "BM_NAME='):
            updated_lines.append(bm_name_line)
            replaced_bm_name = True
        else:
            updated_lines.append(line)

    if not replaced_bm_name:
        raise RuntimeError('Could not find BM_NAME line in install-bookmarklet.bat')

    bat_path.write_text('\n'.join(updated_lines) + '\n', encoding='utf-8')


def main():
    # Read the source file
    content = PLUGIN_FILE.read_text(encoding='utf-8')
    version = extract_version(content)

    # Minify with terser
    print('Minifying plugin.js with terser...')
    minified = minify_with_terser(content)

    # Wrap as bookmarklet
    bookmarklet = build_bookmarklet(minified)

    # Write the output
    BOOKMARKLET_FILE.write_text(bookmarklet, encoding='utf-8')

    # Update batch installer bookmarklet and BM_NAME.
    update_bat_bookmarklet(BAT_FILE, bookmarklet, version)

    original_size = len(content)
    minified_size = len(bookmarklet)
    ratio = (1 - minified_size / original_size) * 100
    print(
        f'Done: {original_size} -> {minified_size} bytes '
        f'({ratio:.1f}% reduction)'
    )
    print(f'Updated {BAT_FILE} with BM_NAME={BAT_NAME_PREFIX} {version}')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr)
        sys.exit(1)
