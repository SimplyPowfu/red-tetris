function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}


export class Randomizer {
    constructor(seed) {
        this.rng = mulberry32(seed);
        this.pieces = ['I','J','L','O','S','T','Z'];
        this.bag = [];
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.rng() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    next() {
        if (this.bag.length === 0) {
            this.bag = [...this.pieces];
            this.shuffle(this.bag);
        }
        return this.bag.pop();
    }
}