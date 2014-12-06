var recast = require('recast'),
    types = recast.types,
    n = types.namedTypes,
    b = types.builders,
    Replacement = require('./lib/replacement'),
    util = require('./lib/util');

/**
 * Inlines relative includes, references absolute includes as global
 * variables, and constructs an IIFE which adds the current
 * module to the global scope
 *
 * @constructor
 */
 function BundledGlobalsFormatter() {}

 /**
  * This hook is called by the container before it converts its modules. We use
  * it to ensure all of the imports are included because we need to know about
  * them at compile time.
  *
  * @param {Container} container
 //  */
 BundledGlobalsFormatter.prototype.beforeConvert = function(container) {
    container.findImportedModules();

    // Cache all the import and export specifier names.
    container.getModules().forEach(function(mod) {
        [mod.imports, mod.exports].forEach(function(bindingList) {
            bindingList.declarations.forEach(function (declaration) {
                declaration.specifiers.forEach(function (specifier) {
                    specifier.name;
                });
            });
        });
    });
 };

/**
 * Convert a list of ordered modules into a list of files.
 *
 * @param {Module[]} modules Modules in execution order.
 * @return {File[]}
 */
BundledGlobalsFormatter.prototype.build = function(modules) {

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
    return null;
};

/**
 * Resolves references to exported bindings. In the example below, if we refer
 * to `value` elsewhere in the module then that reference may need to be
 * rewritten. This method allows us to configure what it is rewritten to.
 *
 *   ```js
 *   // a.js
 *   export var value = 1;
 *   ```
 *
 * Subclasses should return null if the original reference should be left
 * intact.
 *
 * @param {Module} mod
 * @param {NodePath} referencePath
 * @return {?Expression}
 */
BundledGlobalsFormatter.prototype.exportedReference = function(mod, referencePath) {
    return null;
};

/**
 * Gets a reference to an imported binding. In this example, we will be called
 * with the NodePath for `value` in `console.log(value)`:
 *
 *   ```js
 *   // b.js
 *   import { value } from './a';
 *   console.log(value);
 *   ```
 *
 * If the given reference does not refer to an imported binding then no
 * rewriting is required and `null` should be returned.
 *
 * @param {Module} mod
 * @param {NodePath} referencePath
 * @return {?Expression}
 */
BundledGlobalsFormatter.prototype.importedReference = function(mod, referencePath) {
    return null;
};

/**
 * Determines what the given reference should be rewritten to, if anything.
 * Subclasses should override this only if they wish to rename bindings not
 * associated with imports and exports.
 *
 * This is used by the bundle formatter, for example, to ensure that bindings
 * at module scope are rewritten with unique names to prevent collisions with
 * bindings from other modules.
 *
 * @param {Module} mod
 * @param {NodePath} referencePath
 * @return {?Node}
 */
BundledGlobalsFormatter.prototype.localReference = function(mod, referencePath) {
    return null;
};

/**
 * Process a function declaration found at the top level of the module.
 *
 * @param {Module} mod
 * @param {NodePath} nodePath
 * @return {?Node[]}
 */
BundledGlobalsFormatter.prototype.processFunctionDeclaration = function(mod, nodePath) {
    return null;
};

/**
 * Process a class declaration found at the top level of the module.
 *
 * @param {Module} mod
 * @param {NodePath} nodePath
 * @return {?Node[]}
 */
BundledGlobalsFormatter.prototype.processClassDeclaration = function(mod, nodePath) {
    return null;
};

/**
 * Process a variable declaration found at the top level of the module.
 *
 * @param {Module} mod
 * @param {NodePath} nodePath
 * @return {?Node[]}
 */
BundledGlobalsFormatter.prototype.processVariableDeclaration = function(mod, nodePath) {
    return null;
};

/**
 * Replaces non-default exports. These exports are of one of the following
 * forms:
 *
 *   ```js
 *   export var a = 1;
 *   export function a() {}
 *   export class a {}
 *   export { a };
 *   ```
 *
 * @param {Module} mod
 * @param {NodePath} nodePath
 * @return {?Replacement}
 */
BundledGlobalsFormatter.prototype.processExportDeclaration = function(mod, nodePath) {
    return null;
};

/**
 * Process and optionally replace an update to an exported binding. This can
 * either be an assignment expression or an update expression, i.e.
 *
 *   ```js
 *   export var foo = 1;
 *   foo = 2;
 *   foo++;
 *   ```
 *
 * @param {Module} mod
 * @param {NodePath} nodePath
 * @return {?Replacement}
 */
BundledGlobalsFormatter.prototype.processExportReassignment = function(mod, nodePath) {
    return null;
};

/**
 * Optionally replace an import declaration. Subclasses should almost always
 * replace import declarations. It may be replaced with a dependency lookup, or
 * perhaps with nothing.
 *
 * @param {Module} mod
 * @param {NodePath} nodePath
 * @return {?Replacement}
 */
BundledGlobalsFormatter.prototype.processImportDeclaration = function(mod, nodePath) {
    return null;
};

BundledGlobalsFormatter.prototype.reference = function() {
    return b.memberExpression(
        b.identifier(mod.id),
        n.Identifier.check(identifier) ? identifier : b.identifier(identifier),
        false
    );
};

module.exports = BundledGlobalsFormatter;
