import { Accessor, Component, createSignal } from "solid-js";
import { Comic } from "./Types";

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
    </>
  );
};

export { ComicBox };
