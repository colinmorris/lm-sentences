import React, { Component } from 'react';
import './index.css';
import './App.css';
import { Navbar, Button, ButtonGroup, Nav, NavItem } from 'react-bootstrap';
import { IndexRoute, useRouterHistory, Router, Route } from 'react-router';
import { createHashHistory } from 'history';
import { LinkContainer } from 'react-router-bootstrap';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Sentence } from './Sentence';
import { Blog } from './Blog';

/** Auto-generated data file. Totally not the right way to do this, but I don't
  want to add jquery as a dependency just for requests.
*/
import { SENTENCE_DATA } from './sentence-data';

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
        sid={this.props.params.sid} corpus={this.props.params.corpus} />
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

        {indices.map( (i) => {
          return <Sentence key={i} sid={i} corpus={corpus} number={true} />})}
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

class Wrapper extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Navbar inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <span>Perplexing Sentences</span>
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

