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

function IIFEe() {
  if (!IIFE.AST) {
    IIFE.AST = JSON.stringify(
      recast.parse('(function(){}).call(this)')
    );
  }

  var result = JSON.parse(IIFE.AST);
  var expression = result.program.body[0].expression;
  var body = expression.callee.object.body.body;

  var args = Array.prototype.slice.call(arguments);
  args.forEach(function(arg) {
    if (Object.prototype.toString.call(arg) === '[object Array]') {
      body.push.apply(body, arg);
    } else {
      body.push(arg);
    }
  });

  return expression;
}

exports.IIFE = IIFE;