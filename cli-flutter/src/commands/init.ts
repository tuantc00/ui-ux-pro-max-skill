import { join } from 'node:path';
import { homedir } from 'node:os';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import type { AIType } from '../types/index.js';
import { AI_TYPES } from '../types/index.js';
import { installFlutterSkill } from '../utils/installer.js';
import { detectAIType, getAITypeDescription } from '../utils/detect.js';
import { logger } from '../utils/logger.js';

interface InitOptions {
  ai?: AIType;
  force?: boolean;
  global?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  logger.title('Flutter Pro Max Installer');

  let aiType = options.ai;

  // Auto-detect or prompt for AI type
  if (!aiType) {
    const { detected, suggested } = detectAIType();

    if (detected.length > 0) {
      logger.info(`Detected: ${detected.map(t => chalk.cyan(t)).join(', ')}`);
    }

    const response = await prompts({
      type: 'select',
      name: 'aiType',
      message: 'Select AI assistant to install for:',
      choices: AI_TYPES.map(type => ({
        title: getAITypeDescription(type),
        value: type,
      })),
      initial: suggested ? AI_TYPES.indexOf(suggested) : 0,
    });

    if (!response.aiType) {
      logger.warn('Installation cancelled');
      return;
    }

    aiType = response.aiType as AIType;
  }

  const isGlobal = !!options.global;
  const modeLabel = isGlobal ? ' (global)' : '';
  logger.info(`Installing for: ${chalk.cyan(getAITypeDescription(aiType))}${modeLabel}`);

  const spinner = ora('Installing Flutter skill files...').start();
  const cwd = process.cwd();
  let installedFolders: string[] = [];

  try {
    if (aiType === 'all') {
      const allFolders = new Set<string>();
      const typesToInstall = AI_TYPES.filter((t): t is Exclude<AIType, 'all'> => t !== 'all');

      for (const type of typesToInstall) {
        try {
          const folders = await installFlutterSkill(cwd, type, isGlobal);
          folders.forEach(f => allFolders.add(f));
        } catch {
          // Skip failed platforms
        }
      }
      installedFolders = Array.from(allFolders);
    } else {
      installedFolders = await installFlutterSkill(cwd, aiType as Exclude<AIType, 'all'>, isGlobal);
    }

    spinner.succeed('Flutter skill files installed!');

    console.log();
    logger.info('Installed folders:');
    installedFolders.forEach(folder => {
      console.log(`  ${chalk.green('+')} ${folder}`);
    });

    console.log();
    logger.success('Flutter Pro Max installed successfully!');

    console.log();
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.dim('  1. Restart your AI coding assistant'));
    console.log(chalk.dim('  2. Try: "Create a Flutter login screen with BLoC and clean architecture"'));
    console.log();
  } catch (error) {
    spinner.fail('Installation failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}
