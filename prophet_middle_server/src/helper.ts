import fs, { PathOrFileDescriptor } from "fs"

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

function lowerCase(s: string) {
    return s?.toLowerCase();
}

const getEnvString = (key: string) => {
    if (!process.env[key]) throw new Error(`${key} must be provided`);
    return process.env[key] as string;
};

const getBooleanFromEnv = (key: string) => {
    const envString = getEnvString(key);
    if (!["true", "false"].includes(envString.toLowerCase()))
        throw new Error(`${key} must be true|false|TRUE|FALSE`);
    return JSON.parse(process.env[key] as string) as boolean;
};

const getIntFromEnv = (
    key: string,
    options?: { greater_than?: number; less_than?: number },
) => {
    const envString = getEnvString(key);
    const envNumber = parseInt(envString);
    if (options) {
        if (options.greater_than) {
            if (envNumber <= options.greater_than)
                throw new Error(
                    `${key} must be int number and greater than ${options.greater_than}`,
                );
        }
        if (options.less_than) {
            if (envNumber >= options.less_than)
                throw new Error(
                    `${key} must be int number and less than ${options.greater_than}`,
                );
        }
    }
    return parseInt(envString);
};

const logWithPrefix = (prefix: string, msg: string) => console.log(prefix + " " + msg)
const getFileName = (path: string) => `[${path.split("/").pop()}]`

export {
    randomNumber,
    randomItem,
    avg,
    toNumber,
    sleep,
    lowerCase,
    getEnvString,
    getBooleanFromEnv,
    getIntFromEnv,
    logWithPrefix,
    getFileName
}