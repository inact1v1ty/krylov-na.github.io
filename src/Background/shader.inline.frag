#version 300 es
precision highp float;

in vec2 coord;
uniform vec2 resolution;
uniform float time;

out vec4 out_color;

float sd_sphere(vec3 p, float s)
{
    return length(p) - s;
}

vec2 op_u(vec2 d1, vec2 d2)
{
	return (d1.x < d2.x) ? d1 : d2;
}

vec2 smin_cubic(float a, float b, float k)
{
    float h = max(k - abs(a - b), 0.0) / k;
    float m = h * h * h * 0.5;
    float s = m * k * (1.0 / 3.0); 
    return (a < b) ? vec2(a - s, m) : vec2(b - s, 1.0 - m);
}

vec2 map(in vec3 pos)
{
    vec2 res = vec2(1e10, 0.0);

    float x = 0.3 + 0.05 * sin(0.84 * time);

    res = op_u(res, vec2(
        smin_cubic(
            sd_sphere(pos - vec3(-1.0 * x, 0.2 * sin(time + 0.00), 0.0), 0.25),
            sd_sphere(pos - vec3( 1.0 * x, 0.2 * sin(time + 0.50), 0.0), 0.25),
            0.5
        ).x,
        2.0));

    return res;
}

// http://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calc_normal(in vec3 pos)
{
    vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.0005;
    return normalize(e.xyy * map(pos + e.xyy).x + 
					 e.yyx * map(pos + e.yyx).x + 
					 e.yxy * map(pos + e.yxy).x + 
					 e.xxx * map(pos + e.xxx).x); 
}

vec2 raycast(in vec3 ro, in vec3 rd)
{
    vec2 res = vec2(-1.0, 0.0);

    float tmin = 1.0;
    float tmax = 20.0;

    float t = tmin;
    for(int i = 0; i < 64 && t < tmax; i++)
    {
        vec2 h = map(ro + rd * t);
        // eps is greater when further
        if(abs(h.x) < (0.0001 * t))
        { 
            res = vec2(t, h.y); 
            break;
        }
        t += h.x;
    }
    return res;
}

vec4 render(in vec3 ro, in vec3 rd) {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 res = raycast(ro,rd);
    float t = res.x;
	float mat_id = res.y;

    if (mat_id > 0.5) {
        vec3 pos = ro + t*rd;
        vec3 normal = calc_normal(pos);

        float dif = clamp(dot(normal, vec3(0.57703)), 0.0, 1.0);
        vec3 col = vec3(0.325, 0.05, 0.28) + dif * vec3(1.0, 0.9, 0.8);
        color = vec4(col, 1.0);
    }

    return color;
}

void main() {
    vec2 pixel = 2.0 * coord - 1.0;
    pixel.x *= resolution.x / resolution.y;

    float focal_length = 2.5;
    vec3 ro = vec3(0.0, 0.0, -3.0);
    vec3 rd = normalize(vec3(pixel, focal_length));

    vec4 color = render(ro, rd);

    color.rgb = pow(color.rgb, vec3(0.4545));

    out_color = color;
}
