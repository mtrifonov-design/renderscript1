import build from "./lib/build";
import compile from "./lib/compile"
const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;

const image = new Image();
await new Promise((resolve) => {
    image.src = "/bg.jpg";
    image.onload = resolve;
});

const something = await build("/cyberspaghetti/raytunnel/main.nectargl")
console.log(something);

const gfx = compile(something, gl);
function setup() {
    gfx.resources.get("quad").setVertices(
        { 
            position: 
            [
                -1, -1, 
                 1, -1, 
                -1,  1, 
                 1,  1
            ] 
        },
        [
            0, 1, 2, 2, 1, 3
        ],
        2
    );
    // gfx.resources.get("g").setGlobals({
    // });

    //gfx.resources.get("t_bg").setTextureData(image);
    gfx.setScreen("out");
};

let frame = 0;
function draw() {
    frame++;
    gfx.resources.get("global").setGlobals({
        test: [0.5]
    });
    gfx.resources.get("ray").setInstanceData(
        {
            seed: [Math.random()]
        }
        , 1);
    gfx.resources.get("out").updateTextureData();
    gfx.refreshScreen();
    requestAnimationFrame(draw);
};

setup();
draw();