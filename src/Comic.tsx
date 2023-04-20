import { Component, createSignal } from "solid-js";
const Comic: Component<{
  comic: { num: number; safe_title: string; img: string; alt: string };
}> = (props) => {
  const [hover, setHover] = createSignal(false);
  return (
    <>
      <img
        class="comic-img"
        style={hover() ? `right: 45vw` : `right: -50vw`}
        src={props.comic.img}
      ></img>
      <a href={"https://xkcd.com/" + props.comic.num}>
        <div
          class="comic-box"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <p class="comic-title">{props.comic.safe_title}</p>
          <p style="margin: 0 2.5vw 1vw 2.5vw;">{props.comic.alt}</p>
        </div>
      </a>
    </>
  );
};

export { Comic };
