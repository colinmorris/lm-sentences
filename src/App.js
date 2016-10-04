import React, { Component } from 'react';
import './App.css';
//import { OverlayTrigger } from 'react-bootstrap/lib/OverlayTrigger';
//import { Tooltip } from 'react-bootstrap/lib/Tooltip';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


import {SENTENCES} from './sentence-data';

/* Map a word perplexity to a score in the range [-1, 1].
 * Turns out ppx will actually be a log perplexity - I named
 * a bunch of variables wrong up to this point. oops.
*/
function ppx_scale(ppx) {
  var score;
  var range;
  var thresh = Math.log(1/.01);
  var high = ppx < thresh;
  if (high) {
    // 'high' probability
    // normalize using a linear scale
    score = 1/Math.exp(ppx);
    range = [1.0, .01];
  } else {
    // log scale
    score = ppx;
    //range = [Math.log(1/.01), 17];
    range = [17, thresh];
  }
  // normalize to range [0, 1]
  var floor = range[0];
  var ceil = range[1];
  var normalized = (ceil-score)/(ceil-floor);
  return normalized * (high ? 1 : -1);
}

function prob_string(log_ppx) {
  var ppx = Math.exp(log_ppx);
  var p = 1/ppx;
  if (p >= .01) {
    var digits = Math.max(0, 
      // it works, trust me
      (Math.log10(1-p)*-1)-1
    );
    // TODO: clamp to range
    return (100*p).toFixed(digits) + "%";
  } else {
    return "1 in " + ppx.toLocaleString(undefined, {maximumSignificantDigits:1});
  }
}

class SentenceWord extends Component {
  render() {
    var score = ppx_scale(this.props.ppx);
    const minheight = 5;
    var barStyle = {height: minheight + Math.abs(score)*(100-minheight) + "%"};
    var tooltip = (
      <Tooltip 
        id={'wordtooltip-' + this.props.sid + '-' + this.props.wid}>
        Probability estimate: {prob_string(this.props.ppx)}
      </Tooltip>
    );
    var bar = (
      <OverlayTrigger placement="left" overlay={tooltip} trigger={['hover', 'focus']}>
        <div className={score >= 0 ? "topBar bar" : "botBar bar"} style={barStyle}></div>
      </OverlayTrigger>
    );
    return (
    <div className="SentenceWord">
      <div className="top flank">
        {(score >= 0) ? bar : null }
      </div>
      <div className="word">{this.props.word}</div>
      <div className="bot flank">
        {(score < 0) ? bar : null }
      </div>
    </div>
    );
  }
}

class Sentence extends Component {
  render() {
    //var style = {height: 600, width: '90%'};
    var style = {};
    return (
      <div className="Sentence" style={style}>
      <p>Avg. perplexity={this.props.sent.ppx}</p>
      <div>
        {this.props.sent.words.map( (w,i) => {
          return (
          <SentenceWord 
            word={w.word} 
            ppx={w.ppx} 
            key={i} sid={this.props.sid} wid={i} />
          );
        })}
      </div>
      </div>
    );
  }
}

class SentenceList extends Component {
  render() {
    var createSentence = function(s, i) {
      return <Sentence sent={s} key={i} sid={i} />;
    };
    return <div>{this.props.sentsData.map(createSentence)}</div>;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <SentenceList sentsData={SENTENCES.splice(0,5)} />
      </div>
    );
  }
}

export default App;
