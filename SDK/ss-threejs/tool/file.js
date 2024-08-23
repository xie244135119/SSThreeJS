const o = class {
};
o.exportJson = (e, c) => {
  try {
    const t = JSON.stringify(e), n = new Blob([t], { type: "text/json" });
    o.download(n, c);
  } catch {
  }
};
o.download = (e, c) => {
  let t = e;
  typeof e == "object" && e instanceof Blob && (t = URL.createObjectURL(e));
  const n = document.createElement("a");
  n.href = t, n.download = c;
  let a;
  window.PointerEvent && (a = new PointerEvent("click")), n.dispatchEvent(a);
};
let i = o;
export {
  i as default
};
