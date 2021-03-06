/*
 * File: bootstrap.js
 * Description: a simple loader to test module federation in a vanilla app. For more info, see the read me.
 * Author: Natalia Venditto @anfibiacreativa
 * -----
 */


// this should come from an API, right!?
import { mfes } from './microfrontends.js';
// this should be probably a configurable global variable, but keep in mind this may be different from script to script, since file name is effectively configurable!!!
const REMOTES_FILENAME = 'remoteEntry';
const loadScope = () => {
  // iterate over mfe's and get config options
  mfes.forEach((mfe) =>{
    let currentScope = mfe.scope;
    let publicName = mfe.el;
    let chunk = mfe.chunk;

    let globalScope = self[currentScope];
    let isScopeLoaded = typeof(globalScope) !== 'undefined';
  
    if (isScopeLoaded) {
      if (Object.keys(globalScope).length) {
        globalScope.get(publicName, self[currentScope])
          .then(console.log(`Micro Frontend ${currentScope} was Loaded Dynamically!`))
          .then(() => run())
      } else {
        setTimeout(loadScope, 1000);
      }
    }
    
    const run = () => {
      // federated webpack chunks always include an array with 2 items
      // the first item is the file requested (bundle)
      // the second item is the function to be executed
      const exec = window[chunk][0][1];
      const fn = Object.keys(exec);
      // executes the function, whatever its name, which corresponds to the index assigned by webpack on compilation
      exec[fn].call(self);
    }

  })
}
const arr = [];
const remotes = [];

const getRemotes = document.addEventListener(
  'DOMContentLoaded', (e) => {
    const scripts = Array.from(document.getElementsByTagName('script'));

    scripts.filter(script => { if (script.outerHTML.includes(REMOTES_FILENAME)) { remotes.push(script) } });
    console.log(remotes, 'scripts ready');

    remotes.forEach(remote => {
      arr.push(addToPromise(remote));
    });
    complete();
  }
)

const addToPromise = (remote) => {
  return new Promise((resolve, reject) =>{
    remote.onload = () => { resolve() };
    remote.onerror = () => { reject() };
  })
} 

const complete = () => {
  Promise.all(
    arr
  ).then(
    loadScope()
  )
}
