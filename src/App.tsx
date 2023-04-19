import {
  createResource,
  Component,
  createSignal,
  For,
  createEffect,
} from "solid-js";

import "./style.css";

const Comic: Component<{
  img: string;
  num: number;
  title: string;
  alt: string;
}> = (props) => {
  return (
    <a href={"https://xkcd.com/" + props.num}>
      <div class="comic-box">
        <p class="comic-title">{props.title}</p>
        <img src={props.img}></img>
        <p style="margin: 0 2.5vw 1vw 2.5vw;">{props.alt}</p>
      </div>
    </a>
  );
};

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

function handleSearch(prompt: string) {
  setPrompt(prompt);
  setData([]);
  updateData(results);
}

function updateData(results: any) {
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
    return (
      await fetch(`http://localhost:8080/suggest?q=${prompt}&autocorrect=true`)
    ).json();
  else return [""];
}

const App: Component = () => {
  return (
    <>
      <div style="display: flex; margin-top: auto">
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
      <div style="margin: 0 2.5vw">
        <For each={suggestions()}>
          {(word) => {
            if (word != "")
              return (
                <p class="suggestions" onClick={() => handleSearch(word)}>
                  {word}
                </p>
              );
          }}
        </For>
      </div>
      <div class="container">
        <For each={data()}>
          {(comic) => {
            return (
              <Comic
                num={comic.num}
                title={comic.rank + 1 + ". " + comic.title}
                img={comic.img}
                alt={comic.alt}
              ></Comic>
            );
          }}
        </For>
      </div>
    </>
  );
};

export default App;
