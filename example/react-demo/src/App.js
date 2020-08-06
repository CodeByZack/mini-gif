import React, { useRef, useState, useEffect } from 'react';
import './App.scss';
import minigif from './mini-gif.esm';
console.log(minigif);

const useGif = (file)=>{
  const [gifInfo,setGifInfo] = useState();
  const [gifFrames,setGifFrames] = useState([]);

  const decode = async (file)=>{
    const arrBuf = await file.arrayBuffer();
    const buf = new Uint8Array(arrBuf);
    const decodeGif = new minigif.GIFDecoder(buf)
    
    const numFrames = decodeGif.numFrames();
    const loopCount = decodeGif.loopCount();

    const gifInfo = {
      numFrames,loopCount,
      width : decodeGif.width,
      height : decodeGif.height
    }
    
    setGifInfo(gifInfo);

    const frames = [];
    for(let i = 0; i < numFrames; i++){
      const frameInfo = decodeGif.frameInfo(i);
      const data = new Uint8ClampedArray(4*decodeGif.width*decodeGif.height);
      const imagedata = new ImageData(data,decodeGif.width, decodeGif.height);
      if (i > 0 && frameInfo.disposal < 2) {
          imagedata.data.set(new Uint8ClampedArray(frames[i - 1].data.data));
      }
      decodeGif.decodeAndBlitFrameRGBA(i,imagedata.data);
      frames.push({data:imagedata,delay:frameInfo.delay*10});
    };
    setGifFrames(frames);
  };

  useEffect(()=>{
    if(file){
      decode(file);
    }
  },[file]);

  return {gifInfo,gifFrames};
};


function App() {

  const [ file ,setFile ] = useState();
  const [playStatus,setPlayStatus] = useState('PAUSED');
  const [nowFrame,setNowFrame] = useState(0);
  const [jumpFrame,setJumpFrame] = useState();
  const [text,setText] = useState('');
  const [downloadUrl,setDownloadUrl] = useState('');
  const [changedFrames,setChangedFrames] = useState([]);
  const {gifInfo,gifFrames} = useGif(file); 
  const playCanvasRef = useRef();

  const handleClick = (type)=>()=>{
    if(type === 'PLAY'){
      setPlayStatus('PLAY');
      startLoop();
    }else if(type === 'PAUSE'){
      setPlayStatus('PAUSE');
    }else if(type === 'JUMP'){
      if(jumpFrame === -1)return;
      setPlayStatus('PAUSE');
      setNowFrame(jumpFrame);
    }else if(type === 'ADDTEXT'){
      if(jumpFrame === -1)return;
      setPlayStatus('PAUSE');
      addText();
    }else if(type === 'DOWNLOAD'){
      if(changedFrames.length === 0){
        alert('没有改动');
        return;
      }
      generateGif();
    }
  };

  const handleFile = (e)=>{
    const file = e.target.files[0];
    setFile(file);
  };

  const generateGif = ()=>{
    const encoder = new minigif.GIFEncoder();
    const canvas = playCanvasRef.current;
    const ctx = canvas.getContext('2d');
    encoder.setRepeat(0);   // loop forever
    encoder.setDelay(100);  // go to next frame every 100 ms

    encoder.start();        // write header
    encoder.setSize(gifInfo.width,gifInfo.height);
    // console.log(gifFrames[nowFrame].data.data);
    // encoder.addFrame(gifFrames[nowFrame].data.data,true);  // Render the frame from the canvas context.
    // ctx.font = '20px serif';
    // ctx.fillText('来追我啊！', 10, 50);
    // encoder.addFrame(ctx);  // Render the frame from the canvas context.
    for (let index = 0; index < gifFrames.length; index++) {
      const frame = changedFrames[index] || gifFrames[index];
      console.log(frame);
      encoder.addFrame(frame.data.data,true);
      encoder.setDelay(frame.delay);
    }
    encoder.finish();        // finish
    const arr = encoder.stream().getUnit8Array();
    const file = new Blob([arr]);
    console.log(file);
    const url =  URL.createObjectURL(file);
    setDownloadUrl(url);
  };

  const startLoop = ()=>{
    setTimeout(loop,gifFrames[nowFrame].delay);
  };

  const loop = ()=>{

    if(playStatus === 'PAUSE'){
        return;
    }
    let next;
    if(nowFrame + 1 >= gifInfo.numFrames){
      next = 0;
    }else{
      next = nowFrame+1;
    }
    setNowFrame(next);
  };

  const addText = ()=>{
    const canvas = playCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = '20px serif';
    ctx.fillText(text, 10, 50);
    const frame = gifFrames[nowFrame];
    console.log(frame);
    const data = ctx.getImageData(0, 0 , frame.data.width,frame.data.height);
    const frames = [...changedFrames];
    frames[nowFrame] = {data,delay:frame.delay};
    setChangedFrames(frames);
  };

  useEffect(()=>{
    if(playCanvasRef.current && gifFrames.length){
      const canvas = playCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = gifInfo.width;
      canvas.height = gifInfo.height;
      const frame = changedFrames[nowFrame] || gifFrames[nowFrame];
      ctx.putImageData(frame.data,0,0);
      startLoop();
    }
  },[gifInfo,gifFrames,nowFrame]);

  const tipText = gifInfo ? `width:${gifInfo.width}/height:${gifInfo.height}/总帧数:${gifInfo.numFrames}`:'请选择GIF文件'

  return (
    <div className="App">

      <div className="decode-box">
        <div className="line">
          <canvas ref={playCanvasRef} />
        </div>
        <div className="line">
          <input onChange={handleFile} type='file' />
        </div>
        <div className='tip line'>
          {tipText}
        </div>
        <div  className="line">
          <p>输入想修改的帧</p>
          <input value={jumpFrame} type='number' onChange={(e)=>setJumpFrame(e.target.value)} placeholder='输入想跳到的帧' />
          <p>想添加的文字</p>
          <input value={text} onChange={(e)=>setText(e.target.value)} placeholder='输入想添加的文字' />
        </div>
        <div className='btn-group line'>
          <div className='btn' onClick={handleClick('PLAY')}>播放</div>
          <div className='btn' onClick={handleClick('PAUSE')}>暂停</div>
          <div className='btn' onClick={handleClick('JUMP')}>Jump</div>
          <div className='btn' onClick={handleClick('ADDTEXT')}>为该帧添加文字</div>
          <div className='btn' onClick={handleClick('DOWNLOAD')}>将改动生成GIF</div>
        </div>
      </div>

      <div className='line'>
        {downloadUrl && <img src={downloadUrl} />}
        {downloadUrl && <a download="demo.gif" href={downloadUrl}>下载生成的GIF</a>}
      </div>
    </div>
  );
}

export default App;
