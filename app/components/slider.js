import { _getClosest } from "../utils/math"
import { number } from "../utils/math"
import { lerp } from "../utils/math"

export default class Slider {
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

            sliderWidth: 0,

            onX: 0,
            offX: 0,

            currentX: 0,
            targetX: 0,

            min: 0,
            max: 0,

            centerX: window.innerWidth / 2,
        }
    }

    bind() {
        ['onMove', 'update', 'on', 'off', 'resize']
            .forEach((fn) => this[fn] = this[fn].bind(this))
    }

    setBounds() {
        const bounds = this.slides[0].getBoundingClientRect()
        const slideWidth = bounds.width

        this.state.sliderWidth = this.slidesNumb * slideWidth
        this.state.max = -(this.state.sliderWidth - window.innerWidth)

        this.slides.forEach((slide, index) => {
            slide.style.left = `${index * slideWidth}px`
        })
    }

    onMove(e) {
        if (!this.state.isDragging) return
        this.state.currentX = this.state.offX + ((e.clientX - this.state.onX) * this.opts.speed)
        this.clamp()
    }

    clamp() {
        this.state.currentX = Math.max(Math.min(this.state.currentX, this.state.min), this.state.max)
    }

    update() {
        this.state.targetX = lerp(this.state.targetX, this.state.currentX, this.opts.ease)
        this.state.targetX = Math.floor(this.state.targetX * 100) / 100

        // to add a skew effect as well, write the skew transfor here
        this.sliderInner.style.transform = `translate3d(${this.state.targetX}px, 0, 0)`

        this.requestAnimationFrame()
    }

    on(e) {
        this.state.isDragging = true
        this.state.onX = e.clientX
        this.slider.classList.add('is-grabbing')
    }

    off(e) {
        // to turn off snap, comment this.snap() here
        this.snap()
        this.state.isDragging = false
        this.state.offX = this.state.currentX
        this.slider.classList.remove('is-grabbing')
    }

    closest() {
        const numbers = []
        this.slides.forEach((slide, index) => {
            const bounds = slide.getBoundingClientRect()
            const diff = this.state.currentX - this.state.targetX
            const center = (bounds.x + diff) + (bounds.width / 2)
            const fromCenter = this.state.centerX - center
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

        this.state.currentX = this.state.currentX + closest
        this.clamp()
    }

    requestAnimationFrame() {
        this.rAF = requestAnimationFrame(this.update)
    }

    cancelAnimationFrame() {
        cancelAnimationFrame(this.rAF)
    }

    addEventListeners() {
        this.update()

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
        this.addEventListeners()
    }
}