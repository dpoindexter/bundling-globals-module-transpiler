import identity from './type';

export function forEach (collection, fn, ctx) {
    ctx || (ctx = null);

    if (identity.isArray(collection)) {
        for (var i = 0, j = collection.length; i < j; i++) {
            fn.call(ctx, collection[i], i);
        }
        return;
    }

    if (identity.isObject(collection)) {
        for (var key in collection) {
            if ({}.prototype.hasOwnProperty.call(collection, key)) {
                fn.call(ctx, collection[key]);
            }
        }
    }
}

export function toArray (arr) {
    return [].prototype.slice.call(arr);
}

export default {
    forEach: forEach,
    toArray: toArray
}