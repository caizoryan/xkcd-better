import {
  JSXElement,
  createResource,
  Switch,
  Match,
  Component,
  createSignal,
  For,
  createEffect,
  onMount,
  Show,
} from "solid-js";
import {
  Canvas,
  changeBoxStates,
  handleColors,
  cleanBoxData,
  setBoxData,
} from "./Box";

import { fontWght as randomFontWeight } from "./utlis";
import { FullPage } from "./FullPage";

import { Comic } from "./Types";
import "./style.css";
import { ComicBox } from "./Comic";

// set endpoint here
let endpoint = `https://xo6yu9zb74.execute-api.us-east-2.amazonaws.com/staging`;
endpoint = `http://localhost:8080`;
// work locally, push other api

// For States and animation
type States = "suggest" | "query" | "results" | "data";
const [state, setState] = createSignal<States>("suggest");

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
          return res;
        } else return [""];
      });
  else return [""];
}

let inputBox: HTMLInputElement;
const [prompt, setPrompt] = createSignal(""); // upon pressing search
const [results] = createResource(prompt, fetchResults);
const [animate, setAnimate] = createSignal(false);
const [tempPrompt, setTempPrompt] = createSignal(""); // suggestions as you type
const [data, setData] = createSignal<Array<any>>([]);
const [suggestions] = createResource(tempPrompt, fetchSuggestions);

const [closed, setClosed] = createSignal(false);

function handleSearch(prompt: string) {
  if (!closed()) setClosed(true);
  setPrompt(prompt);
  setData([]);
  updateData(results);
}

function updateData(results: any) {
  const swap: Array<any> = [];
  if (results.loading) {
    setTimeout(() => {
      updateData(results);
    }, 100);
  } else if (results.state === "ready") {
    for (let i = 0; i < results().length; i++) {
      let x = results()[i];
      fetchComic(x.ComicNum)
        .then((res) => {
          res.rank = i;
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

createEffect(() => {
  if (closed()) setAnimate(true);
  setTimeout(() => {
    setAnimate(false);
  }, 500);
});

function handleMouseMove(event: MouseEvent) {
  let x = event.clientX;
  let y = event.clientY;

  setImgY(y - 150 + "px");
  changeBoxStates(x, y);
}

const [imgY, setImgY] = createSignal("0px");

const App: Component = () => {
  onMount(() => {
    window.addEventListener("mousemove", handleMouseMove);
  });

  const [selected, setSelected] = createSignal(false);
  const [comic, setComic] = createSignal<Comic>({
    num: 1969,
    safe_title: "Not Available",
  });

  function handleSelected(comic: Comic) {
    setSelected(false);
    setComic(comic);
    setTimeout(() => {
      setSelected(true);
    }, 100);
  }

  function handleClose() {
    setSelected(false);
  }

  return (
    <>
      <Canvas></Canvas>
      <div
        class="search-container"
        style={closed() ? `right: 60vw` : `right: 10vw;`}
      >
        <Show when={suggestions() ? suggestions()[0] != "" : false}>
          <div class="suggestions-container">
            <For each={suggestions()}>
              {(suggested) => {
                if (suggested != "")
                  return (
                    <p
                      onClick={() => handleSearch(suggested)}
                      class="suggestions"
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
      <div
        class="results-page"
        style={closed() ? `right: 0vw;` : `right: -50vw`}
      >
        <For each={data()}>
          {(comic) => (
            <ComicBox
              click={handleSelected}
              imgY={imgY}
              comic={comic}
            ></ComicBox>
          )}
        </For>
      </div>
      <Show when={selected()}>
        <FullPage close={handleClose} comic={comic()}></FullPage>
      </Show>
    </>
  );
};

export { animate, closed, setClosed, App };
