function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}


export function Randomizer(seed) {
    const rng = mulberry32(seed);
    const pieces = ['I','J','L','O','S','T','Z'];
    let bag = [];

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function next() {
        if (bag.length === 0) {
            bag = [...pieces];
            shuffle(bag);
        }
        return bag.pop();
    }

    return {
        next
    };
}
