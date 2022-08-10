import { Slider } from "./components/slider"

class App {
    constructor() {
        this.init()
    }

    init() {
        const slider = new Slider()
        slider.init()
    }
}
new App()