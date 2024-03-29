const CompileError = require('./compileerror')
const {getWrapper} = require('../VisionSolc')
const fs = require('fs')
const path = require('path')

// Clean up after solc.
const listeners = process.listeners('uncaughtException')
const solc_listener = listeners[listeners.length - 1]

if (solc_listener) {
  process.removeListener('uncaughtException', solc_listener)
}

// Warning issued by a pre-release compiler version, ignored by this component.
const preReleaseCompilerWarning = require('./messages').preReleaseCompilerWarning

const installedContractsDir = 'installed_contracts'

module.exports = {
  parse: function (body, fileName, options) {
    // Here, we want a valid AST even if imports don't exist. The way to
    // get around that is to tell the compiler, as they happen, that we
    // have source for them (an empty file).

    const build_remappings = function () {
      // Maps import paths to paths from EthPM installed contracts, so we can correctly solve imports
      // e.g. "my_pkg/=installed_contracts/my_pkg/contracts/"
      const remappings = []

      if (fs.existsSync('ethpm.json')) {
        const ethpm = JSON.parse(fs.readFileSync('ethpm.json'))
        for (const pkg in ethpm.dependencies) {
          remappings.push(pkg + '/=' + path.join(installedContractsDir, pkg, 'contracts', '/'))
        }
      }

      return remappings
    }

    fileName = fileName || 'ParsedContract.sol'

    const remappings = build_remappings()

    const solcStandardInput = {
      language: 'Solidity',
      sources: {
        [fileName]: {
          content: body
        }
      },
      settings: {
        remappings: remappings,
        outputSelection: {
          '*': {
            '': [
              'ast'
            ]
          }
        }
      }
    }

    const solc = getWrapper(options)
    let output = solc[solc.compileStandard ? 'compileStandard' : 'compile'](JSON.stringify(solcStandardInput), function (file_path) {
      // Resolve dependency manually.
      let contents
      if (fs.existsSync(file_path)) {
        contents = fs.readFileSync(file_path, {encoding: 'UTF-8'})
      } else {
        contents = 'pragma solidity ^0.4.0;'
      }
      return {contents: contents}
    })

    output = JSON.parse(output)

    // Filter out the "pre-release compiler" warning, if present.
    let errors = output.errors ? output.errors.filter(function (solidity_error) {
      return solidity_error.message.indexOf(preReleaseCompilerWarning) < 0
    }) : []

    // Filter out warnings.
    // var warnings = output.errors ? output.errors.filter(function (solidity_error) {
    //   return solidity_error.severity == 'warning'
    // }) : []
    errors = output.errors ? output.errors.filter(function (solidity_error) {
      return solidity_error.severity !== 'warning'
    }) : []

    if (errors.length > 0) {
      throw new CompileError(errors[0].formattedMessage)
    }

    return {
      contracts: Object.keys(output.contracts[fileName]),
      ast: output.sources[fileName].ast
    }
  },

  // This needs to be fast! It is fast (as of this writing). Keep it fast!
  parseImports: function (body, options) {

    // WARNING: Kind of a hack (an expedient one).

    // So we don't have to maintain a separate parser, we'll get all the imports
    // in a file by sending the file to solc and evaluating the error messages
    // to see what import statements couldn't be resolved. To prevent full-on
    // compilation when a file has no import statements, we inject an import
    // statement right on the end; just to ensure it will error and we can parse
    // the imports speedily without doing extra work.

    // Helper to detect import errors with an easy regex.
    const importErrorKey = 'TRUFFLE_IMPORT'

    // Inject failing import.
    const failingImportFileName = '__Truffle__NotFound.sol'

    // body = body + "\n\nimport '" + failingImportFileName + "';\n"

    const solcStandardInput = {
      language: 'Solidity',
      sources: {
        'ParsedContract.sol': {
          content: body
        }
      },
      settings: {
        outputSelection: {
          'ParsedContract.sol': {
            '*': [] // We don't need any output.
          }
        }
      }
    }

    const solc = getWrapper(options)
    let output = solc[solc.compileStandard ? 'compileStandard' : 'compile'](JSON.stringify(solcStandardInput))

    output = JSON.parse(output)
    if (!output.errors) {
      return []
    }
     // Filter out the "pre-release compiler" warning, if present.
    const errors = output.errors.filter(
      ({ message }) => !message.includes(preReleaseCompilerWarning)
    );
    // console.log("errors: %O", output.errors);

    // Filter out our forced import, then get the import paths of the rest.
    const imports = errors
      .map(({ formattedMessage, message }) => {
        // Multiline import check which works for solcjs and solc
        // solcjs: ^ (Relevant source part starts here and spans across multiple lines)
        // solc: Spanning multiple lines.
        if (formattedMessage.includes("multiple lines")) {
          // Parse the import filename from the error message, this does not include the full path to the import
          const matches = message.match(/Source[^'"]?.*?("|')([^'"]+)("|')/);
          if (matches) {
            // Extract the full path by matching against body with the import filename
            const fullPathRegex = new RegExp(`("|')(.*${matches[2]})("|')`);
            const importMatches = body.match(fullPathRegex);
            if (importMatches) return importMatches[2];
          }
        } else {
          const matches = formattedMessage.match(
            /import[^'"]?.*("|')([^'"]+)("|')/
          );

          // Return the item between the quotes.
          if (matches) return matches[2];
        }
      })
      .filter(match => match !== undefined && match !== failingImportFileName);
    return imports;
    // Filter out the "pre-release compiler" warning, if present.
    // const errors = output.errors.filter(function (solidity_error) {
    //   return solidity_error.message.indexOf(preReleaseCompilerWarning) < 0
    // })
    // const nonImportErrors = errors.filter(function (solidity_error) {
    //   // If the import error key is not found, we must not have an import error.
    //   // This means we have a *different* parsing error which we should show to the user.
    //   // Note: solc can return multiple parsing errors at once.
    //   // We ignore the "pre-release compiler" warning message.
    //   return solidity_error.formattedMessage.indexOf(importErrorKey) < 0
    // })

    // // Should we try to throw more than one? (aside; we didn't before)
    // if (nonImportErrors.length > 0) {
    //   throw new CompileError(nonImportErrors[0].formattedMessage)
    // }

    // // Now, all errors must be import errors.
    // // Filter out our forced import, then get the import paths of the rest.
    // const imports = errors.filter(function (solidity_error) {
    //   return solidity_error.message.indexOf(failingImportFileName) < 0
    // }).map(function (solidity_error) {
    //   const matches = solidity_error.formattedMessage.match(/import[^'"]+("|')([^'"]+)("|');/)

    //   // Return the item between the quotes.
    //   return matches[2]
    // })

    // return imports
  }
}
