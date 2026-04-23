import { join } from 'node:path';
import { homedir } from 'node:os';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import type { AIType } from '../types/index.js';
import { AI_TYPES } from '../types/index.js';
import { removeFlutterSkill } from '../utils/installer.js';
import { detectAIType, getAITypeDescription } from '../utils/detect.js';
import { logger } from '../utils/logger.js';

interface UninstallOptions {
  ai?: AIType;
  global?: boolean;
}

export async function uninstallCommand(options: UninstallOptions): Promise<void> {
  logger.title('Flutter Pro Max Uninstaller');

  const isGlobal = !!options.global;
  const baseDir = isGlobal ? homedir() : process.cwd();
  const locationLabel = isGlobal ? '~/ (global)' : process.cwd();

  let aiType = options.ai;
  const { detected: initialDetected } = detectAIType(baseDir);

  if (!aiType) {
    if (initialDetected.length === 0) {
      logger.warn('No installed AI skill directories detected.');
      return;
    }

    logger.info(`Detected installations: ${initialDetected.map(t => chalk.cyan(t)).join(', ')}`);

    const choices = [
      ...initialDetected.map(type => ({
        title: getAITypeDescription(type),
        value: type,
      })),
      { title: 'All detected', value: 'all' as AIType },
    ];

    const response = await prompts({
      type: 'select',
      name: 'aiType',
      message: 'Select which AI skill to uninstall:',
      choices,
    });

    if (!response.aiType) {
      logger.warn('Uninstall cancelled');
      return;
    }

    aiType = response.aiType as AIType;
  }

  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: `Remove Flutter Pro Max skill for ${chalk.cyan(getAITypeDescription(aiType))} from ${locationLabel}?`,
    initial: false,
  });

  if (!confirmed) {
    logger.warn('Uninstall cancelled');
    return;
  }

  const spinner = ora('Removing skill files...').start();

  try {
    const allRemoved: string[] = [];

    if (aiType === 'all') {
      for (const type of initialDetected) {
        const removed = await removeFlutterSkill(baseDir, type as Exclude<AIType, 'all'>);
        allRemoved.push(...removed);
      }
    } else {
      const removed = await removeFlutterSkill(baseDir, aiType as Exclude<AIType, 'all'>);
      allRemoved.push(...removed);
    }

    if (allRemoved.length === 0) {
      spinner.warn('No Flutter skill files found to remove');
      return;
    }

    spinner.succeed('Skill files removed!');

    console.log();
    logger.info('Removed:');
    allRemoved.forEach(folder => {
      console.log(`  ${chalk.red('-')} ${folder}`);
    });

    console.log();
    logger.success('Flutter Pro Max uninstalled successfully!');
    console.log();
  } catch (error) {
    spinner.fail('Uninstall failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}
