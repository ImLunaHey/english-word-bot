import 'dotenv/config';
import { Bot } from '@skyware/bot';
import wordListPath from 'word-list';
import { readFileSync, writeFileSync } from 'fs';

const username = process.env.BLUESKY_USERNAME;
const password = process.env.BLUESKY_PASSWORD;
const postedWordListPath = process.env.POSTED_WORD_LIST_PATH ?? './postedWords.txt';

if (!username || !password) throw new Error('BLUESKY_USERNAME and BLUESKY_PASSWORD must be set');

const TEN_MINUTES = 1_000 * 60 * 10;

const wordArray = readFileSync(wordListPath, 'utf8').split('\n');
const wordsPosted = readFileSync(postedWordListPath, 'utf8').split('\n');

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

  await bot.login({
    identifier: username,
    password: password,
  });

  console.info(`bot logged in as ${username}`);

  setInterval(async () => {
    const word = getRandomUnpostedWord();
    writePostedWord(word);

    console.info(`posting word: ${word}`);
    await bot.post({
      text: word,
    });
  }, TEN_MINUTES);
};

main().catch(console.error);
