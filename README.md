## Private Server and Remote JavaScript Console App

This is your own, private server of http://console.re/ service

Using this repo you can install a private server for JavaScript Remote Console and connect to it using https://github.com/kurdin/console-remote

You can try all Console Remote examples at **RunJS.co** <a href="https://runjs.co/s/g7LRa7LU1">https://runjs.co/s/g7LRa7LU1</a>

## This version also supports CORS and is built to work with Heroku

## Installation and Use

### Clone repo and install packages

Clone this private server repo https://github.com/kurdin/console-remote-server

```sh
$ git clone https://github.com/kurdin/console-remote-server
```

Go to repo folder and install Node packages

```js
$ cd console-remote-server
$ npm install
```

### Run Console Server on localhost

Console Node server script located in `./console-server` folder. You can change `.env.development` file to modify server options

Start console server on localhost port 8088

```sh
$ npm run server
```

Your full server url will be `http://localhost:8088` , this is where you need to connect from `console-remote` connector

### Run Console App on localhost

Start console web application on `http://localhost:3000`

```sh
$ npm start
```

With your browser, open `http://localhost:3000` and you should see Console Remote Web App

<img width="886" alt="Screen Shot 2021-03-21 at 8 51 33 PM" src="https://user-images.githubusercontent.com/6027060/111929517-ee1f1100-8a8c-11eb-831d-217b3889b7af.png">

### Connect to your Private Server

There are couple of ways to connect from your script to Private server. See all methods https://github.com/kurdin/console-remote/blob/main/README.md#installation-and-use

#### A quick way to connect

Install `console-remote-client` package

```js
$ npm install console-remote-client
```

`import` or `require` package `console-remote-client` into your script only once and use `server` option to connect to your locally running private server on port 8088

```js
import consolere from 'console-remote-client';

consolere.connect({
  server: 'http://localhost:8088',
  channel: 'my-private-server-channel', // required
  redirectDefaultConsoleToRemote: true, // optional, default: false
  disableDefaultConsoleOutput: true, // optional, default: false
});

console.log('test log');
```

or with `require`

```js
const consolere = require('console-remote-client').connect({
  server: 'http://localhost:8088',
  channel: 'my-private-server-channel', // required
  redirectDefaultConsoleToRemote: true, // optional, default: false
  disableDefaultConsoleOutput: true, // optional, default: false
});

console.log('test log');
```

In your browser, go to url `http://localhost:3000/my-private-server-channel` and you should see your `test log` output in the Console App

### Deploy Console Server on Your Own Production Server

Copy this repo's files to your production server and install Node packages

```js
npm i
```

#### Run Console Server on Production

Change production options in `.env.production` file

Run Node app in production env with

```js
NODE_ENV=production npm run server
```

Use NGINX or any other Reverse Proxy server to forward all requests from your public domain port 443 or 80 to your locally running private console server on port 8088. See example in `config/console.nginx.example.conf`

#### Build Run Console App on Production

```js
npm run build
```

Copy all files in `./build` folder to your HTTP server root folder for your private remote console server domain

See examples of HTTP server configuration in `config/console.nginx.example.conf` and semi auto deployment script in `.shipit` files

## More Information

- Any **issues or questions** (no matter how basic), please open an issue

## Contact

- Website contact form: http://console.re#contact

## Copyright

Copyright (c) 2012 - 2021 Sergey Kurdin https://github.com/kurdin

Check my PasteBar - Limitless Clipboard App for Mac and Windows - https://github.com/PasteBar/PasteBarApp

Check my JavaScript Playground Web App https://runjs.co/s/OAZfi2HI7

Based on http://jsoverson.github.io/rcl
Copyright (c) 2012 by Jarrod Overson

## License

MIT License

See LICENSE.md
