function createShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: number
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(
      "could not compile " + type + " shader:\n\n" + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  } else {
    return shader;
  }
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compiledVert = createShader(gl, vs, gl.VERTEX_SHADER);
  const compiledFrag = createShader(gl, fs, gl.FRAGMENT_SHADER);

  if (!compiledVert || !compiledFrag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, compiledVert);
  gl.attachShader(program, compiledFrag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("could not link the shader program!");
    gl.deleteProgram(program);
    gl.deleteProgram(compiledVert);
    gl.deleteProgram(compiledFrag);
    return null;
  } else {
    return program;
  }
}

export { createShader, createProgram };
