import { Component, createResource, For, Show, Accessor } from "solid-js";
import { endpoint } from "./App";

const Stats: Component<{ close: Accessor<boolean> }> = (props) => {
  const [stats] = createResource(fetchStats);
  async function fetchStats(): Promise<string[][]> {
    return await fetch(`${endpoint}/stats`)
      .then((res) => res.json())
      .then((res) => {
        return Object.entries(res);
      });
  }

  return (
    <div class={props.close() ? "stats-container-mini" : "stats-container"}>
      <Show when={stats.state === "ready"}>
        <p>
          <For each={stats()}>
            {(term) => (
              <>
                ["{term[0]}", "{term[1]}"],{" "}
              </>
            )}
          </For>
        </p>
      </Show>
    </div>
  );
};

export { Stats };
