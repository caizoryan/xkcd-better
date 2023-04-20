import {
  createResource,
  Component,
  createSignal,
  For,
  createEffect,
  onMount,
} from "solid-js";
import { createMutable } from "solid-js/store";

import "./style.css";
import { Comic } from "./Comic";

// results from search
async function fetchResults(prompt: string) {
  return (
    await fetch(`http://localhost:8080/search?q=${prompt}&autocorrect=true`)
  ).json();
}

// comic data
async function fetchComic(id: number) {
  return (await fetch(`https://getxkcd.vercel.app/api/comic?num=${id}`)).json();
}

let inputBox: HTMLInputElement;
const [prompt, setPrompt] = createSignal(""); // upon pressing search
const [tempPrompt, setTempPrompt] = createSignal(""); // suggestions as you type
const [results] = createResource(prompt, fetchResults);
const [data, setData] = createSignal<Array<any>>([]);
const [suggestions] = createResource(tempPrompt, suggestWords);

const [closed, setClosed] = createSignal(false);
const [animate, setAnimate] = createSignal(false);

const one = createMutable({ x: 15, y: 5, w: 70, h: 20 });
const two = createMutable({ x: 20, y: 24, w: 60, h: 20 });
const three = createMutable({ x: 8, y: 40, w: 50, h: 25 });
const four = createMutable({ x: 4, y: 55, w: 60, h: 40 });

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
          setData((prev) => [...prev, res]);
          getExplain(x.ComicNum, res.title);
        })
        .then(() => {
          setData(data().sort((a, b) => a.rank - b.rank));
          console.log(data());
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

async function suggestWords(prompt: string) {
  if (prompt.length > 0)
    return (await fetch(`http://localhost:8080/suggest?q=${prompt}`)).json();
  else return [""];
}

function handleMouseMove(event) {
  let x = event.clientX;
  let y = event.clientY;

  one.w = mapRange(y, 0, window.innerHeight, 40, 70);
  one.h = mapRange(y, 0, window.innerHeight, 15, 23);
  one.x = mapRange(x, 0, window.innerWidth, 13, 23);

  two.y = mapRange(y, 0, window.innerHeight, 15, 25);
  two.h = mapRange(y, 0, window.innerHeight, 28, 8);
  two.x = mapRange(x, 0, window.innerWidth, 12, 8);
  two.w = mapRange(x, 0, window.innerWidth, 63, 53);

  three.h = mapRange(y, 0, window.innerHeight, 19, 68);
  three.y = mapRange(y, 0, window.innerHeight, 42, 19);
  three.x = mapRange(x, 0, window.innerWidth, 8, 12);

  four.h = mapRange(y, 0, window.innerHeight, 50, 25);
  four.y = mapRange(y, 0, window.innerHeight, 45, 70);
  four.x = mapRange(y, 0, window.innerHeight, 12, 4);
  four.w = mapRange(x, 0, window.innerWidth, 70, 40);
}

const App: Component = () => {
  onMount(() => {
    window.addEventListener("mousemove", handleMouseMove);
  });

  let val = 0.7;
  return (
    <>
      <div class="canvas">
        <div
          class={animate() ? `one animate` : `one`}
          style={`width: ${!closed() ? one.w : one.w * val}vw; height: ${
            one.h
          }vh; top: ${one.y}vh; left: ${one.x}vw`}
        ></div>
        <div
          class={animate() ? `two animate` : `two`}
          style={`width: ${!closed() ? two.w : two.w * val}vw; height: ${
            two.h
          }vh; top: ${two.y}vh; left: ${two.x}vw`}
        ></div>
        <div
          class={animate() ? `three animate` : `three`}
          style={`width: ${!closed() ? three.w : three.w * val}vw; height: ${
            three.h
          }vh; top: ${three.y}vh; left: ${three.x}vw`}
        ></div>
        <div
          class={animate() ? `four animate` : `four`}
          style={`width: ${!closed() ? four.w : four.w * val}vw; height: ${
            four.h
          }vh; top: ${four.y}vh; left: ${four.x}vw`}
        ></div>
      </div>
      <div
        class="search-container"
        style={closed() ? `right: 60vw` : `right: 10vw;`}
      >
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
      <div
        class="results-page"
        style={closed() ? `right: 0vw;` : `right: -50vw`}
      >
        <For each={data()}>{(comic) => <Comic comic={comic}></Comic>}</For>
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

export default App;
