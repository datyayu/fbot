# fbot
Hi! I'm fbot. I'm a facebook bot who google things. I'm kinda dumb so please don't break me.

## Installation.
To use your own instance of this bot, clone the repo
`` git clone https://github.com/datyayu/fbot.git``
and install the dependencies
`` npm install ``

Also, make sure your bot has a fb account.

## Running
To run the bot you need to create a `secret.js` file where you export your info like this
```js
module.exports = {
  EMAIL: 'some@email.com',         // Your bot profile email.
  PASSWORD: 'somepassword',        // Your bot profile password.
  ALLOWED_THREAD: 000000000000000, // Your user/thread ID.
};
```

You can change this later on by using the environment variables `EMAIL`, `PASSWORD` & `ALLOWED_THREAD`.

## Commands
Btw, this are the commands you can use:
  - google &lt;query&gt; - It will google your query and return you up to 5 links with it's result number.
  - next - Check the next results.
  - read &lt;number&gt; - Show a short description of the website.
  - show &lt;number&gt; - Show the content of that site.
  - help - Show help message.
