export const DEFAULT_HANDLER = (args) => args;

export const compose = (middlewares) => {
    if (middlewares.length === 0) {
        return (arg) => arg;
    }

    if (middlewares.length === 1) {
        const [{ handler, params }] = middlewares;
        return (...args) => handler(params, ...args);
    }

    return middlewares.reduce((a, { handler, params }) => (...args) => a(handler(params, ...args)));
};
