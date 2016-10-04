import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {SENTENCES} from './sentence-data';

class Sentence extends Component {
  render() {
    return (
      <div>
      <p>Avg. perplexity={this.props.sent.ppx}</p>
      <ul>{this.props.sent.words.map( w => {return <li>{w.word}</li>;})}</ul>
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
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <SentenceList sentsData={SENTENCES} />
      </div>
    );
  }
}

export default App;
