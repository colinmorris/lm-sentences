import React, { Component } from 'react';
import { Sentence } from './Sentence';
import { Link } from 'react-router';
import './Blog.css';
import ppxPlot from './ppx_per_corpus.png';

class Blog extends Component {
  render() {
    return (
<div className="blogWrapper">

<h2 className="title">How does a language model see the world?
</h2>

<Sentence corpus="bill" sid={141} />

<p>
The neural language model recently released by Google Brain (which I've written about previously <a href="http://colinmorris.github.io/blog/1b-words-char-embeddings">here</a> and <a href="http://colinmorris.github.io/blog/1b-words-filters">here</a>), reads in the first n words of a sentence and outputs a probability distribution for the next word. Each word is annotated according to how likely the model thought it was, given all the previous words. (The last "word" is an end-of-sentence marker - naturally, it's very likely after a period).
</p>

<p>
Green bars represent probabilities above 1% and scale linearly. Red bars represent more 'surprising' words, and scale logarithmically (hover to see the probabilities).
</p>

<p>
The Google researchers reported an average perplexity of 30 on the <a href="http://www.statmt.org/lm-benchmark/">Billion Words Benchmark</a> (the corpus it was trained on - also the source of the above sentence). We can roughly interpret this as the average word having probability 1 in 30 (using a particular kind of average - the geometric mean). If you prefer the log domain, you can think of this as meaning that the average word has entropy of about 5 bits.
</p>

<p>So this sentence is about average. Let's look at a sentence the model finds surprising:</p>

<Sentence corpus="bill" sid={3} />

<p>It's okay, neural network. I find this sentence weird too. If you asked me to guess the next word after "Abu Dhabi is going ahead to build solar", my first thoughts would be "panels", "plants", "power", "stations", "powered", "and"... "city" would be very low on the list. 
</p>

<p>
It looks like this sentence was actually taken from <a href="http://dotearth.blogs.nytimes.com/2008/02/04/solar-city-to-rise-in-persian-gulf-why-not-arizona/comment-page-1/#comment-6660">the comments section of a 2008 NYT article</a>. This is likely a parsing error (the Billion Words Dataset was sourced from a large crawl of online news from 2007-2011). 
</p>

<p>What about sentences the model assigns very high probability?</p>

<Sentence corpus="bill" sid={36} />

<p>
Wow, it hits every word out of the park except the first. (The model ingests sentences independently, with no context on what came before the beginning of the sentence. So basically all it can do is predict each word according to how often it appears as the first word.)
</p>

<p>
There are some mechanical patterns that occur a lot in certain kinds of reporting. The language model is pretty good at memorizing and exploiting these. One of them is:
</p>

<p>
<code>{'(Goalkeeper|Defender|Midfielder|Forward)s: \\(<FIRST> <LAST> ( <TEAM> ),\\)*'}</code>
</p>

<p>
(<a href="http://uk.reuters.com/article/soccer-euro-spain-squad-idUKB1968920120527">example</a>)
</p>

<p>
This is a good example of fitting closely to the corpus. In the grand scheme of things, this is actually a pretty weird sentence. But in the context of news from 2007-2011 (with heavy UK representation), it's highly likely.
</p>

<p>
But before we dismiss this as mere memorization, it's worth noting that there are only three occurrences of <code>^Goalkeepers :.*Iker</code> in the training set, and 0 occurrences of <code>^Goalkeepers :.*Jose Reina</code>. Assigning a 35% probability to "Reina" actually shows some pretty impressive generalization. It's never seen Jose Reina's name in a sentence with this format - it had to learn that it was a good fit from reading other kinds of sentences like "Liverpool 's Jose Reina was the only goalkeeper to make a genuine save".
</p>

<Sentence corpus="bill" sid={181} />

<p>
The last example may have flirted with overfitting, but the green picket fence over the second half of this sentence reeks of it. 
</p>

<p>
It turns out there are 35 occurrences in the training set of the exact sequence of words starting from "+ Rumor Watch" to the end of the sentence. Looks like the scraper accidentally included some headlines from a "related stories" sidebar on some pages.
</p>

<p>
This kind of thing doesn't really detract from the results reported for the language model. The n-gram models the researchers compared against will also happily memorize and exploit these artifacts.
</p>

<h2 className="title">Other Corpora</h2>

<p>
If overfitting is a fear, it'd be interesting to see how the language model does on sentences from a different corpus. Let's start with the news segment of the <a href="https://en.wikipedia.org/wiki/Brown_Corpus">Brown Corpus</a>. We're still in the news genre, but we're going back in time to 1961.
</p>

<Sentence corpus="brown_news" sid={59} />

<p>
Explicit mentions of years like this are an obvious example of how the time difference trips up the LM. If this sentence were written in 2007, it would imply that Hartsfield is some kind of lich.
</p>

<Sentence corpus="brown_news" sid={11} />

<p>
The LM has done a good job of memorizing contemporary figures like Iker Casillas or George Bush, but it doesn't do well with dated references to cold war politics.
</p>

<Sentence corpus="brown_news" sid={42} />

<p>
Even without explicit references to past years or historical figures, some of the events described just sound like the plot to an episode of Leave It To Beaver.
</p>

<p>
Let's take a look at a few sentences from a different segment of the Brown Corpus - romance novels.
</p>

<Sentence corpus="brown_romance" sid={3} />
<Sentence corpus="brown_romance" sid={24} />
<Sentence corpus="brown_romance" sid={29} />
<Sentence corpus="brown_romance" sid={77} />

<p>
Steamy, right? Unlike the news, the content here is pretty timeless - there are no references that give away that these are from stories written in 1961 rather than 2016. However, the genre switch seems to be a problem. The model hasn't seen a lot of poetic metaphors ("busy feet, showering like raindrops"), and the use of dialogue will be quite unlike most of what it's seen in the news.
</p>

<p>It turns out that, in terms of average perplexity, the Brown news and romance datasets are actually pretty close (and both much worse than the Billion Words dataset):</p>

<figure>
<img id="ppxPlot" className="center-block" src={ppxPlot} alt="A plot comparing the distribution of perplexities over sentences for three corpora" />
</figure>

<p>The romance dataset has a lower median than news, but its weirdest sentences are weirder. They both end up with an average perplexity of about 80, more than double the 30 perplexity achieved on the Billion Words dataset. (I only evaluated around 100 sentences for each of the Brown categories. Inference takes a few minutes per sentence, because computing the softmax probabilities for all ~1m words in the vocabulary is expensive.)</p>

<p>
There are lots more annotated sentences from the <Link to="/billion_words">Billion Words</Link>, <Link to="/brown_news">Brown (news)</Link> and <Link to="/brown_romance">Brown (romance)</Link> datasets, if you want to explore. The code for crunching the LM data and for these visualizations is available on Github <a href="https://github.com/colinmorris/lm1b-notebook">here</a> and <a href="https://github.com/colinmorris/lm-sentences">here</a> respectively.
</p>

</div>
    );
  }
}

export { Blog }
