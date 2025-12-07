// script.js

document.addEventListener("DOMContentLoaded", () => {

    /* ---------------- SMOOTH SCROLL ---------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId && targetId !== "#") {
                e.preventDefault();
                const targetEl = document.querySelector(targetId);
                if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    /* ---------------- SCROLL REVEAL ---------------- */
    const fadeElements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    fadeElements.forEach(el => observer.observe(el));

    /* ---------------- TYPING EFFECT ---------------- */
    const typingTarget = document.getElementById("typing");
    const typingText = "Ninad Padamwar";
    if (typingTarget) {
        let i = 0;
        (function typeEffect() {
            if (i < typingText.length) {
                typingTarget.textContent += typingText.charAt(i++);
                setTimeout(typeEffect, 120);
            }
        })();
    }

    /* ---------------- DARK MODE ---------------- */
    const toggleBtn = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") document.body.classList.add("light-mode");

    function updateIcon() {
        if (!toggleBtn) return;
        toggleBtn.textContent = document.body.classList.contains("light-mode") ? "🌙" : "☀️";
    }
    updateIcon();

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            localStorage.setItem(
                "theme",
                document.body.classList.contains("light-mode") ? "light" : "dark"
            );
            updateIcon();
        });
    }

    /* ---------------- BACKGROUND BLOBS ---------------- */
    document.addEventListener("mousemove", (e) => {
        document.querySelectorAll(".blob").forEach(blob => {
            const speed = blob.getAttribute("data-speed") || 20;
            const x = (window.innerWidth - e.pageX * speed) / 200;
            const y = (window.innerHeight - e.pageY * speed) / 200;
            blob.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    /* =================================================
       ORBIT ICONS + ELECTRIC LINES (2D UI LAYER)
    ================================================== */
    const orbitIcons = document.querySelectorAll(".orbit-icon");
    const electricCanvas = document.getElementById("electric-lines");
    const eCtx = electricCanvas ? electricCanvas.getContext("2d") : null;

    let cubeRotX = 0;
    let cubeRotY = 0;

    // Resize electric canvas to wrapper
    function resizeElectricCanvas() {
        if (!electricCanvas) return;
        electricCanvas.width = electricCanvas.offsetWidth;
        electricCanvas.height = electricCanvas.offsetHeight;
    }
    if (electricCanvas) {
        resizeElectricCanvas();
        window.addEventListener("resize", resizeElectricCanvas);
    }

    // Orbit icons reacting to cube rotation
    function updateOrbitIcons() {
        if (!orbitIcons.length || !electricCanvas) return;
        const t = Date.now() * 0.0006; // base orbit speed

        const centerX = electricCanvas.width / 2;
        const centerY = electricCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        orbitIcons.forEach((icon, index) => {
            const angle = t + (index * (Math.PI * 2 / orbitIcons.length));
            const x = centerX + Math.cos(angle + cubeRotY) * radius;
            const y = centerY + Math.sin(angle + cubeRotX) * radius;

            icon.style.transform = `translate(${x - 25}px, ${y - 25}px)`; // ~50px icon
        });
    }

    // Neon glow pulses on icons
    function pulseOrbitGlows() {
        if (!orbitIcons.length) return;
        const t = Date.now() * 0.004;
        orbitIcons.forEach((icon, idx) => {
            const pulse = 0.6 + 0.4 * Math.sin(t + idx);
            icon.style.boxShadow = `0 0 ${18 * pulse}px rgba(0,255,255,${pulse})`;
        });
    }

    // Electric lines between icons
    function drawElectricLinks() {
        if (!eCtx || !electricCanvas || !orbitIcons.length) return;

        eCtx.clearRect(0, 0, electricCanvas.width, electricCanvas.height);

        const points = [];
        const parentRect = electricCanvas.getBoundingClientRect();

        orbitIcons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            points.push({
                x: rect.left - parentRect.left + rect.width / 2,
                y: rect.top - parentRect.top + rect.height / 2
            });
        });

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 260) {
                    const opacity = 1 - dist / 260;

                    eCtx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                    eCtx.lineWidth = 2;
                    eCtx.shadowBlur = 15;
                    eCtx.shadowColor = "#00eaff";

                    eCtx.beginPath();
                    eCtx.moveTo(points[i].x, points[i].y);
                    eCtx.lineTo(points[j].x, points[j].y);
                    eCtx.stroke();

                    // occasional stronger electric flash
                    if (Math.random() > 0.92) {
                        eCtx.strokeStyle = "rgba(0,150,255,1)";
                        eCtx.lineWidth = 3;
                        eCtx.beginPath();
                        eCtx.moveTo(points[i].x, points[i].y);
                        eCtx.lineTo(points[j].x, points[j].y);
                        eCtx.stroke();
                    }
                }
            }
        }
    }

    /* =================================================
       3D CYBERPUNK DEV CUBE (THREE.JS)
    ================================================== */
    const canvas = document.getElementById("three-canvas");

    if (canvas && window.THREE) {
        const scene = new THREE.Scene();
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 4;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 1);

        // Galaxy background + fog
        const galaxyTexture = new THREE.TextureLoader().load(
            "https://i.imgur.com/8wRSxFZ.jpeg"
        );
        scene.background = galaxyTexture;
        scene.fog = new THREE.FogExp2(0x020617, 0.22);

        // Glitch shader material
        function createGlitchMaterial(texture) {
            return new THREE.ShaderMaterial({
                uniforms: {
                    map: { value: texture },
                    time: { value: 0.0 },
                    intensity: { value: 0.18 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    precision mediump float;
                    uniform sampler2D map;
                    uniform float time;
                    uniform float intensity;
                    varying vec2 vUv;

                    float random(float x) { return fract(sin(x*12345.0)*7658.123); }

                    void main() {
                        vec2 uv = vUv;

                        float glitchLine = step(0.97, fract(sin(time * 5.0) * 43758.5453));
                        uv.x += glitchLine * (random(time) - 0.5) * intensity;

                        float r = texture2D(map, uv + vec2(intensity * 0.01, 0.0)).r;
                        float g = texture2D(map, uv).g;
                        float b = texture2D(map, uv - vec2(intensity * 0.01, 0.0)).b;

                        vec3 color = vec3(r, g, b);

                        float flicker = sin(time * 40.0) * 0.03;
                        color += flicker;

                        gl_FragColor = vec4(color, 1.0);
                    }
                `,
                transparent: false
            });
        }

        // Hologram grid overlay
        const circuitMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main(){
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision mediump float;
                varying vec2 vUv;
                uniform float time;

                void main() {
                    float gx = step(0.98, fract((vUv.x + sin(time * 1.2)*0.08) * 12.0));
                    float gy = step(0.98, fract((vUv.y + cos(time * 1.6)*0.08) * 12.0));
                    float glow = (gx + gy) * 1.4;
                    gl_FragColor = vec4(0.0, 1.0, 1.0, glow);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        // Icon textures
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");

        const texUrls = [
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.png",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.png",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.png",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.png",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.png",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.png"
        ];

        const faceTextures = texUrls.map(url => loader.load(url));
        const cubeMaterials = faceTextures.map(tex => createGlitchMaterial(tex));

        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            cubeMaterials
        );
        scene.add(cube);

        // Hologram overlay cube
        const cubeOverlay = new THREE.Mesh(
            new THREE.BoxGeometry(1.52, 1.52, 1.52),
            circuitMaterial
        );
        scene.add(cubeOverlay);

        // Floating particles
        const particleGeo = new THREE.BufferGeometry();
        const pos = [];
        for (let i = 0; i < 250; i++) {
            pos.push((Math.random() - 0.5) * 12);
            pos.push((Math.random() - 0.5) * 12);
            pos.push((Math.random() - 0.5) * 12);
        }
        particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        const particles = new THREE.Points(
            particleGeo,
            new THREE.PointsMaterial({
                color: 0x00eaff,
                size: 0.08,
                opacity: 0.9,
                transparent: true,
                blending: THREE.AdditiveBlending
            })
        );
        scene.add(particles);

        // Starfield
        const starGeo = new THREE.BufferGeometry();
        const starPos = [];
        for (let i = 0; i < 700; i++) {
            starPos.push((Math.random() - 0.5) * 30);
            starPos.push((Math.random() - 0.5) * 30);
            starPos.push((Math.random() - 0.5) * 30);
        }
        starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
        const starField = new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.03,
                opacity: 0.8,
                transparent: true
            })
        );
        scene.add(starField);

        // Edge sparks
        const sparkGeo = new THREE.BufferGeometry();
        const sparkPos = [];
        for (let i = 0; i < 300; i++) {
            const r = 1.2;
            sparkPos.push((Math.random() - 0.5) * r * 2);
            sparkPos.push((Math.random() - 0.5) * r * 2);
            sparkPos.push((Math.random() - 0.5) * r * 2);
        }
        sparkGeo.setAttribute("position", new THREE.Float32BufferAttribute(sparkPos, 3));
        const sparkMat = new THREE.PointsMaterial({
            color: 0x00eaff,
            size: 0.05,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        const sparks = new THREE.Points(sparkGeo, sparkMat);
        scene.add(sparks);

        function animateSparks() {
            sparks.rotation.x += 0.01;
            sparks.rotation.y += 0.02;
        }

        // Shockwave ring
        const shockGeo = new THREE.RingGeometry(0.5, 0.52, 64);
        const shockMat = new THREE.MeshBasicMaterial({
            color: 0x00eaff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const shockwave = new THREE.Mesh(shockGeo, shockMat);
        shockwave.rotation.x = Math.PI / 2;
        scene.add(shockwave);

        let shockScale = 0.1;
        let shockActive = false;

        function triggerShockwave() {
            shockActive = true;
            shockScale = 0.1;
            shockwave.material.opacity = 0.8;
        }
        setInterval(triggerShockwave, 4500);

        // Lights
        const ambient = new THREE.AmbientLight(0x66ccff, 0.7);
        scene.add(ambient);

        const rimLight = new THREE.PointLight(0x00eaff, 3);
        rimLight.position.set(4, 4, 6);
        scene.add(rimLight);

        const magentaLight = new THREE.PointLight(0xff00ff, 1.7);
        magentaLight.position.set(-3, -2, -4);
        scene.add(magentaLight);

        function pulseLights() {
            const t = Date.now();
            rimLight.intensity = 2.5 + Math.sin(t * 0.003) * 1.4;
            magentaLight.intensity = 1.2 + Math.sin(t * 0.002) * 0.6;
        }

        /* ---------------- POST-PROCESSING (Heatwave + Bloom) ---------------- */
        let composer = null;
        let heatwaveMaterial = null;

        // Only enable if postprocessing scripts are loaded (EffectComposer, RenderPass, ShaderPass, UnrealBloomPass)
        if (THREE.EffectComposer && THREE.RenderPass && THREE.ShaderPass && THREE.UnrealBloomPass) {

            composer = new THREE.EffectComposer(renderer);
            const renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);

            // Heatwave screen shader
            heatwaveMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    tDiffuse: { value: null }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform sampler2D tDiffuse;
                    varying vec2 vUv;

                    void main() {
                        vec2 uv = vUv;

                        float wave = sin(uv.y * 12.0 + time * 3.0) * 0.01;
                        float ripple = sin(uv.x * 15.0 - time * 2.5) * 0.01;
                        uv.x += wave + ripple;

                        float centerDist = distance(uv, vec2(0.5));
                        float distortion = (0.04 / (centerDist + 0.15));
                        uv.y += distortion * sin(time * 2.0);

                        vec4 color = texture2D(tDiffuse, uv);
                        color.rgb += vec3(0.05, 0.15, 0.18) * (1.0 - centerDist);

                        gl_FragColor = color;
                    }
                `,
                transparent: true
            });

            const heatPass = new THREE.ShaderPass(heatwaveMaterial);
            composer.addPass(heatPass);

            // Cyberpunk bloom
            const bloomParams = {
                strength: 1.8,
                radius: 0.6,
                threshold: 0.15
            };

            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(w, h),
                bloomParams.strength,
                bloomParams.radius,
                bloomParams.threshold
            );
            composer.addPass(bloomPass);
        }

        // Main animation loop
        function animate() {
            // cube rotation
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.017;

            cubeRotX = cube.rotation.x;
            cubeRotY = cube.rotation.y;

            // hologram overlay
            cubeOverlay.rotation.copy(cube.rotation);
            circuitMaterial.uniforms.time.value += 0.03;

            // glitch faces
            cube.material.forEach(mat => {
                if (mat.uniforms) {
                    mat.uniforms.time.value += 0.02;
                    mat.uniforms.intensity.value =
                        0.15 + Math.sin(Date.now() * 0.005) * 0.05;
                }
            });

            // particles + stars + sparks
            particles.rotation.y += 0.002;
            starField.rotation.y += 0.0006;
            animateSparks();

            // shockwave
            if (shockActive) {
                shockScale += 0.02;
                shockwave.scale.set(shockScale, shockScale, shockScale);
                shockwave.material.opacity -= 0.01;
                if (shockwave.material.opacity <= 0) {
                    shockActive = false;
                }
            }

            // 2D UI layer (icons + electric web)
            updateOrbitIcons();
            pulseOrbitGlows();
            drawElectricLinks();

            // lights
            pulseLights();

            // render with or without postprocessing
            if (composer && heatwaveMaterial) {
                heatwaveMaterial.uniforms.time.value += 0.02;
                composer.render();
            } else {
                renderer.render(scene, camera);
            }

            requestAnimationFrame(animate);
        }
        animate();

        // Responsive resize
        window.addEventListener("resize", () => {
            const nw = canvas.clientWidth;
            const nh = canvas.clientHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
            if (electricCanvas) resizeElectricCanvas();
        });
    }
        /* ===========================
       NEURAL MAP TOOLTIP + TILT
    ============================ */
    const neuralWrapper = document.querySelector(".neural-map-wrapper");
    const neuralTooltip = document.getElementById("neural-tooltip");
    const neuralNodeGroups = document.querySelectorAll(".neural-node-group");

    // Parallax tilt on mouse move
    if (neuralWrapper) {
        neuralWrapper.addEventListener("mousemove", (e) => {
            const rect = neuralWrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            neuralWrapper.style.transform =
                `perspective(700px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
        });

        neuralWrapper.addEventListener("mouseleave", () => {
            neuralWrapper.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
        });
    }

    // Tooltip follow on hover
    if (neuralTooltip && neuralNodeGroups.length) {
        neuralNodeGroups.forEach(group => {
            group.addEventListener("mouseenter", (e) => {
                const skill = group.getAttribute("data-skill") || "";
                const level = group.getAttribute("data-level") || "";

                neuralTooltip.querySelector(".neural-tooltip-skill").textContent = skill;
                neuralTooltip.querySelector(".neural-tooltip-level").textContent = `Level: ${level}`;
                neuralTooltip.style.display = "block";
            });

            group.addEventListener("mousemove", (e) => {
                const rect = neuralWrapper.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                neuralTooltip.style.left = `${offsetX}px`;
                neuralTooltip.style.top = `${offsetY}px`;
            });

            group.addEventListener("mouseleave", () => {
                neuralTooltip.style.display = "none";
            });
        });
    }
/* ===========================
   AI SKILL ANALYZER TYPING
=========================== */

const analyzerText = document.getElementById("analyzer-text");

if (analyzerText) {
    const messages = [
        "Initializing AI Skill Analyzer...",
        "Scanning neural graph pathways...",
        "Analyzing Ninad’s skill graph…",
        "Estimating neural stability...",
        "Neural stability: 94% ✓",
        "Skill matrix integrity: Optimal.",
        "AI Analysis Complete ✓"
    ];

    let msgIndex = 0;
    let charIndex = 0;

    function typeAnalyzer() {
        if (msgIndex >= messages.length) return;

        analyzerText.classList.add("skill-analyzer-glow");

        const current = messages[msgIndex];
        analyzerText.textContent = current.substring(0, charIndex + 1);

        charIndex++;

        if (charIndex === current.length) {
            setTimeout(() => {
                msgIndex++;
                charIndex = 0;
                analyzerText.textContent = "";
                typeAnalyzer();
            }, 1300); // wait before next message
        } else {
            setTimeout(typeAnalyzer, 55);
        }
    }

    typeAnalyzer();
}
/* ======================================================
     3️⃣ JARVIS MODE: NODE ACTIVATION SEQUENCE
====================================================== */

const neuralNodes = document.querySelectorAll(".neural-node");

function activateNodes() {
    neuralNodes.forEach((node, i) => {
        setTimeout(() => {
            node.classList.add("active-node");
        }, i * 150);
    });
}

activateNodes();

document.querySelectorAll(".jarvis-project-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 14;
        const rotateX = ((y / rect.height) - 0.5) * -14;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = `rotateX(0) rotateY(0) scale(1)`;
    });
});

});
