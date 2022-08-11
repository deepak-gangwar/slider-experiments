import * as THREE from "three"

import { experience } from "./experience"

// GLSL Shaders
import fragmentShader from 'shaders/fragmentShader.glsl'
import vertexShader from 'shaders/vertexShader.glsl'

const loader = new THREE.TextureLoader()
loader.crossOrigin = 'anonymous'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    isDevice: navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
}

/**
 * WebGL Stuff
 */

class GlObject extends THREE.Object3D {

    init(el) {
        this.el = el

        this.resize()
    }

    resize() {
        this.rect = this.el.getBoundingClientRect()
        const { left, top, width, height } = this.rect

        // maybe we need to change this
        this.pos = {
            x: (left + (width / 2)) - (sizes.width / 2),
            y: (top + (height / 2)) - (sizes.height / 2)
        }

        this.position.y = this.pos.y
        this.position.x = this.pos.x

        this.updateY()
    }

    updateY(current) {
        current && (this.position.y = current + this.pos.y)
    }
}

const planeGeo = new THREE.PlaneBufferGeometry(1, 1, 32, 32)
const planeMat = new THREE.ShaderMaterial({
    transparent: true,
    fragmentShader,
    vertexShader
})

export default class Plane extends GlObject {

    init(el) {
        super.init(el)

        this.geo = planeGeo
        this.mat = planeMat.clone()

        this.mat.uniforms = {
            uTime: { value: 0 },
            uTexture: { value: 0 },
            uMeshSize: { value: new THREE.Vector2(this.rect.width, this.rect.height) },
            uImageSize: { value: new THREE.Vector2(0, 0) },
            uScale: { value: 0.75 },
            uVelo: { value: 0 }
        }

        this.img = this.el.querySelector('img')
        this.texture = loader.load(this.img.src, (texture) => {
            texture.minFilter = THREE.LinearFilter
            texture.generateMipmaps = false

            this.mat.uniforms.uTexture.value = texture
            this.mat.uniforms.uImageSize.value = [this.img.naturalWidth, this.img.naturalHeight]
        })

        this.mesh = new THREE.Mesh(this.geo, this.mat)
        this.mesh.scale.set(this.rect.width, this.rect.height, 1)
        this.add(this.mesh)
        experience.scene.add(this)
    }
}