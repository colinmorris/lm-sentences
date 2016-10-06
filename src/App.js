import React, { Component } from 'react';
import './index.css';
import './App.css';
import { Navbar, Button, ButtonGroup, Nav, NavItem } from 'react-bootstrap';
import { Link, IndexRoute, useRouterHistory, Router, Route } from 'react-router';
import { createHashHistory } from 'history';
import { LinkContainer } from 'react-router-bootstrap';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Sentence } from './Sentence';
import { Blog } from './Blog';

/** Auto-generated data file. Totally not the right way to do this, but I don't
  want to add jquery as a dependency just for requests.
*/
import { SENTENCE_DATA } from './sentence-data';

var corpus_to_desc = {
  bill: 'a heldout fold of the Billion Word Benchmark',
  brown_news: 'the news section of the Brown Corpus',
  brown_romance: 'the romance section of the Brown Corpus'
};

class SoloSentence extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  render() {
    return (
      <div>
      <Sentence 
        sid={this.props.params.sid} corpus={this.props.params.corpus} />
      <p>
      This sentence was taken from {corpus_to_desc[this.props.params.corpus]} and annotated with probabilities assigned by <a href="https://github.com/tensorflow/models/tree/master/lm_1b">Google's neural language model</a>, trained on the One Billion Word Benchmark. Check out <Link to="/">this post</Link> for more information, or use the links at the top of this page to see more sentences from this or other corpora.
      </p>
      </div>
    );
  }
}

class SentenceList extends Component {
  constructor(props) {
    super(props);
    var ms = 10;
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
    if (!corpus || corpus === "billion_words") {
      corpus = "bill";
    }
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
      <div>
        <div>
        <h3>Sort by...</h3>
        <ButtonGroup>
          <Button active={this.state.sort==='desc'} onClick={()=>{this.setState({sort:'desc'});}}>
            Least probable
          </Button>
          <Button active={this.state.sort==='asc'} onClick={()=>{this.setState({sort:'asc'});}}>
          Most probable</Button>
          <Button active={this.state.sort===undefined} onClick={()=>{this.setState({sort:undefined});}}>
          None</Button>
        </ButtonGroup>
        <p>These are randomly selected sentences from {corpus_to_desc[corpus]} annotated with probabilities assigned by <a href="https://github.com/tensorflow/models/tree/master/lm_1b">Google's neural language model</a>, trained on the One Billion Word Benchmark. Check out <Link to="/">this post</Link> for more information.
        </p>
        </div>

        {indices.map( (i) => {
          return <span key={i}><Sentence sid={i} corpus={corpus} number={true} /><br /></span>})}
        {this.state.maxSentences < sentences.length ? 
          <div className="center-block moreButtons" style={{width:'20%', marginTop: 10}}>
            <Button bsStyle="primary" bsSize="large" onClick={this.more}>
              10 More
            </Button>
            <Button bsStyle="primary" bsSize="large" onClick={this.flood}>
              Show all {sentences.length} (slow)
            </Button>
          </div>
          : null}
      </div>
    );
    // TODO: Should loading more sentences reset the sort?
  }
}

class Wrapper extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Navbar inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/"><span>Perplexing Sentences</span></Link>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav bsStyle="pills">
            <LinkContainer to="/" onlyActiveOnIndex={true}><NavItem>Intro</NavItem></LinkContainer>
            <LinkContainer to="/billion_words"><NavItem>Billion word benchmark</NavItem></LinkContainer>
            <LinkContainer to="/brown_news"><NavItem>Brown Corpus (news)</NavItem></LinkContainer>
            <LinkContainer to="/brown_romance"><NavItem>Brown Corpus (romance)</NavItem></LinkContainer>
          </Nav>
        </Navbar>

        {this.props.children}

        <footer>
          <div className="row">
          <div className="col-xs-6">
          <a href="https://github.com/colinmorris">
            <span className="footerCol-1 icon icon--github">
              <svg viewBox="0 0 16 16"><path fill="#828282" d="M7.999,0.431c-4.285,0-7.76,3.474-7.76,7.761 c0,3.428,2.223,6.337,5.307,7.363c0.388,0.071,0.53-0.168,0.53-0.374c0-0.184-0.007-0.672-0.01-1.32 c-2.159,0.469-2.614-1.04-2.614-1.04c-0.353-0.896-0.862-1.135-0.862-1.135c-0.705-0.481,0.053-0.472,0.053-0.472 c0.779,0.055,1.189,0.8,1.189,0.8c0.692,1.186,1.816,0.843,2.258,0.645c0.071-0.502,0.271-0.843,0.493-1.037 C4.86,11.425,3.049,10.76,3.049,7.786c0-0.847,0.302-1.54,0.799-2.082C3.768,5.507,3.501,4.718,3.924,3.65 c0,0,0.652-0.209,2.134,0.796C6.677,4.273,7.34,4.187,8,4.184c0.659,0.003,1.323,0.089,1.943,0.261 c1.482-1.004,2.132-0.796,2.132-0.796c0.423,1.068,0.157,1.857,0.077,2.054c0.497,0.542,0.798,1.235,0.798,2.082 c0,2.981-1.814,3.637-3.543,3.829c0.279,0.24,0.527,0.713,0.527,1.437c0,1.037-0.01,1.874-0.01,2.129 c0,0.208,0.14,0.449,0.534,0.373c3.081-1.028,5.302-3.935,5.302-7.362C15.76,3.906,12.285,0.431,7.999,0.431z"/></svg>
            <span >colinmorris</span>
            </span>
          </a>
          </div>

          <div className="col-xs-6">
            <span className="footerCol-2">
              <a href="http://colinmorris.github.io/about/">about me</a>
            </span>
          </div>
          </div>
        </footer>
      </div>
    );
  }
}



class Main extends Component {
  render() {
    const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });
    return (
    <Router history={appHistory}>
      <Route path="/" component={Wrapper}>
        <IndexRoute component={Blog} />
        <Route path=":corpus" component={SentenceList} />
        <Route path=":corpus/:sid" component={SoloSentence} />
      </Route>
    </Router>
    );
  }
}

export default Main;

