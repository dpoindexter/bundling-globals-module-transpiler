var recast = require('recast'),
    b = recast.types.builders;

function IIFE(params, bodyStatements, iifeArgs) {
    var paramList = params || [],
        bodyStatementList = bodyStatements || [],
        argumentList = iifeArgs || [];

    return b.callExpression(
        b.memberExpression(
            b.functionExpression(
                null,
                paramList,
                b.blockStatement(bodyStatementList),
                false,
                false
            ),
            b.identifier('call'),
            false
        ),
        argumentList
    );
}

exports.IIFE = IIFE;