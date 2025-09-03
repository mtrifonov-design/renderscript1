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


function createSlider({ min, max, value, step, onChange, label }) {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = step;
    slider.addEventListener("input", () => {
        onChange(parseFloat(slider.value));
    });
    const box = document.createElement("div");
    const tag = document.createElement("label");
    tag.innerText = label;
    box.appendChild(tag);
    box.appendChild(slider);
    document.body.appendChild(box);
    return {value: slider.value};
}

const gfx = compile(something, gl);
const inputs = {};
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

    // Add inputs.

    // Slider for angle
    inputs.time = createSlider({
        min: 0,
        max: 500,
        value: 0,
        step: 1,
        onChange: (value) => {
            inputs.time.value = value;
        },
        label: "Time"
    });


};

const instances = [];
for (let i = 0; i < 10000; i++) {
    instances.push(Math.random());
}

let frame = 0;
function draw() {
    frame++;
    gfx.resources.get("global").setGlobals({
        tunnelData: [-0.1, Math.sqrt(0.5), -10.0, 0.1],
        time: [inputs.time.value]
    });
    gfx.resources.get("ray").setInstanceData(
        {
            seed: instances
        }
        , instances.length);
    gfx.resources.get("out").updateTextureData();
    gfx.refreshScreen();
    requestAnimationFrame(draw);
};

setup();
draw();