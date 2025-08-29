import script from "./script"
import compile from "./lib/compile"

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");
const gfx = compile(script,gl);
console.log(gfx);

    const image = new Image();
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");
    // fill with blue backbground
    offscreenCtx.fillStyle = "blue";
    offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    const dataUrl = offscreenCanvas.toDataURL();
    image.src = dataUrl;
    image.onload = () => {
        setup();
        draw();
    };
function setup() {
    gfx.resources.get("v").setVertices(
        { position: [-1, -1, 1, -1, -1, 1, 1, 1] },
        [
            0,1,2,2,1,3
        ],
        2
    );
    gfx.resources.get("g").setGlobals({
        screenSize: [1920, 1080]
    });

    gfx.resources.get("t_bg").setTextureData(image);
};

function draw() {
    gfx.resources.get("i").setInstanceData([
        { col:[1,0,0,1], instancePosition:[480, 540], radius:120 },
        { col:[0,1,0,1], instancePosition:[960, 540], radius:120 },
        { col:[0,0,1,1], instancePosition:[1440,540], radius:120 },
    ]);
    gfx.resources.get("out1").updateTextureData();
    gfx.setScreen("out1");
};
