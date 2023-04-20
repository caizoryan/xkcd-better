import { Accessor, Component, createSignal } from "solid-js";
const Comic: Component<{
  imgY: Accessor<string>;
  comic: { num: number; safe_title: string; img: string; alt: string };
}> = (props) => {
  const [hover, setHover] = createSignal(false);
  let rank = props.comic.rank + 1;
  return (
    <>
      <img
        class="comic-img"
        style={
          hover()
            ? `right: 45vw; top: ${props.imgY()}`
            : `right: -50vw;top: ${props.imgY()}`
        }
        src={props.comic.img}
      ></img>
      <div
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

export { Comic };
