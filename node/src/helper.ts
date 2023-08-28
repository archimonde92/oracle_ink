const randomNumber = (from: number, to: number, step: number) => from + Math.round((to - from) / step * Math.random()) * step


const randomItem = <T>(array: T[]) => {
    const index = randomNumber(0, array.length - 1, 1)
    return array[index] as T
}

const avg = (arr: number[]) => {
    return (arr.reduce((acc, el) => el + acc, 0)) / arr.length
}

const toNumber = (str: string) => Number(str.split(",").join(""))

/**
 * Returns a Promise that resolves after the specified number of milliseconds have passed.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A Promise that resolves after the specified number of milliseconds have passed.
 */
const sleep = async (ms: number): Promise<void> => {
    // Create a new Promise that resolves after the specified number of milliseconds
    await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms);
    });
};

export {
    randomNumber,
    randomItem,
    avg,
    toNumber,
    sleep
}