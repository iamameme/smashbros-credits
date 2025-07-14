import React, { useMemo, useRef, useEffect, useReducer, useState } from 'react'
import styled, { css, createGlobalStyle } from 'styled-components'
import { getLeaderboard, postToLeaderboard } from './helpers/database'
import useStore from './store'
import WebGl from './WebGl'

export default function Hud() {
  const points = useStore((state) => state.points)
  const health = useStore((state) => state.health)
  const sound = useStore((state) => state.sound)
  const toggle = useStore((state) => state.actions.toggleSound)
  const actions = useStore((state) => state.actions);
  const texts = useStore((state) => state.texts);
  const [mid, setMid] = useState(<div/>);
  const [scoreData, setScoreData] = useState();
  const [name, setName] = useState('mynameis');

  const seconds = useRef()
  let minScore = -1;
  if (scoreData && scoreData.length > 10) {
    minScore = scoreData[scoreData.length - 1];
  }

  const getLeaderboardData = () => {
    getLeaderboard().then(data => {
      const finalData = new Array(10).fill({ name: '...', score: 0});
      data.forEach((x,i) => finalData[i] = x);
      setScoreData(finalData);
    });
  }

  // useEffect(() => {
  //   getLeaderboardData();
  // }, [])

  useEffect(() => {
    const i = setInterval(() => {
      if (texts[texts.length - 1] && texts[texts.length - 1].posi > 1 ) {
        if (points > minScore) {
          setMid('highScoreContent');
        } else {
          setMid('leaderboardContent');
        }
        clearInterval(i);
      }
    }, 1000);
    return () => clearInterval(i)
  }, [texts])
  const score = useMemo(() => (points >= 1000 ? (points / 1000).toFixed(1) + 'K' : points), [points])

  let warning = '';
  if (!WebGl.isWebGLAvailable() ) {
    // Initiate function or other initializations here
    warning = "Please enable hardware acceleration in your browser!\n OR ELSE... the site won't work and I'll be sad :(";
  }

  const turnHardMode = (currentMode) => {
    localStorage.setItem('hardMode', !currentMode ? true : false);
    location.reload();
  };

  let hardMode = localStorage.getItem('hardMode')  ? localStorage.getItem('hardMode')  === 'true' : true;

  const submitHighScore = () => {
    //postToLeaderboard(name, points).then(x => getLeaderboardData());
    setMid('leaderboardContent');
  };
  const getStyle = (index) => {
    let style = {};
    switch (index) {
      case 0:
        style.color = 'rgb(239,0,0)';
        break;
      case 1:
        style.color = '#F400F4';
        break;
      case 2:
        style.color = '#00E001';
        break;
      case 3:
        style.color = '#06BABA';
        break;
      case 4:
        style.color = '#E5E500';
        break;
      default:
        style.color = 'white';
    }
    return style;
  };
  return (
    <div >
      <UpperLeft onClick={() => toggle()}>
        sound is {sound ? 'on' : 'off'}
        <br />
        click to turn {sound ? 'off' : 'on'}
        <br />
        <h3 
          onClick={() => turnHardMode(hardMode)}
          style={{ cursor: 'pointer'}}
        >{hardMode ? 'Turn off Hard Mode?' : 'Turn on Hard Mode?'}</h3>
      </UpperLeft>
      <UpperRight>
        <a target="_blank" href="https://github.com/iamameme">github</a>
        <br/>
        <a target="_blank" href="https://www.linkedin.com/in/steven-barsam/">linkedin</a>
      </UpperRight>
      {mid == 'leaderboardContent' && (
        <Middle>
          <h1>Leaderboard</h1>
          <table>
            {scoreData && scoreData.map((x,i) => (
              <tr style={getStyle(i)}>
                <td>{i + 1}</td>
                <td>{x.name}</td>
                <td style={{ textAlign: 'end' }}>{x.score}</td>
              </tr>
            ))}
          </table>
          <br></br>
          <h2 className="button" onClick={() => { location.reload()}}>Play Again?</h2>
        </Middle>
      )}
      {mid == 'highScoreContent' && (
        <Middle2>
          <h1 style={{ lineHeight: 1 }}>New High Score!</h1>
          <h2 style={{ textAlign: 'center'}}>{score}</h2>
          <br></br>
          <div style={{ display: 'flex', width: 680, margin: '0 auto'}}>
            <h2 className="entername">Type Name:</h2>
            <input defaultValue={"CLICKHERE"} maxLength={9} onChange={(e) => setName(e.target.value.toUpperCase())} />
          </div>
          <h2 className="button" style={{ marginTop: 100, fontSize: 24 }} onClick={() => submitHighScore()}>Submit High Score</h2>
          <div style={{ marginTop: 40 }} className="buttondont button" onClick={() => {
            setMid('leaderboardContent')
          }}>
            <span>{"or don't"}</span>
          </div>
        </Middle2>
      )}
      <MiddleUpper>
        {warning}
      </MiddleUpper>
      <LowerLeft>
        {/*<h2 ref={seconds}>0.0</h2>*/}
        <h1>{score}</h1>
      </LowerLeft>
      <MiddleLower>
        
      </MiddleLower>
      <Global />
      <LowerRight>
        {'Note: Please enable hardware acceleration in your browser.'}
      </LowerRight>
    </div>
  )
}

const base = css`
  font-family: 'Teko', sans-serif;
  position: absolute;
  text-transform: uppercase;
  font-weight: 900;
  font-variant-numeric: slashed-zero tabular-nums;
  line-height: 1em;
  pointer-events: none;
  color: indianred;
`

const Middle2 = styled.div`
  ${base}
  top: 140px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  width: 800px;
  text-align: center;
  font-family: 'Pixel';
  color: white;
  font-size: 30px;
  pointer-events: all;
  & > h1 {
    color: rgb(0 255 255);
    text-shadow: 5px 5px indianred;
    margin-bottom: 80px;
  }
  & * .entername {
    font-family: Pixel;
    font-size: 30px;
    width: 340px;
    color: yellow;
  }
  & * input {
    color: white;
    text-decoration: none;
    background: transparent;
    font-family: 'Pixel', sans-serif;
    font-size: 30px;
    border: none;
    width: 300px;
    height: 30px;
    margin-left: 30px;
    margin-top: 24px;
    text-transform: uppercase;
  }
  *:focus {
      outline: none;
  }
  & > .buttondont {
    font-size: 14px;
    margin-top: 40px;
    width: 120px !important;
    height: 64px;
    line-height: 1.5;
    margin-top: 40;
  }
  & > .button {
    width: 330px;
    border: 5px solid white;
    padding: 20px;
    border-radius: 50px;
    cursor: pointer;
    margin: 0 auto;
  }
  & > .button:hover {
    background: lightgrey;
  }
  & * span {
    top: -13px;
    position: relative;
  }
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const Middle = styled.div`
  ${base}
  top: 100px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  width: 800px;
  font-size: 2em;
  pointer-events: all;
  text-align: center;
  font-family: Pixel;
  & > h1 {
    font-size: 52px;
    color: rgb(0 255 255);
    text-shadow: 5px 5px indianred;
    margin-bottom: 70px;
  }
  & > table {
    border-collapse: separate;
    border-spacing: 12px;
    font-family: Pixel;
    width: 600px;
    margin: 20px auto;
  }
  & > .button {
    width: 220px;
    border: 5px solid blue;
    padding: 20px;
    border-radius: 50px;
    cursor: pointer;
    margin: 0 auto;
    font-size: 30px;
    color: blue;
  }
  & > .button:hover {
    background: #6262ff;
  }
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const MiddleUpper = styled.div`
  ${base}
  top: 20px;
  color: blue;
  white-space: pre-wrap;
  left: 22%;
  font-size: 2em;
  pointer-events: all;
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const MiddleLower = styled.div`
  ${base}
  bottom: -25px;
  white-space: pre-wrap;
  right: 10px;
  font-size: 2em;
  pointer-events: all;
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const UpperLeft = styled.div`
  ${base}
  top: 40px;
  left: 50px;
  font-size: 2em;
  transform: skew(5deg, 5deg);
  pointer-events: all;
  cursor: pointer;
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const UpperRight = styled.div`
  ${base}
  text-align: right;
  top: 40px;
  right: 50px;
  font-size: 2em;
  transform: skew(-5deg, -5deg);
  pointer-events: all;
  cursor: pointer;
  & > a {
    color: indianred;
    text-decoration: none;
  }
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const LowerLeft = styled.div`
  ${base}
  bottom: 5px;
  left: 50px;
  transform: skew(-5deg, -5deg);
  width: 200px;
  & > h1 {
    margin: 0;
    font-size: 10em;
    line-height: 1em;
  }
  & > h2 {
    margin: 0;
    font-size: 4em;
    line-height: 1em;
  }
  @media only screen and (max-width: 900px) {
    bottom: 30px;
    & > h1 {
      font-size: 6em !important;
    }
    & > h2 {
      font-size: 3em !important;
    }
  }
`

const LowerRight = styled.div`
  ${base}
  bottom: 70px;
  right: 50px;
  transform: skew(5deg, 5deg);
  height: 40px;
  width: 150px;
  & > div {
    height: 100%;
    background: indianred;
  }

  @media only screen and (max-width: 900px) {
    bottom: 50px;
    height: 40px;
    width: 150px;
  }
`

const Global = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    user-select: none;
    overflow: hidden;
  }

  #root {
    overflow: auto;
    padding: 0px;
  }

  body {
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif;
    color: black;
    background: white;
  }
`
