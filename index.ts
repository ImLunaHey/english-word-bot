import 'dotenv/config';
import { Bot } from '@skyware/bot';
import wordListPath from 'word-list';
import { readFileSync, writeFileSync } from 'fs';
import cron from 'node-cron';
import { createWordImage } from './image';
import { AtpAgent } from '@atproto/api';

const username = process.env.BLUESKY_USERNAME;
const password = process.env.BLUESKY_PASSWORD;
const postedWordListPath = process.env.POSTED_WORD_LIST_PATH ?? './postedWords.txt';

if (!username || !password) throw new Error('BLUESKY_USERNAME and BLUESKY_PASSWORD must be set');

const readFileOrReturnEmptyArray = (path: string) => {
  try {
    return readFileSync(path, 'utf8').split('\n');
  } catch {
    return [];
  }
};

const wordArray = readFileSync(wordListPath, 'utf8').split('\n');
const wordsPosted = new Set(readFileOrReturnEmptyArray(postedWordListPath));
const getUnpostedWords = () => wordArray.filter((word) => !wordsPosted.has(word));

const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const getRandomUnpostedWord = (): string => {
  const availableWords = getUnpostedWords();
  if (availableWords.length === 0) throw new Error('All words have been posted already');

  return getRandomElement(availableWords);
};

const writePostedWord = (word: string) => {
  wordsPosted.add(word);
  writeFileSync(postedWordListPath, Array.from(wordsPosted).join('\n'), 'utf8');
};

const main = async () => {
  const bot = new Bot();
  const agent = new AtpAgent({
    service: 'https://bsky.social',
  });

  const session = await bot.login({
    identifier: username,
    password: password,
  });

  await agent.resumeSession(session);

  bot.on('error', (error) => {
    console.error(`error: ${error}`);
  });

  console.info(`bot logged in as ${username}`);

  // every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    const word = getRandomUnpostedWord();
    try {
      writePostedWord(word);

      const imageBuffer = await createWordImage(word, `@${username}`);
      const blob = new Blob([imageBuffer], { type: 'image/png' });

      console.info(`posting word: ${word}`);
      await bot.post({
        text: '',
        images: [
          {
            alt: `The word "${word}" on a stylized background`,
            data: blob,
          },
        ],
      });
    } catch (error) {
      console.error(`error posting word: ${word}`, error);
    }
  });
};

main().catch(console.error);
