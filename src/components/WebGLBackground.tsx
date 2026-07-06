// src/components/WebGLBackground.tsx
import { useEffect, useRef } from "react";

const SHADER_CONFIG = {
  glassRefraction: 0.004,
  shimmerSpeed: 1,
  tilt: 0.15,
  staticGrain: 0.074,
  mouseInfluence: 0.01,
  dark: { bg: "#000000", glass: "#005582", highlight: "#ffffff", shimmer: "#ffffff" },
  light: { bg: "#ffffff", glass: "#00acc2", highlight: "#94a3b8", shimmer: "#ffffff" }
};

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}`;
};

const vertexShaderSource = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_theme;
  uniform vec2 u_mouse;
  uniform float u_stripCount;

  const float refraction = ${SHADER_CONFIG.glassRefraction.toFixed(3)};
  const float speed = ${SHADER_CONFIG.shimmerSpeed.toFixed(3)};
  const float grainAmount = ${SHADER_CONFIG.staticGrain.toFixed(4)};
  const float tilt = ${SHADER_CONFIG.tilt.toFixed(2)};

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    vec3 d_bg = vec3(${hexToRgb(SHADER_CONFIG.dark.bg)});
    vec3 d_gl = vec3(${hexToRgb(SHADER_CONFIG.dark.glass)});
    vec3 d_hi = vec3(${hexToRgb(SHADER_CONFIG.dark.highlight)});
    vec3 d_sh = vec3(${hexToRgb(SHADER_CONFIG.dark.shimmer)});

    vec3 l_bg = vec3(${hexToRgb(SHADER_CONFIG.light.bg)});
    vec3 l_gl = vec3(${hexToRgb(SHADER_CONFIG.light.glass)});
    vec3 l_hi = vec3(${hexToRgb(SHADER_CONFIG.light.highlight)});
    vec3 l_sh = vec3(${hexToRgb(SHADER_CONFIG.light.shimmer)});

    vec3 bgCol = mix(l_bg, d_bg, u_theme);
    vec3 glassCol = mix(l_gl, d_gl, u_theme);
    vec3 hiCol = mix(l_hi, d_hi, u_theme);
    vec3 shimmerCol = mix(l_sh, d_sh, u_theme);

    vec2 p = uv;
    p.x += p.y * tilt;
    p.x += (u_mouse.x - 0.5) * ${SHADER_CONFIG.mouseInfluence.toFixed(2)};
    
    float stripX = p.x * u_stripCount;
    float id = floor(stripX);
    float localX = fract(stripX);

    vec3 color = bgCol;
    float border = 0.02;
    float mask = smoothstep(0.0, border, localX) * smoothstep(1.0, 1.0 - border, localX);
    
    color = mix(color, glassCol, mask * 0.4);

    float edge = smoothstep(0.0, 0.1, localX) * smoothstep(0.2, 0.1, localX);
    float edge2 = smoothstep(0.8, 0.9, localX) * smoothstep(1.0, 0.9, localX);
    color += hiCol * (edge + edge2) * (u_theme > 0.5 ? 0.2 : 0.1);

    float shimmer = sin(p.y * 2.0 - u_time * speed + id) * 0.5 + 0.5;
    shimmer = pow(shimmer, 8.0);
    color += shimmerCol * shimmer * mask * (u_theme > 0.5 ? 0.1 : 0.05);

    float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * grainAmount;

    float vig = smoothstep(1.5, 0.2, length(uv - 0.5));
    color = mix(bgCol, color, vig);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef<number>(document.documentElement.classList.contains("dark") ? 1.0 : 0.0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const isVisibleRef = useRef(true); // Tracks if canvas is in viewport

  useEffect(() => {
    const observer = new MutationObserver(() => {
      themeRef.current = document.documentElement.classList.contains("dark") ? 1.0 : 0.0;
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Intersection Observer to pause rendering when off-screen
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0 });

    if (canvasRef.current) {
      intersectionObserver.observe(canvasRef.current);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: 1.0 - (e.clientY / window.innerHeight) };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })!; // Disabled antialias for performance

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uTheme = gl.getUniformLocation(program, "u_theme");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uStripCount = gl.getUniformLocation(program, "u_stripCount");

    let currentTheme = themeRef.current;
    let aid: number;

    const resize = () => {
      // 🚀 MASSIVE MOBILE FIX: Cap devicePixelRatio to 1 on mobile to prevent GPU bottleneck
      const isMobile = window.innerWidth < 768;
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    const render = (t: number) => {
      // Only execute GL instructions if canvas is actually visible
      if (isVisibleRef.current) {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, t * 0.001);
        gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
        currentTheme += (themeRef.current - currentTheme) * 0.05;
        gl.uniform1f(uTheme, currentTheme);

        let strips = 8.0;
        if (window.innerWidth < 640) strips = 2.0;
        else if (window.innerWidth < 1024) strips = 5.0;
        gl.uniform1f(uStripCount, strips);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      
      aid = requestAnimationFrame(render);
    };
    render(0);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      intersectionObserver.disconnect();
      cancelAnimationFrame(aid);
    };
  }, []);

  return (
    <div 
      className="absolute top-0 left-0 w-full h-[120vh] z-0 pointer-events-none" 
      style={{ 
        maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", 
        WebkitMaskImage: "-webkit-linear-gradient(top, black 60%, transparent 100%)" 
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}