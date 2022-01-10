#version 300 es

in vec2 vert_pos;
in vec2 vert_coord;

out vec2 coord;

void main() {
  gl_Position = vec4(vert_pos, 0, 1);
  coord = vert_coord;
}