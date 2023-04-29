import {
  Component,
  Match,
  Switch,
  Accessor,
  Setter,
  createSignal,
  Resource,
} from "solid-js";

import type { Comic } from "./Types";
import wtf from "wtf_wikipedia";

const FullPage: Component<{
  selected: Accessor<boolean>;
  setSelected: Setter<boolean>;
  comic: Accessor<Comic>;
  explaination: Resource<string>;
}> = (props) => {
  const [explain, setExplain] = createSignal(false);
  return (
    <div
      class="full-page"
      style={props.selected() ? "right: 0" : "right: -90vw"}
    >
      <div
        class="page-close"
        onClick={() => {
          props.setSelected(false);
        }}
      >
        close
      </div>
      <div class="page-title">
        <p>{props.comic().safe_title}</p>
        <a href={`https://xkcd.com/${props.comic().num}`} target="_blank">
          <p class="page-link">{`Go to https://xkcd.com/${
            props.comic().num
          } -->`}</p>
        </a>
      </div>
      <div class="page-rest">
        <div class="page-alt-explain">
          <div class="page-alt">{props.comic().alt}</div>
          <a
            href={`https://explainxkcd.com/${props.comic().num}`}
            target="_blank"
          >
            <p class="page-show-explain page-link">{`See Explaination`}</p>
          </a>
        </div>

        <div class="page-display">
          <Switch>
            <Match when={explain()}>
              {() => {
                if (props.explaination.state == "ready") {
                  let txt = wtf(props.explaination()).text();
                  return <div>{txt}</div>;
                } else {
                  return "Loading...";
                }
              }}
            </Match>
            <Match when={!explain()}>
              <img src={props.comic().img}></img>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export { FullPage };
