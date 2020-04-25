# ftx.com trading bot

## Overview

During the Covid lockdown in April 2020, I wrote up some Typescript code to tinker with a trading bot using ftx.com.

The goals for me were to try a simple trading bot and implement some typescript practice.

The code is written for a Linux computer, though it should work on Mac or Windows.

The bot is meant to run as a scheduled takes (cron) every 5 minutes (or which ever the chosen time frame is - 1hr for example).

With an account on ftx.com, the bot downloads historical trading data from the FTX API.

Then the npm module 'technicalindicators' is used to crunch the numbers for indcators to use in decision making (moving average, RSI etc).

The next step is to then open or close trading positions on the ftx.com platform.

All of the strategies I tried are simple, like a moving average crossover, on low timeframes (5 minutes).

For me, all the strategies I tried (see the code), are **not profitable** (at least on the lower time frames).

All the code is MIT licensed, use any of it as you like.

# Usage

I suggest you create a sub-account on ftx.com, then create an API key for that sub-account.

Use a small amount of funds in the sub-account to trial strategies.

Export your FTX API key and Secret to shell environment vars

- `export FTX_API_KEY=xxxxxxxxxxxxx`
- `export FTX_SECRET=xxxxxxxxxxxxx`
- Typescript installed locally (not globally) so we use an npm script to run the compiler
- `npm run tsc -- -w`
- Execute manually example
- `node dist/candleMomentumStrategy.js`

Example of a cron job task to execute every minute (run this on your lap top or a cloud instance) example:

- `* * * * * FTX_API_KEY=xxxxxxxxxx FTX_SECRET=xxxxxxxxxxxx node /home/rudi/projects/ftx-bot/dist/candleMomentumStrategy.js >> /home/rudi/projects/ftx-bot/log-btc.txt 2>&1`

# Tests

- Single run testing, also this is your basic CI/CD script for testing. If this exits with a 0, then tests are good (including code coverage).
- `npm test`
- Development testing mode
- `npm run test:watch`
- View the HTML coverage report in a Brave browser (change to suit your browser)
- `npm run view:coverage`
- [Blog post helping with Jest setup](https://medium.com/@admin_86118/testing-typescript-node-with-jest-6bf5db18119c)
