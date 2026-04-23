import { readFile, mkdir, writeFile, rm, stat, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import type { AIType, PlatformConfig } from '../types/index.js';
import { PLATFORM_CONFIGS, AI_FOLDERS } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// After bun build: dist/index.js -> ../assets = cli-flutter/assets ✓
const ASSETS_DIR = join(__dirname, '..', 'assets');

/** Extra files copied alongside the main skill file */
const EXTRA_FILES = [
  'FLUTTER_RULES.md',
  'CODE_REVIEW_CHECKLIST.md',
  'PROJECT_STRUCTURE.md',
] as const;

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Render YAML frontmatter block from key-value pairs.
 */
function renderFrontmatter(frontmatter: Record<string, string>): string {
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value.includes(':') || value.includes('"') || value.includes('\n')) {
      lines.push(`${key}: "${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

/**
 * Install Flutter Pro Max skill files for a single AI type.
 * Returns the list of top-level folders created.
 */
export async function installFlutterSkill(
  targetDir: string,
  aiType: Exclude<AIType, 'all'>,
  isGlobal = false
): Promise<string[]> {
  const config: PlatformConfig = PLATFORM_CONFIGS[aiType];
  const effectiveDir = isGlobal ? homedir() : targetDir;

  const skillDir = join(effectiveDir, config.root, config.skillPath);
  await mkdir(skillDir, { recursive: true });

  // Read and optionally wrap main skill content with frontmatter
  const skillContent = await readFile(join(ASSETS_DIR, 'FLUTTER_SKILL.md'), 'utf-8');
  const fileContent = config.frontmatter
    ? renderFrontmatter(config.frontmatter) + skillContent
    : skillContent;

  await writeFile(join(skillDir, config.filename), fileContent, 'utf-8');

  // Copy supplementary files
  for (const extraFile of EXTRA_FILES) {
    const content = await readFile(join(ASSETS_DIR, extraFile), 'utf-8');
    await writeFile(join(skillDir, extraFile), content, 'utf-8');
  }

  return [config.root];
}

/**
 * Remove Flutter Pro Max skill directory for a given AI type.
 * Returns the list of paths removed.
 */
export async function removeFlutterSkill(
  baseDir: string,
  aiType: Exclude<AIType, 'all'>
): Promise<string[]> {
  const config = PLATFORM_CONFIGS[aiType];
  const removed: string[] = [];

  const skillDir = join(baseDir, config.root, config.skillPath);
  try {
    await stat(skillDir);
    await rm(skillDir, { recursive: true, force: true });
    removed.push(`${config.root}/${config.skillPath}`);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  // Also clean up legacy paths (AI_FOLDERS covers multi-folder types)
  const extraFolders = AI_FOLDERS[aiType].filter(f => f !== config.root);
  for (const folder of extraFolders) {
    const legacyDir = join(baseDir, folder, 'skills', 'flutter-pro-max');
    try {
      await stat(legacyDir);
      await rm(legacyDir, { recursive: true, force: true });
      removed.push(`${folder}/skills/flutter-pro-max`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  return removed;
}

export { pathExists };
