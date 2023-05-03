import { For, JSXElement, Component } from "solid-js";
import { closed, setClosed, animate } from "./App";
import { createMutable } from "solid-js/store";
import { mapRange } from "./utlis";

let light = `rgba(230, 230, 230, 1)`;
let dark = `rgba(80, 80, 80, 1)`;

type BoxState = {
  x: number;
  y: number;
  w: number;
  h: number;
  o: number;
  c: string;
  data: JSXElement[];
};

const boxStates = createMutable<BoxState[]>([
  { x: 15, y: 5, w: 70, h: 20, o: 0.2, c: "", data: [<span></span>] },
  { x: 20, y: 24, w: 60, h: 20, o: 0.2, c: "", data: [<span></span>] },
  { x: 8, y: 40, w: 50, h: 25, o: 0.2, c: "", data: [<span></span>] },
  { x: 4, y: 55, w: 60, h: 40, o: 0.2, c: "", data: [<span></span>] },
]);

function changeBoxStates(x: number, y: number) {
  boxStates[0].w = mapRange(y, 0, window.innerHeight, 40, 70);
  boxStates[0].h = mapRange(y, 0, window.innerHeight, 15, 23);
  boxStates[0].x = mapRange(x, 0, window.innerWidth, 13, 23);
  boxStates[0].o = mapRange(x, 0, window.innerWidth, 0.1, 0.2);

  boxStates[1].y = mapRange(y, 0, window.innerHeight, 15, 25);
  boxStates[1].h = mapRange(y, 0, window.innerHeight, 28, 8);
  boxStates[1].x = mapRange(x, 0, window.innerWidth, 12, 8);
  boxStates[1].w = mapRange(x, 0, window.innerWidth, 63, 53);
  boxStates[1].o = mapRange(y, 0, window.innerWidth, 0.1, 0.5);

  boxStates[2].h = mapRange(y, 0, window.innerHeight, 19, 68);
  boxStates[2].y = mapRange(y, 0, window.innerHeight, 42, 19);
  boxStates[2].x = mapRange(x, 0, window.innerWidth, 8, 12);
  boxStates[2].o = mapRange(x, 0, window.innerWidth, 0.8, 0.2);

  boxStates[3].h = mapRange(y, 0, window.innerHeight, 50, 25);
  boxStates[3].y = mapRange(y, 0, window.innerHeight, 45, 70);
  boxStates[3].x = mapRange(y, 0, window.innerHeight, 12, 4);
  boxStates[3].w = mapRange(x, 0, window.innerWidth, 70, 40);
  boxStates[3].o = mapRange(x, 0, window.innerWidth, 0.03, 0.02);
}

const Box: Component<{
  state: BoxState;
}> = (props) => {
  let val = 0.65;
  return (
    <div
      onClick={() => setClosed(false)}
      class={animate() ? `one animate` : `one`}
      style={`width: ${!closed() ? props.state.w : props.state.w * val}vw; height: ${
        props.state.h
      }vh; top: ${props.state.y}vh; left: ${props.state.x}vw; color: ${
        props.state.c
      }; box-shadow: 5px 5px 24px -2px rgba(0, 0, 0, ${props.state.o})`}
    >
      {...props.state.data}
    </div>
  );
};

const Canvas: Component = () => {
  return (
    <div class="canvas">
      {" "}
      <For each={boxStates}>{(box) => <Box state={box}></Box>}</For>{" "}
    </div>
  );
};

function handleColors(element: number) {
  setAllDark();
  boxStates[element].c = light;
}

function setAllDark() {
  for (const x of boxStates) x.c = dark;
}

function setBoxData(index: number, value: JSXElement) {
  boxStates[index].data?.unshift(value);
}

// when array has too many values, splice by amt
function cleanBoxData(index: number, cutoff: number, cleanAmt: number) {
  if (boxStates[index].data?.length > cutoff)
    boxStates[index].data.splice(boxStates[index].data.length - cleanAmt, cleanAmt);
}

export { Canvas, changeBoxStates, handleColors, setBoxData, cleanBoxData };
