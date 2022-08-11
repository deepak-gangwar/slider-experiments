import * as THREE from "three"
import gsap from "gsap"

const canvas = document.querySelector('canvas.webgl')

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

class Experience {
    constructor() {
        this.scene = new THREE.Scene()

        this.camera = new THREE.OrthographicCamera(
            sizes.width / - 2,
            sizes.width / 2,
            sizes.height / 2,
            sizes.height / - 2,
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
        this.renderer.setSize(sizes.width, sizes.height)
        this.renderer.setClearColor(0xffffff, 0)
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }
}

/***/
/*** INIT STUFF ****/
/***/

export const experience = new Experience()

const tick = () => {
    experience.render()
}

gsap.ticker.add(tick)