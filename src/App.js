import React, { Component } from 'react';
import './index.css';
import './App.css';
// These more granular imports are supposed to work, but seems like they don't?
//import { OverlayTrigger } from 'react-bootstrap/lib/OverlayTrigger';
//import { Tooltip } from 'react-bootstrap/lib/Tooltip';
import { Button, ButtonGroup, Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useRouterHistory, hashHistory, Router, Route, Link } from 'react-router';
import { createHashHistory } from 'history';
import { LinkContainer } from 'react-router-bootstrap';
import PureRenderMixin from 'react-addons-pure-render-mixin';

/** Auto-generated data file. Totally not the right way to do this, but I don't
  want to add jquery as a dependency just for requests.
*/
import {SENTENCE_DATA} from './sentence-data';

const MAX_BAR_HEIGHT = 100;

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
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {hover: false};
    this.hovered = this.hovered.bind(this);
    this.dehovered = this.dehovered.bind(this);
  }
  hovered() {
    this.setState({hover: true});
  }
  dehovered() {
    this.setState({hover: false});
  }
    
  render() {
    var score = ppx_scale(this.props.ppx);
    const minheight = 5;
    var barStyle = {height: minheight + Math.abs(score)*(MAX_BAR_HEIGHT-minheight)};
    var tooltip = (
      <Tooltip 
        id={'wordtooltip-' + this.props.sid + '-' + this.props.wid}>
        Probability estimate: {prob_string(this.props.ppx)}
      </Tooltip>
    );
    // Haha, this is stuuuupid. Hack to let bars 'float:bottom', but adding a shadow
    // copy not removed from the normal flow.
    var bar = (
      <div>
      <OverlayTrigger onEnter={this.hovered} onExit={this.dehovered} 
      placement="right" overlay={tooltip} trigger={['hover', 'focus']}>
        <div className={score >= 0 ? "topBar bar" : "botBar bar"} style={barStyle}></div>
      </OverlayTrigger>
      <div style={barStyle} className="shadowBar"></div>
      </div>
    );
    return (
    <div className={"SentenceWord" + (this.state.hover ? " hov" : "")}>
      <div className="top flank">
        {(score >= 0) ? bar : null }
      </div>
      <OverlayTrigger onEnter={this.hovered} onExit={this.dehovered} 
      delayShow={500} placement="right" overlay={tooltip} trigger={['hover', 'focus']}>
        <div className="word">{this.props.word}</div>
      </OverlayTrigger>
      <div className="bot flank">
        {(score < 0) ? bar : null }
      </div>
    </div>
    );
  }
}

class Sentence extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  render() {
    //var style = {height: 600, width: '90%'};
    var style = {};
    var id = this.props.sid;
    return (
      <div id={id} className="Sentence" style={style}>
      <h2>#{id} 
      <Link to={`/${this.props.corpus}/${this.props.sid}`}>
        <span className="glyphicon glyphicon-link"></span>
      </Link>
      </h2>
      <h3>Avg. bits/word: {this.props.sent.ppx.toFixed(0)}</h3>
      <div className="Sentence-words">
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

class SoloSentence extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  render() {
    return (
    <div>
      Here is a sentence:
      <Sentence 
        sent={SENTENCE_DATA[this.props.params.corpus][this.props.params.sid]}
        sid={this.props.params.sid} corpus={this.props.params.corpus} />
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
    this.state = {corpus: "bill", maxSentences:ms, sort:undefined};
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
    var corpus = this.props.params.corpus;
    if (!corpus) {
      corpus = "bill";
    }
    //var sentences = SENTENCE_DATA[corpus].slice(0, this.state.maxSentences);
    var sentences = SENTENCE_DATA[corpus];
    var indices = [];
    var idxlimit = this.state.maxSentences === undefined ? sentences.length : this.state.maxSentences;
    for (var i=0; i < idxlimit; i++) {
      indices.push(i);
    }
    if (this.state.sort) {
      indices.sort((a,b) => {
        if (this.state.sort === 'desc') {
          var tmp = b;
          b = a;
          a = tmp;
        }
        return sentences[a].ppx - sentences[b].ppx;
      });
    }
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>

        <Nav bsStyle="pills">
          <LinkContainer to="/bill"><NavItem>Billion word benchmark</NavItem></LinkContainer>
          <LinkContainer to="/brown_news"><NavItem>Brown Corpus (news)</NavItem></LinkContainer>
          <LinkContainer to="/brown_romance"><NavItem>Brown Corpus (romance)</NavItem></LinkContainer>
        </Nav>
        Sort by...
        <ButtonGroup>
          <Button active={this.state.sort==='desc'} onClick={()=>{this.setState({sort:'desc'});}}>
            Least probable
          </Button>
          <Button active={this.state.sort==='asc'} onClick={()=>{this.setState({sort:'asc'});}}>
          Most probable</Button>
          <Button active={this.state.sort===undefined} onClick={()=>{this.setState({sort:undefined});}}>
          None</Button>
        </ButtonGroup>

        {indices.map( (i) => {
          return <Sentence sent={sentences[i]} key={i} sid={i} corpus={corpus} />})}
        {this.state.maxSentences < sentences.length ? 
          <div className="center-block moreButtons" style={{width:'20%', marginTop: 10}}>
            <Button bsStyle="primary" bsSize="large" onClick={this.more}>
              10 More
            </Button>
            <Button bsStyle="primary" bsSize="large" onClick={this.flood}>
              Show all ({sentences.length})
            </Button>
          </div>
          : null}
      </div>
    );
    // TODO: Should loading more sentences reset the sort?
  }
}

class Main extends Component {
  render() {
    const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });
    return (
    <Router history={appHistory}>
      <Route path="/(:corpus)" component={App}>
      </Route>
      <Route path="/:corpus/:sid" component={SoloSentence} />
    </Router>
    );
  }
}

export default Main;

