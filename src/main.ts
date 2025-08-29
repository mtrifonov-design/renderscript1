import script from "./script"
import compile from "./lib/compile"

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");

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
    requestAnimationFrame(draw);
};

const gfx = compile(script, gl);
function setup() {
    gfx.resources.get("v").setVertices(
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
    gfx.resources.get("g").setGlobals({
        screenSize: [1920, 1080]
    });

    gfx.resources.get("t_bg").setTextureData(image);
    gfx.setScreen("out1");
};

let frame = 0;
function draw() {
    frame++;
    const pos1 = [Math.sin(frame * 0.02) * 300 + 960, Math.cos(frame * 0.02) * 300 + 540];
    const pos2 = [Math.sin(frame * 0.03 + 2) * 300 + 960, Math.cos(frame * 0.03 + 2) * 300 + 540];
    const pos3 = [Math.sin(frame * 0.04 + 4) * 300 + 960, Math.cos(frame * 0.04 + 4) * 300 + 540];

    gfx.resources.get("i").setInstanceData(
        {
            col: [
                1, 1, 0, 1, 
                0, 1, 0, 1, 
                0, 1, 1, 1
            ],
            instancePosition: [
                ...pos1, 
                ...pos2, 
                ...pos3
            ],
            radius: [
                50, 
                150, 
                50
            ]
        }
        , 3);
    gfx.resources.get("out1").updateTextureData();
    gfx.refreshScreen();
    requestAnimationFrame(draw);
};
