"use strict";

const {getRandomInt, shuffle, printNumWithLead0} = require(`../../utils`);
const {ExitCode} = require(`../../constants`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;

const FILE_NAME = `mocks.json`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;

const OfferType = {
  offer: `offer`,
  sale: `sale`,
};

const SumRestrict = {
  min: 1000,
  max: 100000,
};

const PictureRestrict = {
  min: 1,
  max: 16,
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.trim().split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(ExitCode.error);
    return null;
  }
};

const getPictureFileName = (number) => `item${printNumWithLead0(number)}.jpg`;

const generateOffers = (count, titles, categories, sentences) =>
  Array(count)
    .fill({})
    .map(() => ({
      category: [categories[getRandomInt(0, categories.length - 1)]],
      description: shuffle(sentences).slice(1, 5).join(` `),
      picture: getPictureFileName(
          getRandomInt(PictureRestrict.min, PictureRestrict.max)
      ),
      title: titles[getRandomInt(0, titles.length - 1)],
      type: Object.keys(OfferType)[
        Math.floor(Math.random() * Object.keys(OfferType).length)
      ],
      sum: getRandomInt(SumRestrict.min, SumRestrict.max),
    }));

const writeFile = async (fileName, content) => {
  try {
    await fs.writeFile(fileName, content);
    console.log(chalk.green(`Operation success. File created.`));
  } catch (err) {
    console.error(chalk.red(`Can't write data to file...`));
    process.exit(ExitCode.error);
  }
};

module.exports = {
  name: `--generate`,
  async run(args) {
    const sentences = await readContent(FILE_SENTENCES_PATH);
    const titles = await readContent(FILE_TITLES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);

    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    if (countOffer > MAX_COUNT) {
      console.error(chalk.red(`Не больше 1000 объявлений`));
      process.exit(ExitCode.error);
    }

    const content = JSON.stringify(
        generateOffers(countOffer, titles, categories, sentences)
    );
    writeFile(FILE_NAME, content);
  },
};
