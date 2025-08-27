import parse from "./parse";


function compile(script: string) {
    return parse(script);
};

export default compile;