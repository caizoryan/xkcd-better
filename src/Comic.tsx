import { Accessor, Component, createSignal, For } from "solid-js";
import { mapRange } from "./utlis";
import { Comic } from "./Types";

function mapFontWeight(current: number, total: number) {
  return mapRange(current, 0, total, 100, 1000);
}
const Stats: Component<{ stats: Array<object>; hover: Accessor<boolean> }> = (
  props
) => {
  let text = [<span></span>];
  let singular = {
    TitleCount: 0,
    ExplanationCount: 0,
    AltCount: 0,
    TranscriptCount: 0,
    Total: 0,
  };

  for (const x of props.stats) {
    singular.TitleCount += x.TitleCount;
    singular.ExplanationCount += x.ExplanationCount;
    singular.AltCount += x.AltCount;
    singular.TranscriptCount += x.TranscriptCount;
    singular.Total +=
      x.TitleCount + x.ExplanationCount + x.AltCount + x.TranscriptCount;
  }
  for (const [x, y] of Object.entries(singular)) {
    if ((x != null || x != undefined) && x != "Total")
      text.push(
        <span
          class="comic-stat-single"
          style={`font-variation-settings: 'wght' ${mapFontWeight(
            y,
            singular.Total
          )}`}
        >
          {x + ":" + y + " "}
        </span>
      );
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

const ComicBoxInteractive: Component<{
  imgY: Accessor<string>;
  click: Function;
  comic: Comic;
}> = (props) => {
  const [hover, setHover] = createSignal(false);
  let rank = props.comic.rank ? props.comic.rank + 1 : 1;
  return (
    <>
      <div
        class="comic-img comic-interactive-img"
        id="comic-interactive-img"
        style={
          hover()
            ? `right: 28vw; top: ${props.imgY()}`
            : `right: -50vw;top: ${props.imgY()}`
        }
      >
        Interactive Comic!<br></br>Click to view!
      </div>
      <a href={`https://xkcd.com/${props.comic.num}`} target="_blank">
        <div
          class="comic-box"
          id="comic-interactive"
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
      </a>
      <Stats stats={props.comic.stats} hover={hover}></Stats>
    </>
  );
};

export { ComicBox, ComicBoxInteractive };
