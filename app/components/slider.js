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

            sliderHeight: 0,

            onY: 0,
            offY: 0,

            currentY: 0,
            targetY: 0,

            min: 0,
            max: 0,

            centerY: window.innerHeight / 2,
        }
    }

    bind() {
        ['onMove', 'update', 'on', 'off', 'resize']
            .forEach((fn) => this[fn] = this[fn].bind(this))
    }

    setBounds() {
        const bounds = this.slides[0].getBoundingClientRect()
        const slideHeight = bounds.height

        this.state.sliderHeight = this.slidesNumb * slideHeight
        this.state.max = -(this.state.sliderHeight - window.innerHeight)

        this.slides.forEach((slide, index) => {
            slide.style.top = `${index * slideHeight}px`
        })
    }

    onMove(e) {
        if (!this.state.isDragging) return
        this.state.currentY = this.state.offY + ((e.clientY - this.state.onY) * this.opts.speed)
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

        this.requestAnimationFrame()
    }

    on(e) {
        this.state.isDragging = true
        this.state.onY = e.clientY
        this.slider.classList.add('is-grabbing')
    }

    off(e) {
        // to turn off snap, comment this.snap() here
        // this.snap()
        this.state.isDragging = false
        this.state.offY = this.state.currentY
        this.slider.classList.remove('is-grabbing')
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