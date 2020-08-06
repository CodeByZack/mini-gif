const minigif = require('../dist/mini-gif.min');
const fs = require('fs');
const path = require('path');

const buffer = fs.readFileSync( path.resolve(__dirname,'./test.gif'));
const gifReader = new minigif.GIFDecoder(buffer);



console.log(gifReader);