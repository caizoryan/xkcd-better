import { Component, Match, Switch, Accessor, Setter, Resource } from "solid-js";

import type { Comic } from "./Types";

const FullPage: Component<{
  selected: Accessor<boolean>;
  setSelected: Setter<boolean>;
  comic: Accessor<Comic>;
  explaination: Resource<string>;
}> = (props) => {
  return (
    <div class="full-page" style={props.selected() ? "right: 0" : "right: -90vw"}>
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
          <p class="page-link">{`Go to https://xkcd.com/${props.comic().num} -->`}</p>
        </a>
      </div>
      <div class="page-rest">
        <div class="page-alt-explain">
          <div class="page-alt">{props.comic().alt}</div>
          <a href={`https://explainxkcd.com/${props.comic().num}`} target="_blank">
            <p class="page-show-explain page-link">{`See Explanation`}</p>
          </a>
        </div>

        <div class="page-display">
          <img src={props.comic().img}></img>
        </div>
      </div>
    </div>
  );
};

export { FullPage };
