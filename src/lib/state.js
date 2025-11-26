export function createState(initial) {
  let state = { ...initial };
  const listeners = new Set();

  const get = () => state;

  const set = (partial) => {
    state = { ...state, ...partial };
    listeners.forEach((fn) => fn(state));
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  return { get, set, subscribe };
}
