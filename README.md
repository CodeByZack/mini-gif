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

## 感谢

核心代码来自于以下两个库，该库只是做了部分整合方便使用。

解码GIF摘自 [omggif](https://github.com/deanm/omggif)。

编码GIF摘自 [jsgif](https://github.com/antimatter15/jsgif)。


## 引入

### In Browser

```
<script src="./dist/mini-gif.umd.js"></script>
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

具体使用见example文件夹下示例。

该库只有两个核心对象GIFDecoder和GIFEncoder。简单导出了另外两个库的对象，建议直接看源文件注释了解相关API。


<details>

<summary>GIFDecoder</summary>

GIFDecoder 接受一个GIF的二进制流（Unit8Array格式/browser Buffer/node）

```
const curFile = input.files[0];
const arrBuf = await curFile.arrayBuffer();
const buffer = new Uint8Array(arrBuf);
const gifReader = new minigif.GIFDecoder(buffer);

```

|  方法   | 参数  | 作用 |
|  ----  | ----  | ---- |
|  numFrames  | --  | 帧数 |
|  loopCount  | ----  | 播放次数 |
|  frameInfo  | number  | 获取某一帧的信息（不含帧数据） |
|  decodeAndBlitFrameRGBA  | number,Uint8Array  | 需要传入一个arr接受该帧的rgba数据 |

|  属性 | 作用 |
|  ---- | ---- |
|  frameInfo.x  | x |
|  frameInfo.y  | y |
|  frameInfo.width  | w |
|  frameInfo.height  | h |
|  frameInfo.delay  | 该帧的delay时间 |
|  frameInfo.disposal  | 可能为（0-4）/值为1的时候需要保留前一帧的数据，要不会有空白像素 |

</details>



<details>
<summary>GIFEncoder</summary>

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


|  方法   | 参数  | 作用 |
|  ----  | ----  | ---- |
| start | -- | 写入GIF起始标志,之后才可以添加帧 |
| setSize | w,h | size/不设默认为第一帧取size |
| setDelay  | number 单位：1/100s | Sets the delay time between each frame, or changes it for subsequent frames(applies to last frame added) |
| setRepeat | number | 播放次数/0为永久 |
| setQuality | number(1-20) | default 10.(这个是采样率,值越小越精确,质量越高) |
| setDispose  | number disposal code | -- |
| setComment | string | -- |
| setFrameRate | number | Sets frame rate in frames per second. |
| setTransparent | color值 | -- |
| addFrame | ImageData/ctx | 添加帧/参数可以是ImageData或者ctx,ctx会自动获取画布的数据。|
| finish | -- | 结束添加数据，写入GIF结尾标志 |
| cont | -- | 所以之前的操作都会被清空 |
| stream | -- | 返回生成的ByteArray |

// 添加了ByteArray.getUnit8Array 可用于浏览器端获取Unit8Array数据
</details>


## 支持一下

如果该库对你有帮助，可以点一下 ⭐️!



