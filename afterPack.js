const path = require('path');
const fs = require('fs-extra');

exports.default = async function(context) {
  // win-unpacked folder
  const unpackedDir = context.appOutDir;
  
  // The path to the electron resources folder where next-standalone is located
  const resourcesDir = path.join(unpackedDir, 'resources');
  const standaloneDir = path.join(resourcesDir, 'next-standalone');
  
  // The local next-standalone/node_modules folder that has everything we need
  const sourceNodeModules = path.join(__dirname, 'next-standalone', 'node_modules');
  const targetNodeModules = path.join(standaloneDir, 'node_modules');

  console.log('Injecting node_modules into the unpacked resources to bypass pruning...');

  if (fs.existsSync(sourceNodeModules)) {
    // Copy the entire node_modules from our local next-standalone to the unpacked one
    fs.copySync(sourceNodeModules, targetNodeModules, { overwrite: true });
    console.log('Successfully injected node_modules.');
  } else {
    console.error('Source node_modules not found:', sourceNodeModules);
  }
};
