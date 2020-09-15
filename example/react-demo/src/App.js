import React, { useRef, useState, useEffect } from "react";
import minigif from "mini-gif";
import {
  Container,
  Paper,
  Typography,
  Toolbar,
  AppBar,
  Button,
  ButtonGroup,
  TextField,
  Slider,
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {
  console.log(theme);

  return {
    mt10: {
      marginTop: theme.spacing(2),
    },
    tipline: {
      textAlign: "left",
    },
    tipLabel: {
      color: theme.palette.secondary.main,
      paddingRight: theme.spacing(2),
    },
  };
});

const useGif = (file) => {
  const [gifInfo, setGifInfo] = useState();
  const [gifFrames, setGifFrames] = useState([]);

  const decode = async (file) => {
    const arrBuf = await file.arrayBuffer();
    const buf = new Uint8Array(arrBuf);
    const decodeGif = new minigif.GIFDecoder(buf);

    const numFrames = decodeGif.numFrames();
    const loopCount = decodeGif.loopCount();

    const gifInfo = {
      numFrames,
      loopCount,
      width: decodeGif.width,
      height: decodeGif.height,
    };

    setGifInfo(gifInfo);

    const frames = [];
    for (let i = 0; i < numFrames; i++) {
      const frameInfo = decodeGif.frameInfo(i);
      const data = new Uint8ClampedArray(
        4 * decodeGif.width * decodeGif.height
      );
      const imagedata = new ImageData(data, decodeGif.width, decodeGif.height);
      if (i > 0 && frameInfo.disposal < 2) {
        imagedata.data.set(new Uint8ClampedArray(frames[i - 1].data.data));
      }
      decodeGif.decodeAndBlitFrameRGBA(i, imagedata.data);
      frames.push({ data: imagedata, delay: frameInfo.delay * 10 });
    }
    setGifFrames(frames);
  };

  useEffect(() => {
    if (file) {
      decode(file);
    }
  }, [file]);

  return { gifInfo, gifFrames };
};

function App() {
  const [file, setFile] = useState();
  const [playStatus, setPlayStatus] = useState("PAUSED");
  const [nowFrame, setNowFrame] = useState(0);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [changedFrames, setChangedFrames] = useState([]);
  const [inputConfig,setInputConfig] = useState({});
  const { gifInfo, gifFrames } = useGif(file);
  const playCanvasRef = useRef();
  const styles = useStyles();

  const handleInput = (key)=>(e)=>{
    const value = e.target.value;
    setInputConfig({...inputConfig,[key]:value});
  };

  const handleClick = (type) => () => {
    if (type === "ADDTEXT") {
      handleEdit();
    } else if (type === "RESET") {
      setChangedFrames([]);
    } else if (type === "DOWNLOAD") {
      if (changedFrames.length === 0) {
        alert("没有改动");
        return;
      }
      generateGif();
    }
  };

  const handleEdit = ()=>{
    const { x,y,text,startFrame,endFrame } = inputConfig;
    if(!x || !y || !text || !startFrame || !endFrame){
      alert('检查输入!')
      return ;
    }
    if(playStatus === 'PLAY')setPlayStatus('PAUSE');
    
    const canvas = playCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = "20px serif";
    const resArr = [];
    for(let i = startFrame; i<=endFrame; i++){
      const frame = gifFrames[i];
      const w = frame.data.width;
      const h = frame.data.height;
      const delay = frame.delay;
      ctx.putImageData(frame.data, 0, 0);
      ctx.fillStyle = "white";
      ctx.fillText(text, x, y);
      const data = ctx.getImageData(0, 0, w, h);
      resArr[i] = {data,delay}
    };

    
    const frames = {...changedFrames,...resArr,length:gifInfo.numFrames};
    console.log(frames);
    setChangedFrames(frames);
  };

  const handleChangeStatus = (type)=>()=>{
    if(type === 'PLAY' && playStatus !== 'PLAY'){      
      setPlayStatus(type);
      startLoop(true);
    }else if(type === 'PAUSE' && playStatus !== 'PAUSE'){
      setPlayStatus(type);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const generateGif = () => {
    const encoder = new minigif.GIFEncoder();
    const canvas = playCanvasRef.current;
    encoder.setRepeat(0); // loop forever
    encoder.setDelay(100); // go to next frame every 100 ms

    encoder.start(); // write header
    encoder.setSize(gifInfo.width, gifInfo.height);
    // console.log(gifFrames[nowFrame].data.data);
    // encoder.addFrame(gifFrames[nowFrame].data.data,true);  // Render the frame from the canvas context.
    // ctx.font = '20px serif';
    // ctx.fillText('来追我啊！', 10, 50);
    // encoder.addFrame(ctx);  // Render the frame from the canvas context.
    for (let index = 0; index < gifFrames.length; index++) {
      const frame = changedFrames[index] || gifFrames[index];
      console.log(frame);
      encoder.addFrame(frame.data.data, true);
      encoder.setDelay(frame.delay);
    }
    encoder.finish(); // finish
    const arr = encoder.stream().getUnit8Array();
    const file = new Blob([arr]);
    console.log(file);
    const url = URL.createObjectURL(file);
    setDownloadUrl(url);
  };

  const startLoop = () => {
    setTimeout(loop,gifFrames[nowFrame].delay);
  };

  const loop = () => {
    let next;
    if (nowFrame + 1 >= gifInfo.numFrames) {
      next = 0;
    } else {
      next = nowFrame + 1;
    }
    setNowFrame(next);
  };

  const drawFrame = ()=>{
    const canvas = playCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const frame = changedFrames[nowFrame] || gifFrames[nowFrame];
    ctx.putImageData(frame.data, 0, 0);
  }

  const handleSliderChange = (e, num) => {
    if (playStatus === "PLAY") return;
    if (num === jumpFrame) return;
    setJumpFrame(num);
  };

  useEffect(() => {
    if (playStatus === "PAUSE") {
      setNowFrame(jumpFrame);
    }
  }, [jumpFrame]);

  useEffect(()=>{
    if(!playCanvasRef.current || !gifInfo)return;
    const canvas = playCanvasRef.current;
    canvas.width = gifInfo.width;
    canvas.height = gifInfo.height;
  },[gifInfo]);

  useEffect(() => {
    if (playCanvasRef.current && gifFrames.length) {
      drawFrame();
      if (playStatus === "PAUSE") { return;}
      startLoop();
    }
  }, [gifInfo, gifFrames, nowFrame]);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">表情包DEMO</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Paper className={styles.mt10} variant="outlined" square>
          <canvas ref={playCanvasRef} />
        </Paper>
        <Slider
          max={gifInfo?.numFrames ? gifInfo?.numFrames - 1 : 0}
          value={jumpFrame}
          valueLabelDisplay="auto"
          getAriaValueText={v=>v}
          onChange={handleSliderChange}
          aria-labelledby="continuous-slider"
        />

        {gifInfo && (
          <div className={styles.tipline}>
            <Typography component="span">Width:</Typography>
            <Typography component="span" className={styles.tipLabel}>
              {gifInfo.width}
            </Typography>
            <Typography component="span">Height:</Typography>
            <Typography component="span" className={styles.tipLabel}>
              {gifInfo.height}
            </Typography>
            <Typography component="span">总帧数:</Typography>
            <Typography component="span" className={styles.tipLabel}>
              {gifInfo.numFrames}
            </Typography>
          </div>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            {!gifInfo && (
              <Button variant="contained" color="primary" disableElevation>
                选择GIF文件
                <TextField
                  style={{ width: "100%", opacity: 0, position: "absolute" }}
                  label="请选择GIF文件"
                  placeholder="请选择gif文件"
                  type="file"
                  onChange={handleFile}
                />
              </Button>
            )}
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="起始帧"
              type="number"
              onChange={handleInput('startFrame')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="结束帧"
              type="number"
              onChange={handleInput('endFrame')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="X坐标"
              type="number"
              onChange={handleInput('x')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Y坐标"
              onChange={handleInput('y')}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              style={{ width: "100%" }}
              onChange={handleInput('text')}
              label="添加的文字"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        <ButtonGroup
          className={styles.mt10}
          color="primary"
          disableElevation
          variant="contained"
          aria-label="contained  primary button group"
        >
          <Button onClick={handleChangeStatus("PLAY")}>播放</Button>
          <Button onClick={handleChangeStatus("PAUSE")}>暂停</Button>
          <Button onClick={handleClick("ADDTEXT")}>确认编辑</Button>
          <Button onClick={handleClick("RESET")}>清除编辑</Button>
        </ButtonGroup>
        <Paper className={styles.mt10} variant="outlined" square>
          {downloadUrl && <img src={downloadUrl} />}
        </Paper>
        <ButtonGroup
          className={styles.mt10}
          color="primary"
          disableElevation
          variant="contained"
          aria-label="contained  primary button group"
        >
          <Button onClick={handleClick("DOWNLOAD")}>生成GIF</Button>
          {downloadUrl&&<Button download="demo.gif" href={downloadUrl}>下载生成的GIF</Button>}
        </ButtonGroup>
      </Container>
    </div>
  );
}

export default App;
