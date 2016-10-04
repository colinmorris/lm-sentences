import React, { Component } from 'react';
import './App.css';
// These more granular imports are supposed to work, but seems like they don't?
//import { OverlayTrigger } from 'react-bootstrap/lib/OverlayTrigger';
//import { Tooltip } from 'react-bootstrap/lib/Tooltip';
import { Button, Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap';

/** Auto-generated data file. Totally not the right way to do this, but I don't
  want to add jquery as a dependency just for requests.
*/
import {SENTENCE_DATA} from './sentence-data';

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
      <OverlayTrigger placement="right" overlay={tooltip} trigger={['hover', 'focus']}>
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
    var id = this.props.sid;
    return (
      <div id={id} className="Sentence" style={style}>
      <h2><a href={'#'+id}>#{this.props.sid}</a> 
      Avg. bits/word: {this.props.sent.ppx.toFixed(0)}</h2>
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

function nearestTen(n) {
  return n + (10 - (n % 10));
}

class App extends Component {
  constructor(props) {
    super(props);
    var ms = 10;
    if (window.location.hash) {
      // have to slice out the '#'
      var headstart = nearestTen( window.location.hash.slice(1));
      if (!isNaN(headstart)) {
        ms = Math.max(ms, headstart);
      }
    }
    this.state = {corpus: "bill", maxSentences:ms};
    this.handleNav = this.handleNav.bind(this);
    this.more = this.moreSentences.bind(this);
    this.flood = this.openFloodgates.bind(this);
  }
  handleNav(navKey) {
    this.setState({corpus: navKey});
  }
  openFloodgates() {
    this.setState({maxSentences: undefined});
  }
  moreSentences() {
    this.setState({maxSentences:this.state.maxSentences+10});
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <Nav bsStyle="pills" activeKey={this.state.corpus}>
          <NavItem onSelect={this.handleNav} eventKey="bill">Billion word benchmark</NavItem>
          <NavItem onSelect={this.handleNav} eventKey="brown_news">Brown Corpus (news)</NavItem>
          <NavItem onSelect={this.handleNav} eventKey="brown_romance">Brown Corpus (romance)</NavItem>
        </Nav>
        {SENTENCE_DATA[this.state.corpus].slice(0,this.state.maxSentences).map( (s, i) => {
          return <Sentence sent={s} key={i} sid={i} />})}
        {this.state.maxSentences < SENTENCE_DATA[this.state.corpus].length ? 
          <div className="center-block">
            <Button bsStyle="primary" bsSize="large" onClick={this.more}>
              10 More
            </Button>
            <Button bsStyle="primary" bsSize="large" onClick={this.flood}>
              Show all ({SENTENCE_DATA[this.state.corpus].length})
            </Button>
          </div>
          : null}
      </div>
    );
  }
}


export default App;
