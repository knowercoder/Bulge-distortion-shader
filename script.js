// Canvas
const canvas = document.querySelector('canvas.webgl');

//#region Initialize Scene

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const sizes = {
    width: canvas.clientWidth,
    height: canvas.clientHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1;
scene.add(camera);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5); 
directionalLight1.position.set(5, 3, 5);
directionalLight1.intensity = 1.5;
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight2.position.set(-5, -3, -5);
directionalLight2.intensity = 1.5;
scene.add(directionalLight1);
scene.add(directionalLight2);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//#endregion


const textureLoader = new THREE.TextureLoader();
const mainTexture = textureLoader.load('./static/img/myimage1.jpg');

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        _mainTex: { value: mainTexture }, 
        _centre: { value: new THREE.Vector2(0.0, 0.5)},   
        _scale: { value: -0.5},  
        _radius: { value: 0.3}  
    },
    vertexShader: /* glsl */`                
        varying vec2 vUv;        

        void main() {
            vUv = uv;                 
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */`

        uniform sampler2D _mainTex;
        uniform vec2 _centre;
        uniform float _scale;
        uniform float _radius;

        varying vec2 vUv;        
        
        void main() {           
            
            vec2 uv = vUv; 
            vec2 centre = _centre * 0.51 + vec2(0.5, 0.5);
            
            uv = uv - centre;
            float buldgeDist = smoothstep(clamp(_scale, -1.0, _radius), _radius, distance(centre, vUv));
            uv = uv * buldgeDist + centre;

            uv = uv * 2.0 - 0.5;
            vec4 mainCol = texture2D(_mainTex, uv);
            
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                discard;
            }

            gl_FragColor = mainCol;
        }
    `,
    transparent: true
});


// Create a plane geometry
const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
const planemesh = new THREE.Mesh(geometry, shaderMaterial);
planemesh.position.set(0.0, 0.0, 0.0);
planemesh.rotation.z = 0.0;  
planemesh.scale.set(1.5, 1.5, 1.5);
scene.add(planemesh);

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

//set mouse position as _centre uniform of the shader
window.addEventListener('mousemove', (event) => {   
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;   
    raycaster.setFromCamera(mouse, camera);
   
    const intersects = raycaster.intersectObject(planemesh);
    if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;        
        const localPoint = planemesh.worldToLocal(intersectPoint);       
        shaderMaterial.uniforms._centre.value.set(localPoint.x, localPoint.y);
    }
});


// Handle window resize
window.addEventListener('resize', () => {
    sizes.width = canvas.clientWidth;
    sizes.height = canvas.clientHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate); 
   
    renderer.render(scene, camera);
}

animate();
