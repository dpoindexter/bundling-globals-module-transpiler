import identity from './type';
import col from './collection';

export function toPascalCase () {
    var args = col.toArray(arguments),
        acc = '';

    col.forEach(args, function (str) {
        if (!identity.isString(str)) return;
        var letters = str.split('');
        letters[0] = letters[0].toUpperCase();
        acc += letters.join('');
    });

    return acc;
}

export default { toPascalCase: toPascalCase };