import script from "./script"
import compile from "./lib/compile"

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="mainCanvas"></canvas>
  </div>
`
const gfx = compile(script);
console.log(gfx);


// function setup() {
//     gfx.setVertices("v", [
//     { position: [-1, -1] }, { position: [ 1, -1] }, { position: [-1,  1] }, { position: [ 1,  1] },
//     ],[
//         1,2,3,3,2,4
//     ]);
//     gfx.setGlobal("g", { screenSize: [1920,1080] });
//     gfx.setTexture("t_bg", myBackgroundImage);
//     gfx.setScreen("out1");
// };

// function draw() {
//     gfx.setInstances("i", [
//     { col:[1,0,0,1], instancePosition:[480, 540], radius:120 },
//     { col:[0,1,0,1], instancePosition:[960, 540], radius:120 },
//     { col:[0,0,1,1], instancePosition:[1440,540], radius:120 },
//     ]);
//     gfx.out("out1").update();
// };