ToDo
=====================

A simple ToDo list that enables you to easily assign tasks to your friends on Facebook.

## Demo

![](http://g.recordit.co/92duvRcRvc.gif)

For full version: http://recordit.co/92duvRcRvc

```
$ git clone git@github.com:rueian/ToDo.git
$ cd ToDo
$ cp config/index.js.example config/index.js # and modify it for your settings.
$ npm install
$ npm start
```
then open http://localhost:3000

## Deploy

Follow the instructions on the web hosting docs of Parse to install the cli tool.

And use that cli tool to generate `.parse.local` and `.parse.project` files in the parse folder.

After that, you can use the following commands to deploy this to your Parse service.

```
$ npm run build
$ cd parse
$ parse deploy
```

## Test

```
$ npm test
```

## License

CC0 (public domain)
