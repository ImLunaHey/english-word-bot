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
const wordsPosted = readFileOrReturnEmptyArray(postedWordListPath);

const getRandomUnpostedWord = () => {
  const word = wordArray[Math.floor(Math.random() * wordArray.length)];
  if (wordsPosted.includes(word)) return getRandomUnpostedWord();
  return word;
};

const writePostedWord = (word: string) => {
  wordsPosted.push(word);
  writeFileSync(postedWordListPath, wordsPosted.join('\n'), 'utf8');
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

  console.info(`bot logged in as ${username}`);

  // every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    const word = getRandomUnpostedWord();
    try {
      writePostedWord(word);

      const imageBuffer = await createWordImage(word, '@EnglishWordBot');
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
