<h1 align="center">Welcome to mini-gif 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/CodeByZack/mini-gif#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/CodeByZack/mini-gif/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
</p>

> A GIF encoding and decoding library written in Vanilla JS
> 一个单纯的GIF编码/解码的JS库

### [地址](https://github.com/CodeByZack/mini-gif#readme)


## 引入

### In Browser

```
<script src="./dist/mini-gif.min.js"></script>

```

### ES Module

```
import minigif from 'minigif.js';

const { GIFEncoder, GIFDecoder } = minigif;

```

### NodeJS

```
const minigif = require('minigif.js');

const { GIFEncoder, GIFDecoder } = minigif;

```


## 使用方法

### GIFDecoder 

GIFDecoder 接受一个GIF的二进制流（Unit8Array格式）

```
const curFile = input.files[0];
const arrBuf = await curFile.arrayBuffer();
const buffer = new Uint8Array(arrBuf);
const gifReader = new minigif.GIFDecoder(buffer);

```

### GIFEncoder

```
const encoder = new minigif.GIFEncoder();
encoder.setRepeat(0);   // loop forever
encoder.setDelay(100);  // go to next frame every 100 ms
encoder.start();        // write header
encoder.addFrame(ctx);  // Render the frame from the canvas context.
ctx.font = '20px serif';
ctx.fillText('来追我啊！', 10, 50);
encoder.addFrame(ctx);  // Render the frame from the canvas context.
encoder.finish();       // finsh


const arr = encoder.stream().getUnit8Array();  //获取生成的Unit8Array
const file = new Blob([arr]);                  //生成文件
const url =  URL.createObjectURL(file);        //获取浏览器可用的地址

```

### 更多

见example文件夹下示例。

## 🤝 问题

欢迎任何issue，[issues 页面](https://github.com/CodeByZack/mini-gif/issues)。

## 支持一下

如果该库对你有帮助，可以点一下 ⭐️!

## 感谢

核心代码来自于以下两个库，该库只是做了部分整合方便使用。

解码GIF摘自 [omggif](https://github.com/deanm/omggif)。

编码GIF摘自 [jsgif](https://github.com/antimatter15/jsgif)。

