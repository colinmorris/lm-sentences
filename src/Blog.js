import React, { Component } from 'react';
import { Sentence } from './Sentence';

class Blog extends Component {
  render() {
    return (
<div>

<p>How does a language model see the world?
</p>

<Sentence corpus="bill" sid={141} />

<p>
The neural language model recently released by Google Brain (which I've written about previously here and here), reads in the first n words of a sentence and outputs a probability distribution for the next word. Each word is annotated according to how likely the model thought it was, given all the previous words. (The last "word" is an end-of-sentence marker).
</p>

<p>
Green bars represent probabilities above 1% and scale linearly. Red bars represent more 'surprising' words, and scale logarithmically (hover to see the probabilities).
</p>


</div>
    );
  }
}

export { Blog }
