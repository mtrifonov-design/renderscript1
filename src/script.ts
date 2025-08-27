const script = `
vsig : VertexSignature {
  "attributes": { "position": "vec2" },
  "maxCount": 1024
}
---
isig : InstanceSignature {
  "attributes": {
    "col": "vec4",
    "instancePosition": "vec2",
    "radius": "float"
  },
  "maxCount": 64
}
---
gsig : GlobalSignature {
    "screenSize": "vec2"
}
---
tsig : TextureSignature {
  "type": "RGBA8",
  "size": [1920, 1080]
}
---
tsam : TextureSampler {
  "filter": "linear",
  "wrap": "clamp"
}
---
v    : Vertex { "signature": "vsig" };
---
i    : Instance { "signature": "isig" };
---
g    : Global { "signature": "gsig" };
---
t_bg : Texture { "signature": "tsig" };
// later: t: TextureSlot;
---
p_bg : Program {
  "vertexSignature": "vsig",
  "vertexShader": "\
     out vec2 v_uv;\
     void main(){\
       v_uv = 0.5 * (position + 1.0);\
       gl_Position = vec4(position, 0.0, 1.0);\
    }",
  "fragmentShader": "void main(){ fragColor = texture(backgroundTexture, v_uv); }",
  "textures": { "backgroundTexture": "tsam" }
};
---
p_circles : Program {
  vertexSignature: "vsig",
  instanceSignature: "isig",
  vertexShader: "out vec2 v_local;\
    out vec4 v_col;\
    void main(){\
      // convert pixel radius to NDC scale\
      vec2 r_ndc = (2.0 * vec2(radius) / screenSize);\
      vec2 pos_ndc = (2.0 * instancePosition / screenSize) - 1.0;\
      vec2 p = pos_ndc + position * r_ndc;\
      v_local = position; // unit quad coords for circle test\
      v_col = col;\
      gl_Position = vec4(p, 0.0, 1.0);\
    }",
  fragmentShader: "\
    in vec2 v_local;\
    in vec4 v_col;\
    void main(){\
      float d = length(v_local);          // unit quad assumed in [-1,1]\
      float a = smoothstep(1.0, 0.98, d); // soft edge\
      if (d>1.02) discard;\
      fragColor = vec4(v_col.rgb, v_col.a * a);\
    }",
  "textures": {}
};
---
out1 : Texture {
  signature: "tsig",
  drawOps: [
  {
    program: "p_bg",
    vertex: "v",
    global: "g",
    textures: { backgroundTexture: "t_bg" }
  },
  {
    program: "p_circles",
    vertex: "v",
    instances: "i",
    global: "g",
    textures: {}
  }],
  out: true
};
`;
export default script;



