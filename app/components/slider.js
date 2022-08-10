import { _getClosest } from "../utils/math"
import { number } from "../utils/math"
import { lerp } from "../utils/math"

import * as THREE from "three"
import gsap from "gsap"

const store = {
    ww: window.innerWidth,
    wh: window.innerHeight,
    isDevice: navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
}

export class Slider {
    constructor(options = {}) {
        this.bind()

        this.opts = {
            el: options.el || '.js-slider',
            ease: options.ease || 0.1,
            speed: options.speed || 1.5,
        }

        // this can be added to this.ui object
        this.slider = document.querySelector('.js-slider')
        this.sliderInner = this.slider.querySelector('.js-slider__inner')
        this.slides = [...this.slider.querySelectorAll('.js-slide')]
        this.slidesNumb = this.slides.length

        this.rAF = undefined

        this.state = {
            isDragging: false,
            isScrolling: false,

            sliderHeight: 0,

            onY: 0,
            offY: 0,

            currentY: 0,
            targetY: 0,

            min: 0,
            max: 0,

            diff: 0,

            centerY: window.innerHeight / 2,
        }

        this.items = []
        this.timer = null
    }

    bind() {
        ['onMove', 'onWheel', 'update', 'on', 'off', 'resize']
            .forEach((fn) => this[fn] = this[fn].bind(this))
    }

    setBounds() {
        const bounds = this.slides[1].getBoundingClientRect()
        const slideHeight = bounds.height

        const firstItem = this.slides[0]
        firstItem.height = firstItem.getBoundingClientRect().height / 2

        this.state.sliderHeight = this.slidesNumb * (slideHeight + 120)
        this.state.max = -(this.state.sliderHeight - window.innerHeight)

        this.slides.forEach((slide, index) => {
            slide.style.top = `${index * (slideHeight + 20) + 300}px`
        })

        this.slides.forEach(slide => {
            const el = slide

            // Create webgl plane
            const plane = new Plane()
            plane.init(el)

            // Push to cache
            this.items.push({
                el, plane
            })
        })
    }

    onMove(e) {
        if (!this.state.isDragging) return
        this.state.currentY = this.state.offY - ((e.clientY - this.state.onY) * this.opts.speed)
        this.clamp()
    }

    clamp() {
        this.state.currentY = Math.max(Math.min(this.state.currentY, this.state.min), this.state.max)
    }

    update() {
        this.state.targetY = lerp(this.state.targetY, this.state.currentY, this.opts.ease)
        this.state.targetY = Math.floor(this.state.targetY * 100) / 100

        // to add a skew effect as well, write the skew transfor here
        this.sliderInner.style.transform = `translate3d(0, ${this.state.targetY}px, 0)`

        // Maybe this needs to be reversed
        this.state.diff = (this.state.currentY - this.state.targetY) * 0.0015
        this.items.forEach(item => {
            item.plane.updateY(this.state.targetY)
            item.plane.mat.uniforms.uVelo.value = this.state.diff

        })

        this.requestAnimationFrame()
    }

    on(e) {
        this.state.isDragging = true
        this.state.onY = e.clientY
        // this.slider.classList.add('is-grabbing')
    }

    off(e) {
        // to turn off snap, comment this.snap() here
        // this.snap()
        this.state.isDragging = false
        this.state.offY = this.state.currentY
        // this.slider.classList.remove('is-grabbing')
    }

    closest() {
        const numbers = []
        this.slides.forEach((slide, index) => {
            const bounds = slide.getBoundingClientRect()
            const diff = this.state.currentY - this.state.targetY
            const center = (bounds.y + diff) + (bounds.height / 2)
            const fromCenter = this.state.centerY - center
            numbers.push(fromCenter)
        })

        let closest = number(0, numbers)
        closest = numbers[closest]

        return {
            closest
        }
    }

    snap() {
        const { closest } = this.closest()

        this.state.currentY = this.state.currentY + closest
        this.clamp()
    }

    requestAnimationFrame() {
        this.rAF = requestAnimationFrame(this.update)
    }

    cancelAnimationFrame() {
        cancelAnimationFrame(this.rAF)
    }

    onWheel(e) {
        this.state.isScrolling = true

        this.state.currentY += e.deltaY / 2
        this.state.offY = this.state.currentY
        this.state.targetY = lerp(this.state.targetY, this.state.currentY, this.opts.ease)
        this.clamp()

        // this.slider.classList.add('is-grabbing')

        if (this.timer !== null) {
            window.clearTimeout(this.timer)
        }
        this.timer = window.setTimeout(() => {
            // do something when scrolling stops
            this.state.isScrolling = false
            // this.snap()
            // this.slider.classList.remove('is-grabbing')
        }, 200)
    }

    addEventListeners() {
        this.update()

        this.slider.addEventListener('wheel', this.onWheel, false)
        this.slider.addEventListener('mousemove', this.onMove, { passive: true })
        this.slider.addEventListener('mousedown', this.on, false)
        this.slider.addEventListener('mouseup', this.off, false)

        window.addEventListener('resize', this.resize, false)
    }

    removeEventListeners() {
        this.cancelAnimationFrame(this.rAF)

        this.slider.removeEventListener('mousemove', this.onMove, { passive: true })
        this.slider.removeEventListener('mousedown', this.on, false)
        this.slider.removeEventListener('mouseup', this.off, false)
    }

    resize() {
        this.setBounds()
    }

    destroy() {
        this.removeEventListeners()

        this.opts = {}
        this.state = {}
    }

    init() {
        this.setBounds()
        this.snap()
        this.addEventListeners()
    }
}















export const backgroundCoverUv = `
vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
  float screenRatio = screenSize.x / screenSize.y;
  float imageRatio = imageSize.x / imageSize.y;

  vec2 newSize = screenRatio < imageRatio 
      ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y)
      : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);

  vec2 newOffset = (screenRatio < imageRatio 
      ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) 
      : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;

  return uv * screenSize / newSize + newOffset;
}
`

export const vertexShader = `
precision mediump float;

uniform float uVelo;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main(){
  vec3 pos = position;
  // THE LAST CONSTANT IS CHANGED FROM 0.125 TO 0.9
  pos.y = pos.y + ((sin(uv.x * M_PI) * uVelo) * 0.9);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
}
`

export const fragmentShader = `
precision mediump float;

${backgroundCoverUv}

uniform sampler2D uTexture;

uniform vec2 uMeshSize;
uniform vec2 uImageSize;

uniform float uVelo;
uniform float uScale;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  vec2 texCenter = vec2(0.5);
  vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
  vec2 texScale = (texUv - texCenter) * uScale + texCenter;
  vec4 mytexture = texture2D(uTexture, texScale);

  texScale.x += 0.15 * uVelo;
  // Uncomment this line for RGB shift effect
  //if(uv.x < 1.) mytexture.g = texture2D(uTexture, texScale).g;
  
  texScale.x += 0.10 * uVelo;
  // Uncomment this line for RGB shift effect
  //if(uv.x < 1.) mytexture.b = texture2D(uTexture, texScale).b;

  gl_FragColor = mytexture;
}
`




const canvas = document.querySelector('canvas.webgl')
const loader = new THREE.TextureLoader()
loader.crossOrigin = 'anonymous'

class Gl {
    constructor() {
        this.scene = new THREE.Scene()

        this.camera = new THREE.OrthographicCamera(
            store.ww / - 2,
            store.ww / 2,
            store.wh / 2,
            store.wh / - 2,
            1,
            10
        )
        this.camera.lookAt(this.scene.position)
        this.camera.position.z = 1

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        })
        this.renderer.setPixelRatio(1.5)
        this.renderer.setSize(store.ww, store.wh)
        this.renderer.setClearColor(0xffffff, 0)
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }
}

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
            x: (left + (width / 2)) - (store.ww / 2),
            y: (top + (height / 2)) - (store.wh / 2)
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

export class Plane extends GlObject {

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
        gl.scene.add(this)
    }
}


/***/
/*** INIT STUFF ****/
/***/

const gl = new Gl()

const tick = () => {
    gl.render()
}

gsap.ticker.add(tick)