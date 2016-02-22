'use strict';
const login = require('facebook-chat-api');
const google = require('google');
const request = require('request');
const secrets = require('./secrets.js');

const userInfo = {
  email: process.env.EMAIl || secrets.EMAIL,
  password: process.env.PASSWORD || secrets.PASSWORD,
};

const HELP_MESSAGE = `
Hi! I'm fbot v1.0.
I'm a bot who google things.
I'm kinda dumb so please don't break me ;_;

Btw, this are the commands you can use:
  > google <query> - I'll google your query and return you up to 5 links with it's result number.
  > next - If the first page isn't enough, you can check the next results.
  > read <number> - Show a short description of the website.
  > show <number> - I'll read you that site. (This one could be improved, tho).
  > help - I guess you already know this one.
`;

const ALLOWED_THREAD = process.env.ALLOWED_THREAD || secrets.ALLOWED_THREAD;

google.resultsPerPage = 5;
let pages;
let nextPage;


function mapResultsToResponses(results) {
  const responses = results.map((page, idx) => {
    const pageLink = page.href;
    const pageDomain = pageLink.split('/')[2];

    return `#${idx + 1} - ${page.title} (${pageDomain}))`;
  });

  return responses;
}

function evaluate(message, api) {
  const sendMessage = api.sendMessage;
  const sendTypingIndicator = api.sendTypingIndicator;
  const body = message.body;
  const threadID = message.threadID;
  const text = body.trim();

  switch (true) {
    // Google for something.
    case /^google/.test(text):
      const query = text.replace(/^google/, '');
      sendTypingIndicator(threadID, (_, end) => end());
      return google(query, (err, next, results) => {
        if (err) return console.log(err);
        nextPage = next;
        console.log(next);

        pages = results.filter(result => result.link !== null);

        const responses = mapResultsToResponses(pages);
        responses.forEach(response => sendMessage(response, threadID));
      });

    // Request next page using `next`.
    case /^next/.test(text):
      if (!nextPage) return sendMessage('You need to search something first!', threadID);
      sendTypingIndicator(threadID, (_, end) => end());
      return nextPage();

    // Read the page description using `read n` where n is the result number.
    case /^read\s[1-5]/.test(text):
      const resultNumber = text.replace(/^read\s/, '');
      return sendMessage(pages[resultNumber - 1].description, threadID);

    case /^show\s[1-5]/.test(text):
      const linkNumber = text.replace(/^show\s/, '');

      return request(pages[linkNumber - 1].href, (error, response, responseBody) => {
        if (!error && response.statusCode === 200) {
          const plainTextResponse = responseBody
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<(?:.|\n)*?>/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n');

          return sendMessage(plainTextResponse, threadID);
        }

        return sendMessage('Oops, something broke', threadID);
      });

    case /^help/.test(text):
      return sendMessage(HELP_MESSAGE, threadID);

    default:
      return sendMessage('Wrong command', threadID);
  }
}


// Listen for messages.
login(userInfo, (err, api) => {
  if (err) return console.log(err);

  api.listen((_, message) => {
    // Only allow myself to message the bot.
    if (message.threadID !== ALLOWED_THREAD) {
      return api.sendMessage('Sorry bro, this is a private bot', message.threadID);
    }

    evaluate(message, api);
  });
});
