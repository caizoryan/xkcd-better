import {
  createResource,
  Component,
  createSignal,
  For,
  createEffect,
  onMount,
  Show,
  Setter,
  createMemo,
} from "solid-js";
import { createMutable } from "solid-js/store";

import "./style.css";
import { Comic } from "./Comic";

const endpoint = `http://localhost:8080`;

type States = "suggest" | "query" | "results" | "data";
const [state, setState] = createSignal<States>("suggest");

const boxStates = createMutable([
  {
    x: 15,
    y: 5,
    w: 70,
    h: 20,
    o: 0.2,
    c: "",
    data: [<span></span>],
  },
  { x: 20, y: 24, w: 60, h: 20, o: 0.2, c: "", data: [<span></span>] },
  { x: 8, y: 40, w: 50, h: 25, o: 0.2, c: "", data: [<span></span>] },
  { x: 4, y: 55, w: 60, h: 40, o: 0.2, c: "", data: [<span></span>] },
]);
createEffect(() => {
  if (state() === "suggest") {
    handleColors(boxStates[3]);
  } else if (state() === "query") {
    handleColors(boxStates[2]);
  } else if (state() === "results") {
    handleColors(boxStates[1]);
  } else if (state() === "data") {
    handleColors(boxStates[0]);
  }
});
// results from search
async function fetchResults(prompt: string) {
  setState("query");
  if (boxStates[3].data?.length > 100) boxStates[2].data.splice(0, 50);
  if (boxStates[1].data?.length > 100) boxStates[2].data.splice(0, 50);
  boxStates[2].data?.push(
    <>
      <span
        style={`font-variation-settings: "wght" ${Math.random() * 100}`}
      >{`${endpoint}/search?q=`}</span>
      <span style={`font-variation-settings: "wght" ${Math.random() * 800}`}>
        {prompt}
      </span>
      <span
        style={`font-variation-settings: "wght" ${Math.random() * 100}`}
      >{`&autocorrect=true`}</span>
    </>
  );
  return await fetch(`${endpoint}/search?q=${prompt}&autocorrect=true`)
    .then((res) => res.json())
    .then((res) => {
      if (res.rankings) {
        for (const x of res.rankings)
          boxStates[1].data?.push(
            <span
              style={`font-variation-settings: "wght" ${Math.random() * 700}`}
            >
              {JSON.stringify(x) + " "}
            </span>
          );
        return res.rankings;
      } else if (typeof res != "string") {
        for (const x of res)
          boxStates[1].data?.push(
            <span
              style={`font-variation-settings: "wght" ${Math.random() * 700}`}
            >
              {JSON.stringify(x) + " "}
            </span>
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
      setState("data");
      boxStates[0].data?.push(
        <span style={`font-variation-settings: "wght" ${Math.random() * 700}`}>
          {JSON.stringify(res)}
        </span>
      );
      return res;
    });
}
async function suggestWords(prompt: string) {
  setState("suggest");
  if (boxStates[3].data?.length > 100) boxStates[3].data.splice(0, 50);
  if (prompt != "")
    boxStates[3].data?.push(
      <span
        style={`font-variation-settings: "wght" ${Math.random() * 100}`}
      >{`${endpoint}/suggest?q=${prompt}`}</span>
    );
  if (prompt.length > 0)
    return await fetch(`${endpoint}/suggest?q=${prompt}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.length > 0) {
          for (const x of res)
            boxStates[3].data?.push(
              <span
                style={`font-variation-settings: "wght" ${Math.random() * 700}`}
              >
                {x}
              </span>
            );
          return res;
        } else return [""];
      });
  else return [""];
}

let inputBox: HTMLInputElement;
const [prompt, setPrompt] = createSignal(""); // upon pressing search
const [results] = createResource(prompt, fetchResults);
const [tempPrompt, setTempPrompt] = createSignal(""); // suggestions as you type
const [data, setData] = createSignal<Array<any>>([]);
const [suggestions] = createResource(tempPrompt, suggestWords);

const [closed, setClosed] = createSignal(false);
const [animate, setAnimate] = createSignal(false);

function handleSearch(prompt: string) {
  if (!closed()) setClosed(true);
  setPrompt(prompt);
  setData([]);
  updateData(results);
}

createEffect(() => {
  if (closed()) setAnimate(true);
  setTimeout(() => {
    setAnimate(false);
  }, 500);
});

function updateData(results: any) {
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
          swap.push(res);
          // getExplain(x.ComicNum, res.title);
        })
        .then(() => {
          if (swap.length === results().length) {
            setData(swap.sort((a, b) => a.rank - b.rank));
            setState("data");
          }
        });
    }
  } else {
    console.log(results());
  }
}

function getExplain(id: number, title: string) {
  title = title.replace(" ", "_");
  let url = `https://www.explainxkcd.com/wiki/api.php?action=parse&page=${id}:_${title}&origin=*&format=json`;
  fetch(url).then((res) => res.json());
}

const [imgY, setImgY] = createSignal("0px");

function handleMouseMove(event) {
  let x = event.clientX;
  let y = event.clientY;

  setImgY(y - 150 + "px");

  boxStates[0].w = mapRange(y, 0, window.innerHeight, 40, 70);
  boxStates[0].h = mapRange(y, 0, window.innerHeight, 15, 23);
  boxStates[0].x = mapRange(x, 0, window.innerWidth, 13, 23);
  boxStates[0].o = mapRange(x, 0, window.innerWidth, 0.1, 0.2);

  boxStates[1].y = mapRange(y, 0, window.innerHeight, 15, 25);
  boxStates[1].h = mapRange(y, 0, window.innerHeight, 28, 8);
  boxStates[1].x = mapRange(x, 0, window.innerWidth, 12, 8);
  boxStates[1].w = mapRange(x, 0, window.innerWidth, 63, 53);
  boxStates[1].o = mapRange(y, 0, window.innerWidth, 0.1, 0.5);

  boxStates[2].h = mapRange(y, 0, window.innerHeight, 19, 68);
  boxStates[2].y = mapRange(y, 0, window.innerHeight, 42, 19);
  boxStates[2].x = mapRange(x, 0, window.innerWidth, 8, 12);
  boxStates[2].o = mapRange(x, 0, window.innerWidth, 0.8, 0.2);

  boxStates[3].h = mapRange(y, 0, window.innerHeight, 50, 25);
  boxStates[3].y = mapRange(y, 0, window.innerHeight, 45, 70);
  boxStates[3].x = mapRange(y, 0, window.innerHeight, 12, 4);
  boxStates[3].w = mapRange(x, 0, window.innerWidth, 70, 40);
  boxStates[3].o = mapRange(x, 0, window.innerWidth, 0.03, 0.02);
}

const Box: Component<{
  state: {
    data: string;
    w: number;
    o: number;
    x: number;
    y: number;
    h: number;
    c: number;
  };
}> = (props) => {
  let val = 0.65;
  return (
    <div
      class={animate() ? `one animate` : `one`}
      style={`width: ${
        !closed() ? props.state.w : props.state.w * val
      }vw; height: ${props.state.h}vh; top: ${props.state.y}vh; left: ${
        props.state.x
      }vw; color: ${
        props.state.c
      }; box-shadow: 5px 5px 24px -2px rgba(0, 0, 0, ${props.state.o})`}
    >
      {...props.state.data}
    </div>
  );
};

const App: Component = () => {
  onMount(() => {
    window.addEventListener("mousemove", handleMouseMove);
    fetch(
      `https://xo6yu9zb74.execute-api.us-east-2.amazonaws.com/staging/stats`
    ).then((res) => console.log(res.json()));
  });

  return (
    <>
      <div class="canvas">
        <For each={boxStates}>{(box) => <Box state={box}></Box>}</For>
      </div>
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
          {(comic) => <Comic imgY={imgY} comic={comic}></Comic>}
        </For>
      </div>
    </>
  );
};

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  // Calculate the input and output ranges
  const inRange = inMax - inMin;
  const outRange = outMax - outMin;

  // Normalize the input value
  const normalizedValue = (value - inMin) / inRange;

  // Map the normalized value to the output range
  const mappedValue = normalizedValue * outRange + outMin;

  return mappedValue;
}

function handleColors(element: any) {
  let light = `rgba(200, 200, 200, 1)`;
  setAllDark();
  element.c = light;
}

function setAllDark() {
  let dark = `rgba(50, 50, 50, 1)`;
  for (const x of boxStates) x.c = dark;
}

export default App;
