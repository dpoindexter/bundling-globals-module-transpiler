function toType (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function isArray (val) {
    return toType(val) === 'array';
}

function isString (val) {
    return toType(val) === 'string';
}

function isNumber (val) {
    return toType(val) === 'number';
}

function isObject (val) {
    return toType(val) === 'object';
}

export default {
    toType: toType,
    isArray: isArray,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject
};

