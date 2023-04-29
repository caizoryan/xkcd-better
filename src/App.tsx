import {
  Resource,
  Switch,
  Component,
  createResource,
  createSignal,
  For,
  createEffect,
  onMount,
  Show,
  Match,
} from "solid-js";
import {
  Canvas,
  changeBoxStates,
  handleColors,
  cleanBoxData,
  setBoxData,
} from "./Box";

import { randomFontWeight } from "./utlis";
import { FullPage } from "./FullPage";

import { Comic } from "./Types";
import "./style.css";
import { ComicBox, ComicBoxInteractive } from "./Comic";

// set endpoint here
let endpoint = `https://xo6yu9zb74.execute-api.us-east-2.amazonaws.com/staging`;
// endpoint = `http://localhost:8080`;
// work locally, push other api

// For States and animation
type States = "suggest" | "query" | "results" | "data";
const [state, setState] = createSignal<States>("suggest");

// ---------------------------
createEffect(() => {
  if (state() === "suggest") {
    handleColors(3);
  } else if (state() === "query") {
    handleColors(2);
  } else if (state() === "results") {
    handleColors(1);
  } else if (state() === "data") {
    handleColors(0);
  }
});

// ----------------------------
// results from search
async function fetchResults(prompt: string) {
  setState("query");
  setBoxData(
    2,
    <>
      <span style={randomFontWeight(100)}>{`${endpoint}/search?q=`}</span>
      <span style={randomFontWeight(800)}>{prompt}</span>
      <span style={randomFontWeight(700)}>{`&autocorrect=true`}</span>
    </>
  );
  return await fetch(`${endpoint}/search?q=${prompt}&autocorrect=true`)
    .then((res) => res.json())
    .then((res) => {
      if (res.rankings) {
        for (const x of res.rankings)
          setBoxData(
            1,
            <span style={randomFontWeight(700)}>{JSON.stringify(x) + " "}</span>
          );
        return res.rankings;
      } else if (typeof res != "string") {
        for (const x of res)
          setBoxData(
            1,
            <span style={randomFontWeight(700)}>{JSON.stringify(x) + " "}</span>
          );
        return res;
      } else return [{ ComicNum: 1969 }];
    });
}

// comic data
async function fetchComic(id: number) {
  setState("results");
  return await fetch(`https://getxkcd.vercel.app/api/comic?num=${id}`)
    .then((res) => res.json())
    .then((res) => {
      setBoxData(
        0,
        <span style={randomFontWeight(700)}>{JSON.stringify(res)}</span>
      );
      return res;
    });
}

// suggestions
async function fetchSuggestions(prompt: string) {
  // if (prompt.length === 0) return [""];
  setState("suggest");
  cleanBoxData(3, 500, 100);
  if (prompt != "")
    setBoxData(
      3,
      <span
        style={randomFontWeight(100)}
      >{`${endpoint}/suggest?q=${prompt}`}</span>
    );
  if (prompt.length > 0)
    return await fetch(`${endpoint}/suggest?q=${prompt}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.length > 0) {
          for (const x of res)
            setBoxData(
              3,
              <span style={randomFontWeight(700)}>{`${x}, `}</span>
            );
          setSelectedSuggestion(res.length);
          return res.reverse();
        } else return [""];
      });
  else return [""];
}

async function getExplain(query: Comic) {
  let title = query.title?.replace(" ", "_");
  let url = `https://www.explainxkcd.com/wiki/api.php?action=parse&page=${query.num}:_${title}&prop=wikitext&origin=*&format=json`;
  return await fetch(url)
    .then((res) => res.json())
    .then((res) => {
      return res.parse.wikitext["*"];
    });
}

async function fetchMoreComics(query: { prompt: string; lastIndex: number }) {
  setBoxData(
    2,
    <>
      <span style={randomFontWeight(100)}>{`${endpoint}/search?q=`}</span>
      <span style={randomFontWeight(800)}>{query.prompt}</span>
      <span style={randomFontWeight(700)}>{`&autocorrect=true&start=${
        query.lastIndex + 1
      }`}</span>
    </>
  );
  return await fetch(
    `${endpoint}/search?q=${query.prompt}&autocorrect=true&start=${
      query.lastIndex + 1
    }`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.rankings) {
        for (const x of res.rankings)
          setBoxData(
            1,
            <span style={randomFontWeight(700)}>{JSON.stringify(x) + " "}</span>
          );
        return res.rankings;
      } else if (typeof res != "string") {
        for (const x of res)
          setBoxData(
            1,
            <span style={randomFontWeight(700)}>{JSON.stringify(x) + " "}</span>
          );
        return res;
      } else return [{ ComicNum: 1969 }];
    });
}

// -------------------------------
// Variables
let inputBox: HTMLInputElement;
const [prompt, setPrompt] = createSignal(""); // upon pressing search
const [results] = createResource(prompt, fetchResults);
const [animate, setAnimate] = createSignal(false);
const [tempPrompt, setTempPrompt] = createSignal(""); // suggestions as you type
const [data, setData] = createSignal<Array<any>>([]);
const [suggestions] = createResource(tempPrompt, fetchSuggestions);
const [closed, setClosed] = createSignal(false);
const [imgY, setImgY] = createSignal("0px");
const [selected, setSelected] = createSignal(false);
const [comic, setComic] = createSignal<Comic>({
  num: 1969,
  safe_title: "Not Available",
});
const [explaination] = createResource(comic, getExplain);
const [selectedSuggestion, setSelectedSuggestion] = createSignal(0);
const [showSuggestions, setShowSuggestions] = createSignal(true);

const [nextPageValues, setNextPageValues] = createSignal({
  prompt: "",
  lastIndex: 0,
});
const [nextPage] = createResource(nextPageValues, fetchMoreComics);

// ------------------------------
// utlis
function handleSearch(prompt: string) {
  if (!closed()) setClosed(true);
  setShowSuggestions(false);
  setPrompt(prompt);
  setData([]);
  updateData(results);

  if (inputBox.value != prompt) {
    inputBox.value = prompt;
  }

  if (closed()) setAnimate(true);
  setTimeout(() => {
    setAnimate(false);
  }, 500);
}

function updateData(results: Resource<any>) {
  const swap: Array<any> = [];
  if (results.loading) {
    setTimeout(() => {
      updateData(results);
    }, 100);
  } else if (results.state === "ready") {
    console.log(results());
    for (let i = 0; i < results().length; i++) {
      let x = results()[i];
      fetchComic(x.ComicNum)
        .then((res) => {
          res.rank = i;
          res.interactive = x.Interactive;
          res.stats = x.TermSections;
          swap.push(res);
        })
        .then(() => {
          if (swap.length === results().length) {
            setData(swap.sort((a, b) => a.rank - b.rank));
            setState("data");
          }
        });
    }
  } else {
    console.log("Failed");
  }
}

function addData(results: any) {
  const swap: Array<any> = [];
  if (results.loading) {
    setTimeout(() => {
      addData(results);
    }, 100);
  } else if (results.state === "ready") {
    for (let i = 0; i < results().length; i++) {
      let x = results()[i];
      fetchComic(x.ComicNum)
        .then((res) => {
          res.rank = i + data().length;
          res.stats = x.TermSections;
          res.interactive = x.Interactive;
          swap.push(res);
        })
        .then(() => {
          if (swap.length === results().length) {
            setData([...data(), ...swap.sort((a, b) => a.rank - b.rank)]);
            setState("data");
          }
        });
    }
  } else {
    console.log("Failed");
  }
}

function handleNextPage(prompt: string) {
  setShowSuggestions(false);
  setNextPageValues({ prompt: prompt, lastIndex: data().length });
  addData(nextPage);
}

function handleSelected(comic: Comic) {
  setSelected(false);
  setComic(comic);
  setTimeout(() => {
    setSelected(true);
  }, 100);
}

// Need to refactor...
function handleKeyDown(event: KeyboardEvent) {
  if (inputBox === document.activeElement) {
    setShowSuggestions(true);
    if (event.key === "Tab") {
      event.preventDefault();
      if (selectedSuggestion() >= suggestions().length - 1) {
        setSelectedSuggestion(0);
        let prompt = suggestions()[selectedSuggestion()];
        if (inputBox.value != prompt) {
          inputBox.value = prompt;
        }
      } else if (selectedSuggestion() < suggestions().length - 1) {
        setSelectedSuggestion(selectedSuggestion() + 1);
        let prompt = suggestions()[selectedSuggestion()];
        if (inputBox.value != prompt) {
          inputBox.value = prompt;
        }
      }
    }
    if (event.key === "Enter") {
      handleSearch(inputBox.value);
      inputBox.blur();
    }
    if (event.key === "ArrowUp") {
      if (selectedSuggestion() === 0) {
        setSelectedSuggestion(suggestions().length - 1);
        let prompt = suggestions()[selectedSuggestion()];
        if (inputBox.value != prompt) {
          inputBox.value = prompt;
        }
      } else if (selectedSuggestion() != 0) {
        setSelectedSuggestion(selectedSuggestion() - 1);
        let prompt = suggestions()[selectedSuggestion()];
        if (inputBox.value != prompt) {
          inputBox.value = prompt;
        }
      }
    }
    if (event.key === "ArrowDown") {
      if (selectedSuggestion() >= suggestions().length - 1) {
        setSelectedSuggestion(0);
        let prompt = suggestions()[selectedSuggestion()];
        if (inputBox.value != prompt) {
          inputBox.value = prompt;
        }
      } else if (selectedSuggestion() < suggestions().length - 1) {
        setSelectedSuggestion(selectedSuggestion() + 1);
        let prompt = suggestions()[selectedSuggestion()];
        if (inputBox.value != prompt) {
          inputBox.value = prompt;
        }
      }
    }
  } else if (event.key === "Backspace" || event.key === "Escape") {
    if (selected()) setSelected(false);
    else if (closed()) {
      setClosed(false);
      inputBox.focus();
    }
  }
}

// ------------------------------
// components
const Search: Component = () => {
  return (
    <div
      class="search-container"
      style={closed() ? `right: 60vw` : `right: 10vw;`}
    >
      <Show
        when={
          suggestions() ? suggestions()[0] != "" && showSuggestions() : false
        }
      >
        <div class="suggestions-container">
          <For each={suggestions()}>
            {(suggested, i) => {
              if (suggested != "")
                return (
                  <p
                    onClick={() => handleSearch(suggested)}
                    class={
                      i() === selectedSuggestion()
                        ? "selected-suggestions suggestions"
                        : "suggestions"
                    }
                  >
                    {suggested}
                  </p>
                );
            }}
          </For>
        </div>
      </Show>
      <div class="search-and-button">
        <input
          ref={inputBox}
          type="text"
          onInput={(e) => setTempPrompt(e.currentTarget.value)}
        ></input>
        <button
          onClick={() => {
            handleSearch(inputBox.value);
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
};

const Results: Component = () => {
  return (
    <div class="results-page" style={closed() ? `right: 0vw;` : `right: -50vw`}>
      <For each={data()}>
        {(comic) =>
          comic.interactive ? (
            <ComicBoxInteractive
              click={handleSelected}
              imgY={imgY}
              comic={comic}
            ></ComicBoxInteractive>
          ) : (
            <ComicBox
              click={handleSelected}
              imgY={imgY}
              comic={comic}
            ></ComicBox>
          )
        }
      </For>
      <Switch>
        <Match
          when={
            data().length > 0 &&
            nextPageValues().lastIndex != data().length &&
            data().length > 9
          }
        >
          <button
            class="show-more"
            onClick={() => {
              handleNextPage(prompt());
            }}
          >
            Show More
          </button>
        </Match>

        <Match when={nextPageValues().lastIndex === data().length}>
          <p class="loading">Loading...</p>
        </Match>
      </Switch>
    </div>
  );
};

// ------------------------------
const App: Component = () => {
  onMount(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
  });
  function handleMouseMove(event: MouseEvent) {
    let x = event.clientX;
    let y = event.clientY;

    setImgY(y - 150 + "px");
    changeBoxStates(x, y);
  }

  return (
    <>
      <Canvas></Canvas>
      <Search></Search>
      <Results></Results>
      <FullPage
        selected={selected}
        setSelected={setSelected}
        comic={comic}
        explaination={explaination}
      ></FullPage>
    </>
  );
};

// ------------------------------
export { animate, closed, setClosed, App };
