import {
  Component,
  Match,
  Switch,
  createSignal,
  createResource,
} from "solid-js";
import type { Comic } from "./Types";

const FullPage: Component<{
  close: Function;
  comic: Comic;
}> = (props) => {
  const [explain, setExplain] = createSignal(false);
  const [selected, setSelected] = createSignal({
    id: props.comic.num,
    title: props.comic.safe_title,
  }); // upon pressing search
  const [exp] = createResource(selected, getExplain);
  return (
    <div class="full-page">
      <div
        class="page-close"
        onClick={() => {
          props.close();
        }}
      >
        close
      </div>
      <div class="page-title">{props.comic.safe_title}</div>
      <div class="page-rest">
        <div class="page-alt-explain">
          <div class="page-alt">{props.comic.alt}</div>
          <button class="page-show-explain" onClick={() => setExplain(true)}>
            Show Explaination
          </button>
        </div>

        <div class="page-display">
          <Switch>
            <Match when={explain()}>
              {() => {
                if (exp.state == "ready") {
                  console.log(exp());
                  return exp();
                } else {
                  return "ok";
                }
              }}
            </Match>
            <Match when={!explain()}>
              <img src={props.comic.img}></img>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};

// use this to fix explanations https://www.npmjs.com/package/wikiapi
async function getExplain(query: { id: number; title: string }) {
  let title = query.title.replace(" ", "_");
  let url = `https://www.explainxkcd.com/wiki/api.php?action=parse&page=${query.id}:_${title}&prop=wikitext&origin=*&format=json`;
  return await fetch(url)
    .then((res) => res.json())
    .then((res) => {
      return res.parse.wikitext["*"];
    });
}

export { FullPage };
