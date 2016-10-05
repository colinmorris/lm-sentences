import React, { Component } from 'react';
import { Link } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    // TODO: clamp to range
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
    const id = this.props.sid;
    const sent = SENTENCE_DATA[this.props.corpus][this.props.sid];
    return (
      <div id={id} className="Sentence">
      <h2>#{id} 
      <Link to={`/${this.props.corpus}/${this.props.sid}`}>
        <span className="glyphicon glyphicon-link"></span>
      </Link>
      </h2>
      <h3>Avg. bits/word: {Math.log2(sent.ppx).toFixed(1)}. 
      Perplexity: {sent.ppx.toFixed(0)}</h3>
      <div className="Sentence-words">
        {sent.words.map( (w,i) => {
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

export default Sentence;
