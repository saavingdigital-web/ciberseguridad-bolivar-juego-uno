// Materiales compartidos del mundo (se crean una sola vez)
import * as THREE from 'three';
import * as T from './texturas.js';
import { parchear } from './util.js';

export function crearMateriales() {
  const fach = T.texturaFachadas();
  const tejas = T.texturaTejas();
  const piedra = T.texturaPiedra();
  const adoq = T.texturaAdoquin();
  const vidrio = T.texturaVidrio();
  const ofi = T.texturaOficinas();
  const corr = T.texturaCorrugada();

  const M = {};

  // Fachadas con tinte por vértice solo en la pared (máscara)
  M.fachada = new THREE.MeshStandardMaterial({
    map: fach.map, vertexColors: true, roughness: 0.92, metalness: 0,
    emissiveMap: fach.emisivo, emissive: new THREE.Color(1, 0.92, 0.8), emissiveIntensity: 0.2
  });
  parchear(M.fachada, 'fachada-tinte', sh => {
    sh.uniforms.mascaraTinte = { value: fach.mascara };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\nuniform sampler2D mascaraTinte;')
      .replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          float mk = texture2D( mascaraTinte, vMapUv ).r;
          diffuseColor *= sampledDiffuseColor;
          diffuseColor.rgb *= mix( vec3( 1.0 ), vColor, mk );
        #endif`)
      .replace('#include <color_fragment>', '');
  });

  // Color por vértice liso (molduras, cuerpos, piezas)
  M.solido = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
  M.metal = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.65 });

  M.tejas = new THREE.MeshStandardMaterial({ map: tejas.map, bumpMap: tejas.bump, bumpScale: 2.6, vertexColors: true, roughness: 0.78 });
  M.piedra = new THREE.MeshStandardMaterial({ map: piedra.map, bumpMap: piedra.bump, bumpScale: 2.2, vertexColors: true, roughness: 0.95 });
  M.asfalto = new THREE.MeshStandardMaterial({ map: T.texturaAsfalto(), roughness: 0.93, metalness: 0, vertexColors: true });
  M.adoquin = new THREE.MeshStandardMaterial({ map: adoq.map, bumpMap: adoq.bump, bumpScale: 2.4, roughness: 0.8, vertexColors: true });
  M.anden = new THREE.MeshStandardMaterial({ map: T.texturaAnden(), roughness: 0.88, vertexColors: true });
  M.techo = new THREE.MeshStandardMaterial({ map: T.texturaTecho(), roughness: 0.95, vertexColors: true });
  M.cesped = new THREE.MeshStandardMaterial({ map: T.texturaCesped(), roughness: 1, vertexColors: true });
  M.terreno = new THREE.MeshStandardMaterial({ map: T.texturaTerreno(), roughness: 0.97, vertexColors: true });
  M.corrugado = new THREE.MeshStandardMaterial({ map: corr.map, bumpMap: corr.bump, bumpScale: 1.2, roughness: 0.55, metalness: 0.35, vertexColors: true });

  M.vidrio = new THREE.MeshStandardMaterial({
    map: vidrio.map, roughnessMap: vidrio.rugosidad, roughness: 1, metalness: 0.45,
    emissiveMap: vidrio.emisivo, emissive: 0xffffff, emissiveIntensity: 0.5, vertexColors: true, envMapIntensity: 1.6
  });
  M.oficinas = new THREE.MeshStandardMaterial({
    map: ofi.map, roughness: 0.5, metalness: 0.2,
    emissiveMap: ofi.emisivo, emissive: 0xffffff, emissiveIntensity: 0.25, vertexColors: true
  });
  // Vidrio genérico (vitrinas, domos, autos)
  M.cristal = new THREE.MeshStandardMaterial({ color: 0x7fa9c8, roughness: 0.1, metalness: 0.6, envMapIntensity: 1.7 });

  // Luces (color por vértice en HDR para el bloom)
  M.luces = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: true });
  M.lucesAditivas = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });

  M.texturas = { fach, tejas, piedra, adoq, vidrio, ofi, corr };
  return M;
}

// Material holográfico aditivo con fresnel y líneas de barrido
export function materialHolo(color = '#5ff3ff', { intensidad = 1.6, lineas = 18, fresnel = 2.0, base = 0.15 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uT: { value: 0 },
      uI: { value: intensidad },
      uLineas: { value: lineas },
      uBase: { value: base },
      uFres: { value: fresnel }
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec2 vUv;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        vP = (modelMatrix * vec4(position,1.0)).xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uT; uniform float uI; uniform float uLineas; uniform float uBase; uniform float uFres;
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec2 vUv;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uFres);
        float l = 0.5 + 0.5 * sin(vP.y * uLineas - uT * 4.0);
        float a = (uBase + f) * (0.65 + 0.35 * l);
        gl_FragColor = vec4(uColor * a * uI, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
}
