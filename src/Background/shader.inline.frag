#version 300 es
precision highp float;

in vec2 coord;

uniform vec4 u_color;

out vec4 outColor;

void main() {
   outColor = vec4(coord, 0.0, 1.0);
}