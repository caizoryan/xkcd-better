import { Accessor, Component, createSignal, For } from "solid-js";
import { Comic } from "./Types";

const Stats: Component<{ stats: Array<object>; hover: Accessor<boolean> }> = (
  props
) => {
  let text = [<span></span>];
  let singular = {
    TitleCount: 0,
    ExplanationCount: 0,
    AltCount: 0,
    TranscriptCount: 0,
  };

  for (const x of props.stats) {
    singular.TitleCount += x.TitleCount;
    singular.ExplanationCount += x.ExplanationCount;
    singular.AltCount += x.AltCount;
    singular.TranscriptCount += x.TranscriptCount;
  }
  for (const [x, y] of Object.entries(singular)) {
    if (x != null || x != undefined)
      text.push(<span class="comic-stat-single">{x + ":" + y + " "}</span>);
  }

  return (
    <div
      class="comic-stats"
      style={props.hover() ? "margin-top: -2vh;" : "margin-top: -12.5vh;"}
    >
      {props.stats ? <div class="comic-stat-container">{...text}</div> : ""}
    </div>
  );
};
const ComicBox: Component<{
  imgY: Accessor<string>;
  click: Function;
  comic: Comic;
}> = (props) => {
  const [hover, setHover] = createSignal(false);
  let rank = props.comic.rank ? props.comic.rank + 1 : 1;
  return (
    <>
      <img
        class="comic-img"
        style={
          hover()
            ? `right: 50vw; top: ${props.imgY()}`
            : `right: -50vw;top: ${props.imgY()}`
        }
        src={props.comic.img}
      ></img>
      <div
        onClick={() => {
          props.click(props.comic);
        }}
        class="comic-box"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div class="comic-title-box">
          <p class="comic-title">{rank + ". " + props.comic.safe_title}</p>
        </div>
        <div class="comic-title-alt">
          <p>{props.comic.alt}</p>
        </div>
      </div>
      <Stats stats={props.comic.stats} hover={hover}></Stats>
    </>
  );
};

export { ComicBox };
