// Floating Lines Animation - Converted from React to Vanilla JS
class FloatingLines {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.clock = null;
        this.resizeObserver = null;
        this.animationId = null;
        this.targetMouse = { x: -1000, y: -1000 };
        this.currentMouse = { x: -1000, y: -1000 };
        this.targetInfluence = 0;
        this.currentInfluence = 0;
        this.targetParallax = { x: 0, y: 0 };
        this.currentParallax = { x: 0, y: 0 };
        this.mouseDamping = 0.05;
        this.interactive = true;
        this.parallax = true;

        this.init();
    }

    init() {
        if (!this.container) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.camera.position.z = 1;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.container.appendChild(this.renderer.domElement);

        // Shaders
        const vertexShader = `
            precision highp float;
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            precision highp float;

            uniform float iTime;
            uniform vec3  iResolution;
            uniform float animationSpeed;

            uniform bool enableTop;
            uniform bool enableMiddle;
            uniform bool enableBottom;

            uniform int topLineCount;
            uniform int middleLineCount;
            uniform int bottomLineCount;

            uniform float topLineDistance;
            uniform float middleLineDistance;
            uniform float bottomLineDistance;

            uniform vec3 topWavePosition;
            uniform vec3 middleWavePosition;
            uniform vec3 bottomWavePosition;

            uniform vec2 iMouse;
            uniform bool interactive;
            uniform float bendRadius;
            uniform float bendStrength;
            uniform float bendInfluence;

            uniform bool parallax;
            uniform float parallaxStrength;
            uniform vec2 parallaxOffset;

            uniform vec3 lineGradient[8];
            uniform int lineGradientCount;

            const vec3 BLACK = vec3(0.0);
            const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
            const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

            mat2 rotate(float r) {
                return mat2(cos(r), sin(r), -sin(r), cos(r));
            }

            vec3 background_color(vec2 uv) {
                vec3 col = vec3(0.0);
                float y = sin(uv.x - 0.2) * 0.3 - 0.1;
                float m = uv.y - y;
                col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
                col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
                return col * 0.5;
            }

            vec3 getLineColor(float t, vec3 baseColor) {
                if (lineGradientCount <= 0) {
                    return baseColor;
                }
                vec3 gradientColor;
                if (lineGradientCount == 1) {
                    gradientColor = lineGradient[0];
                } else {
                    float clampedT = clamp(t, 0.0, 0.9999);
                    float scaled = clampedT * float(lineGradientCount - 1);
                    int idx = int(floor(scaled));
                    float f = fract(scaled);
                    int idx2 = min(idx + 1, lineGradientCount - 1);
                    vec3 c1 = lineGradient[idx];
                    vec3 c2 = lineGradient[idx2];
                    gradientColor = mix(c1, c2, f);
                }
                return gradientColor * 0.5;
            }

            float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
                float time = iTime * animationSpeed;
                float x_offset   = offset;
                float x_movement = time * 0.1;
                float amp        = sin(offset + time * 0.2) * 0.3;
                float y          = sin(uv.x + x_offset + x_movement) * amp;

                if (shouldBend) {
                    vec2 d = screenUv - mouseUv;
                    float influence = exp(-dot(d, d) * bendRadius);
                    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
                    y += bendOffset;
                }
                float m = uv.y - y;
                return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
                baseUv.y *= -1.0;
                
                if (parallax) {
                    baseUv += parallaxOffset;
                }

                vec3 col = vec3(0.0);
                vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

                vec2 mouseUv = vec2(0.0);
                if (interactive) {
                    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
                    mouseUv.y *= -1.0;
                }
                
                if (enableBottom) {
                    for (int i = 0; i < bottomLineCount; ++i) {
                        float fi = float(i);
                        float t = fi / max(float(bottomLineCount - 1), 1.0);
                        vec3 lineCol = getLineColor(t, b);
                        float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
                        vec2 ruv = baseUv * rotate(angle);
                        col += lineCol * wave(ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.2;
                    }
                }

                if (enableMiddle) {
                    for (int i = 0; i < middleLineCount; ++i) {
                        float fi = float(i);
                        float t = fi / max(float(middleLineCount - 1), 1.0);
                        vec3 lineCol = getLineColor(t, b);
                        float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
                        vec2 ruv = baseUv * rotate(angle);
                        col += lineCol * wave(ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive);
                    }
                }

                if (enableTop) {
                    for (int i = 0; i < topLineCount; ++i) {
                        float fi = float(i);
                        float t = fi / max(float(topLineCount - 1), 1.0);
                        vec3 lineCol = getLineColor(t, b);
                        float angle = topWavePosition.z * log(length(baseUv) + 1.0);
                        vec2 ruv = baseUv * rotate(angle);
                        ruv.x *= -1.0;
                        col += lineCol * wave(ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.1;
                    }
                }

                fragColor = vec4(col, 1.0);
            }

            void main() {
                vec4 color = vec4(0.0);
                mainImage(color, gl_FragCoord.xy);
                gl_FragColor = color;
            }
        `;

        // Uniforms
        this.uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3(1, 1, 1) },
            animationSpeed: { value: 1 },
            enableTop: { value: true },
            enableMiddle: { value: true },
            enableBottom: { value: true },
            topLineCount: { value: 6 },
            middleLineCount: { value: 8 },
            bottomLineCount: { value: 4 },
            topLineDistance: { value: 0.05 },
            middleLineDistance: { value: 0.08 },
            bottomLineDistance: { value: 0.06 },
            topWavePosition: { value: new THREE.Vector3(10.0, 0.5, -0.4) },
            middleWavePosition: { value: new THREE.Vector3(5.0, 0.0, 0.2) },
            bottomWavePosition: { value: new THREE.Vector3(2.0, -0.7, 0.4) },
            iMouse: { value: new THREE.Vector2(-1000, -1000) },
            interactive: { value: this.interactive },
            bendRadius: { value: 5.0 },
            bendStrength: { value: -0.5 },
            bendInfluence: { value: 0 },
            parallax: { value: this.parallax },
            parallaxStrength: { value: 0.2 },
            parallaxOffset: { value: new THREE.Vector2(0, 0) },
            lineGradient: {
                value: Array.from({ length: 8 }, () => new THREE.Vector3(1, 1, 1))
            },
            lineGradientCount: { value: 0 }
        };

        // Set gradient colors
        const gradientColors = ['#00d4ff', '#00ff88', '#ff00ff', '#ffff00'];
        gradientColors.forEach((hex, i) => {
            const color = this.hexToVec3(hex);
            this.uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
        });
        this.uniforms.lineGradientCount.value = gradientColors.length;

        // Material
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader
        });

        // Geometry
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(mesh);

        // Clock
        this.clock = new THREE.Clock();

        // Event listeners
        this.setSize();
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => this.setSize());
            this.resizeObserver.observe(this.container);
        }

        if (this.interactive) {
            this.renderer.domElement.addEventListener('pointermove', (e) => this.handlePointerMove(e));
            this.renderer.domElement.addEventListener('pointerleave', () => this.handlePointerLeave());
        }

        this.render();
    }

    hexToVec3(hex) {
        let value = hex.trim();
        if (value.startsWith('#')) value = value.slice(1);
        let r = 255, g = 255, b = 255;
        if (value.length === 3) {
            r = parseInt(value[0] + value[0], 16);
            g = parseInt(value[1] + value[1], 16);
            b = parseInt(value[2] + value[2], 16);
        } else if (value.length === 6) {
            r = parseInt(value.slice(0, 2), 16);
            g = parseInt(value.slice(2, 4), 16);
            b = parseInt(value.slice(4, 6), 16);
        }
        return new THREE.Vector3(r / 255, g / 255, b / 255);
    }

    setSize() {
        const width = this.container.clientWidth || 1;
        const height = this.container.clientHeight || 1;
        this.renderer.setSize(width, height, false);
        this.uniforms.iResolution.value.set(this.renderer.domElement.width, this.renderer.domElement.height, 1);
    }

    handlePointerMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const dpr = this.renderer.getPixelRatio();
        this.targetMouse = { x: x * dpr, y: (rect.height - y) * dpr };
        this.targetInfluence = 1.0;

        if (this.parallax) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offsetX = (x - centerX) / rect.width;
            const offsetY = -(y - centerY) / rect.height;
            this.targetParallax = { x: offsetX * 0.2, y: offsetY * 0.2 };
        }
    }

    handlePointerLeave() {
        this.targetInfluence = 0.0;
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    render = () => {
        this.uniforms.iTime.value = this.clock.getElapsedTime();

        if (this.interactive) {
            this.currentMouse.x = this.lerp(this.currentMouse.x, this.targetMouse.x, this.mouseDamping);
            this.currentMouse.y = this.lerp(this.currentMouse.y, this.targetMouse.y, this.mouseDamping);
            this.uniforms.iMouse.value.set(this.currentMouse.x, this.currentMouse.y);

            this.currentInfluence += (this.targetInfluence - this.currentInfluence) * this.mouseDamping;
            this.uniforms.bendInfluence.value = this.currentInfluence;
        }

        if (this.parallax) {
            this.currentParallax.x = this.lerp(this.currentParallax.x, this.targetParallax.x, this.mouseDamping);
            this.currentParallax.y = this.lerp(this.currentParallax.y, this.targetParallax.y, this.mouseDamping);
            this.uniforms.parallaxOffset.value.set(this.currentParallax.x, this.currentParallax.y);
        }

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.render);
    };

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.resizeObserver && this.container) {
            this.resizeObserver.disconnect();
        }
        if (this.interactive && this.renderer) {
            this.renderer.domElement.removeEventListener('pointermove', (e) => this.handlePointerMove(e));
            this.renderer.domElement.removeEventListener('pointerleave', () => this.handlePointerLeave());
        }
        if (this.material) this.material.dispose();
        if (this.renderer && this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        if (this.renderer) this.renderer.dispose();
    }
}

// Initialize when dashboard page is shown
let floatingLinesInstance = null;

window.initFloatingLines = function(containerId = 'floating-lines-bg') {
    const container = document.getElementById(containerId);
    if (container && !floatingLinesInstance) {
        console.log('Initializing FloatingLines in container:', containerId, container);
        floatingLinesInstance = new FloatingLines(container);
        console.log('FloatingLines initialized');
    }
    return floatingLinesInstance;
};

window.destroyFloatingLines = function() {
    if (floatingLinesInstance) {
        floatingLinesInstance.destroy();
        floatingLinesInstance = null;
    }
};
