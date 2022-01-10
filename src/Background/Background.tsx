import React from "react";
import { ResizeObserver, ResizeObserverEntry } from "@juggle/resize-observer";

import { createProgram } from "./utils";

import vert from "./shader.inline.vert";
import frag from "./shader.inline.frag";

import "./Background.css";

interface GLData {
  program: WebGLProgram;
  colorLocation: WebGLUniformLocation;
  vao: WebGLVertexArrayObject;
}

class Background extends React.Component {
  private canvas: React.RefObject<HTMLCanvasElement>;
  private gl: WebGL2RenderingContext | null = null;
  private size = {
    width: 0,
    height: 0,
  };
  private re: ResizeObserver;
  private data: GLData | null = null;

  constructor(props: {}) {
    super(props);
    this.canvas = React.createRef();
    this.onResize = this.onResize.bind(this);
    this.re = new ResizeObserver(this.onResize);
    this.draw = this.draw.bind(this);
  }

  onResize(entries: ResizeObserverEntry[]) {
    const entry = entries[0];
    let width;
    let height;
    let dpr = window.devicePixelRatio;
    if (entry.devicePixelContentBoxSize) {
      // NOTE: Only this path gives the correct answer
      // The other 2 paths are an imperfect fallback
      // for browsers that don't provide anyway to do this
      width = entry.devicePixelContentBoxSize[0].inlineSize;
      height = entry.devicePixelContentBoxSize[0].blockSize;
      dpr = 1; // it's already in width and height
    } else if (entry.contentBoxSize) {
      width = entry.contentBoxSize[0].inlineSize;
      height = entry.contentBoxSize[0].blockSize;
    } else {
      // legacy
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    }
    const displayWidth = Math.round(width * dpr);
    const displayHeight = Math.round(height * dpr);
    this.size = {
      width: displayWidth,
      height: displayHeight,
    };
  }

  resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    // Check if the canvas is not the same size.
    const needResize =
      canvas.width !== this.size.width || canvas.height !== this.size.height;

    if (needResize) {
      // Make the canvas the same size
      canvas.width = this.size.width;
      canvas.height = this.size.height;
    }

    return needResize;
  }

  componentDidMount() {
    if (!this.canvas.current) return;
    this.re.observe(this.canvas.current);
    this.gl = this.canvas.current.getContext("webgl2");

    if (this.gl) {
      const gl = this.gl;
      // setup GLSL program
      const program = createProgram(gl, vert, frag);
      if (!program) return;

      // look up where the vertex data needs to go.
      const positionAttributeLocation = gl.getAttribLocation(
        program,
        "vert_pos"
      );

      const coordAttributeLocation = gl.getAttribLocation(
        program,
        "vert_coord"
      );

      // lookup uniforms
      const colorLocation = gl.getUniformLocation(program, "u_color");

      // prettier-ignore
      const vertices = [
        // positions   // texture coords
        1.0,  1.0,     1.0, 1.0, // top right
        1.0, -1.0,     1.0, 0.0, // bottom right
       -1.0, -1.0,     0.0, 0.0, // bottom left
       -1.0,  1.0,     0.0, 1.0  // top left
      ];

      // prettier-ignore
      const indices = [
        0, 1, 3,
        1, 2, 3
      ];

      // Create a vertex array object (attribute state)
      const vao = gl.createVertexArray();

      // and make it the one we're currently working with
      gl.bindVertexArray(vao);

      const positionBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
      );

      // Turn on the attribute
      gl.enableVertexAttribArray(positionAttributeLocation);

      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        4 * 4,
        0
      );

      gl.enableVertexAttribArray(coordAttributeLocation);

      gl.vertexAttribPointer(
        coordAttributeLocation,
        2,
        gl.FLOAT,
        false,
        4 * 4,
        2 * 4
      );

      const indicesBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );

      this.data = {
        program,
        colorLocation: colorLocation!,
        vao: vao!,
      };

      requestAnimationFrame(this.draw);
    }
  }

  draw(now: DOMHighResTimeStamp) {
    const gl = this.gl;
    now *= 0.001;
    if (gl && this.data) {
      const { program, colorLocation, vao } = this.data;
      this.resizeCanvasToDisplaySize(gl.canvas);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Bind the attribute/buffer set we want.
      gl.bindVertexArray(vao);

      // Draw in Red
      gl.uniform4fv(colorLocation, [1, 0, 0, 1]);

      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    requestAnimationFrame(this.draw);
  }

  render(): React.ReactNode {
    return (
      <div className="Background">
        <canvas ref={this.canvas} />
      </div>
    );
  }
}

export default Background;
