import React, { Component } from 'react';
import './App.css';

import {SENTENCES} from './sentence-data';

/* Map a word perplexity to a score in the range [-1, 1], 
*/
function ppx_scale(ppx) {
  var floor = Math.log(1/.95);
  var ceil = 7;
  // XXX: Current file already has log ppx. In other places, ppx is used. Need to be consistent.
  var log_ppx = ppx; //Math.log(ppx);
  // normalize to range [0, 1]
  var normalized = (ceil-log_ppx)/(ceil-floor);
  // to [-1, 1]
  return (normalized*2)-1;
}

class SentenceWord extends Component {
  render() {
    var score = ppx_scale(this.props.ppx);
    console.log(score);
    var barStyle = {height: Math.abs(score)*100 + "%"};
    return (
    <div className="SentenceWord">
      <div className="top flank">
        {(score >= 0) ? <div className="topBar bar" style={barStyle}></div> : null }
      </div>
      <div className="word">{this.props.word}</div>
      <div className="bot flank">
        {(score < 0) ? <div className="botBar bar" style={barStyle}></div> : null }
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
          return <SentenceWord word={w.word} ppx={w.ppx} key={i} />;
        })}
      </div>
      </div>
    );
  }
}

class SentenceList extends Component {
  render() {
    var createSentence = function(s, i) {
      return <Sentence sent={s} key={i} />;
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
