export type AIType =
  | 'claude'
  | 'cursor'
  | 'windsurf'
  | 'antigravity'
  | 'copilot'
  | 'kiro'
  | 'roocode'
  | 'codex'
  | 'qoder'
  | 'gemini'
  | 'trae'
  | 'opencode'
  | 'continue'
  | 'codebuddy'
  | 'droid'
  | 'kilocode'
  | 'warp'
  | 'augment'
  | 'all';

export interface PlatformConfig {
  /** Top-level dot-folder (e.g. ".claude") */
  root: string;
  /** Path inside root where skill files are placed */
  skillPath: string;
  /** Filename for the main skill entry point */
  filename: string;
  /** YAML frontmatter key-value pairs, or null if not needed */
  frontmatter: Record<string, string> | null;
}

export const AI_TYPES: AIType[] = [
  'claude',
  'cursor',
  'windsurf',
  'antigravity',
  'copilot',
  'roocode',
  'kiro',
  'codex',
  'qoder',
  'gemini',
  'trae',
  'opencode',
  'continue',
  'codebuddy',
  'droid',
  'kilocode',
  'warp',
  'augment',
  'all',
];

const FLUTTER_DESCRIPTION =
  'Production-ready Flutter development guide. Covers Dart fundamentals, ' +
  'architecture, state management, testing, CI/CD, and code conventions with ' +
  'concrete code examples.';

export const PLATFORM_CONFIGS: Record<Exclude<AIType, 'all'>, PlatformConfig> = {
  claude: {
    root: '.claude',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: {
      name: 'flutter-pro-max',
      description: FLUTTER_DESCRIPTION,
    },
  },
  cursor: {
    root: '.cursor',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: {
      name: 'flutter-pro-max',
      description: FLUTTER_DESCRIPTION,
    },
  },
  windsurf: {
    root: '.windsurf',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: {
      name: 'flutter-pro-max',
      description: FLUTTER_DESCRIPTION,
    },
  },
  antigravity: {
    root: '.agents',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  copilot: {
    root: '.github',
    skillPath: 'prompts/flutter-pro-max',
    filename: 'PROMPT.md',
    frontmatter: {
      name: 'flutter-pro-max',
      description: FLUTTER_DESCRIPTION,
    },
  },
  kiro: {
    root: '.kiro',
    skillPath: 'steering/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  roocode: {
    root: '.roo',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  codex: {
    root: '.codex',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  qoder: {
    root: '.qoder',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  gemini: {
    root: '.gemini',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  trae: {
    root: '.trae',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  opencode: {
    root: '.opencode',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  continue: {
    root: '.continue',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  codebuddy: {
    root: '.codebuddy',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  droid: {
    root: '.factory',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  kilocode: {
    root: '.kilocode',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  warp: {
    root: '.warp',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
  augment: {
    root: '.augment',
    skillPath: 'skills/flutter-pro-max',
    filename: 'SKILL.md',
    frontmatter: null,
  },
};

/** All folders touched by each AI type (for uninstall) */
export const AI_FOLDERS: Record<Exclude<AIType, 'all'>, string[]> = {
  claude: ['.claude'],
  cursor: ['.cursor'],
  windsurf: ['.windsurf'],
  antigravity: ['.agents'],
  copilot: ['.github'],
  kiro: ['.kiro'],
  roocode: ['.roo'],
  codex: ['.codex'],
  qoder: ['.qoder'],
  gemini: ['.gemini'],
  trae: ['.trae'],
  opencode: ['.opencode'],
  continue: ['.continue'],
  codebuddy: ['.codebuddy'],
  droid: ['.factory'],
  kilocode: ['.kilocode'],
  warp: ['.warp'],
  augment: ['.augment'],
};
