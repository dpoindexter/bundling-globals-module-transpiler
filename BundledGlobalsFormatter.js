var recast = require('recast'),
    types = recast.types,
    n = types.namedTypes,
    b = types.builders,
    Replacement = require('./lib/replacement'),
    util = require('./lib/util'),
    sort = require('es6-module-transpiler/lib/sorting').sort,
    BundleFormatter = require('es6-module-transpiler/lib/formatters/bundle_formatter');

var entryModules;

/**
 * Inlines relative includes, references absolute includes as global
 * variables, and constructs an IIFE which adds the current
 * module to the global scope
 *
 * @constructor
 */
 function BundledGlobalsFormatter() {
    BundleFormatter.call(this);
 }

 BundledGlobalsFormatter['__proto__'] = BundleFormatter;
 BundledGlobalsFormatter.prototype = Object.create(BundleFormatter.prototype);

 /**
  * This hook is called by the container before it converts its modules. We use
  * it to ensure all of the imports are included because we need to know about
  * them at compile time.
  *
  * @param {Container} container
 //  */
 BundledGlobalsFormatter.prototype.beforeConvert = function(container) {
    entryModules = container.getModules();
    BundleFormatter.prototype.beforeConvert.call(this, container);
 };

/**
 * Convert a list of ordered modules into a list of files.
 *
 * @param {Module[]} modules Modules in execution order.
 * @return {File[]}
 */
BundledGlobalsFormatter.prototype.build = function(modules) {
    sort(modules);
    var moduleBodyList = modules.reduce(function(statements, module) {
        var nonNull = module.ast.program.body.filter(function (node) { return !!node; });
        return statements.concat(nonNull);
    }, []);

    moduleBodyList.unshift(
        b.expressionStatement(b.literal('use strict'))
    );

    var moduleParamList = [b.identifier('foo'), b.identifier('bar')];

    var moduleArgumentList = [b.thisExpression(), b.identifier('foo'), b.identifier('bar')];

    return [b.file(
        b.program([
            b.expressionStatement(util.IIFE(
                moduleParamList,
                moduleBodyList,
                moduleArgumentList
            ))
        ])
    )];
};

/**
 * Replaces default export declarations with something else. Subclasses will
 * generally return a statement that takes the declaration value and stashes
 * it somewhere appropriate for the transpiled format, e.g. creates a local
 * variable, assigns the value to something, or calls a function with it.
 *
 * Given an export statement like so:
 *
 *   ```js
 *   export default foo(bar);
 *   ```
 *
 * This method will be called with the module containing the statement and
 * the AST node corresponding to `foo(bar)`.
 *
 * @param {Module} mod
 * @param {Expression} declaration
 * @return {Statement}
 */
BundledGlobalsFormatter.prototype.defaultExport = function(mod, declaration) {
    if (n.FunctionDeclaration.check(declaration) ||
        n.ClassDeclaration.check(declaration)) {
        // export default function foo () {}
        // -> becomes:
        // function <moduleName>foo () {}
        // var <moduleName>default = <moduleName>foo;
        var renamedDeclaration = Object.create(declaration);
        renamedDeclaration.id = this.reference(mod, declaration.id);
        return [
            renamedDeclaration,
            b.variableDeclaration(
                'var',
                [b.variableDeclarator(
                    this.reference(mod, 'default'),
                    this.reference(mod, declaration.id)
                )]
            )
        ];
    }

    var asVariable = b.variableDeclaration(
        'var',
        [b.variableDeclarator(
            this.reference(mod, 'default'),
            declaration
        )]
    );

    var assignment = b.assignmentExpression(
        '=',
        b.memberExpression(
            b.thisExpression(),
            b.identifier(mod.id),
            false
        ),
        declaration
    );

    return (entryModules.indexOf(mod) > -1) ? b.expressionStatement(b.sequenceExpression([assignment])) : asVariable;
};

module.exports = BundledGlobalsFormatter;
