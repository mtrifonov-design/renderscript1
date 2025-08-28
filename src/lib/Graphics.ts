import { ResourceClass, ResourceType  } from "./Resources";


export default class Graphics {
    private resources: Map<string, typeof ResourceClass>;
    private gl: WebGL2RenderingContext;
    constructor(resources: Map<string, typeof ResourceClass>, gl: WebGL2RenderingContext) {
        this.resources = resources;
        this.gl = gl;
    }

    setVertices() {};
    setGlobal() {};
    setInstances() {};
    setTexture() {};
    updateTexture() {};
    setScreen() {};
}