export function isNumeric(str: string) {
    if (typeof str !== "string") return false // we only process strings!  
    return !isNaN(+str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export function getRandomCode(lenght: number = 6) {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, lenght);
}

export function getRandomNumberBetweenRange(max: number, min: number = 0) {
    const delta = max - min;
    return Math.round(min + Math.random() * delta);
}

export function GetPercentage(max: number, min: number, value: number) {
    if (value < min)
        value = min;
    if (value > max)
        value = max;
    const range = max - min;
    const valueRanged = value - min;
    const perc = (valueRanged / range) * 100;
    return perc;
}

export function shuffle<T>(array: T[]) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

// export const GenerateNRandomNumbersBetween = (N: number, max: number, min: number = 0) => {
//     const orderNumbers = new Set<number>();
//     while (orderNumbers.size !== N) {
//         const random = getRandomNumberBetweenRange(max, min);
//         orderNumbers.add(random);
//     }
//     return orderNumbers;
// }

export function getNByAverage<T>(allValues: T[], N: number, getterToSum: (val: T) => number, objPercentage: number, allowedPerc = 5, howManyPasses = 1000) {
}

export const getSum = <T>(array: T[], getter: (val: T) => number) => {
    return array.reduce((partialSum, a) => partialSum + getter(a), 0);
}

export function NotAlreadyPresent<T, K>(toSearch: T[], toSearchAgainst: T[][], getter: (val: T) => K) {
    return toSearch.every(p => toSearchAgainst.flat().findIndex(alreadyP => getter(alreadyP) === getter(p)) === -1)
}

// export function getMin<V>(arr: Array<V>, elementGetter: (input: V) => number) {
//     if (arr && arr.length > 0) {
//         let min = elementGetter(arr[0]);
//         let minIndex = 0;
//         for (let i = 1, len = arr.length; i < len; i++) {
//             let v = elementGetter(arr[i]);
//             if (v < min) {
//                 min = v;
//                 minIndex = i;
//             }
//         }
//         const val = arr[minIndex];
//         return { val, min };
//     }
// }

export function permute<T>(array: T[], k: number) {
    try {
        var result = [];
        // initialize permutations
        var perm = [];
        for (var i = 0; i < array.length; i++) {
            if (i < k) {
                perm[i] = 1;
            } else {
                perm[i] = 0;
            }
        }
        perm.sort();

        whileloop:
        while (true && result.length <= 500000) {
            // save subresult
            var subresult = [];
            for (var i = 0; i < array.length; i++) {
                if (perm[i] == 1) {
                    subresult.push(array[i]);
                }
            }
            result.push(subresult);

            // get next permutation
            for (var i = array.length - 1; i > 0; i--) {
                if (perm[i - 1] == 1) {
                    continue;
                }
                if (perm[i] == 1) {
                    perm[i - 1] = 1;
                    perm[i] = 0;
                    perm = perm.slice(0, i).concat(perm.slice(i).sort())
                    continue whileloop;
                }
            }

            // no additional permutations exist
            break whileloop;
        }
        if (result.length >= 100000) {
            console.log(result.length);
        }
        return result;
    } catch (error) {
        console.error(error);
    }

}
