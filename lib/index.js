'use strict';

var Ware = require('ware')
var match = require('multimatch')
var has = hasOwnProperty
var debug = require('debug')('metalsmith-branch')

/**
 * Metalsmith plugin to run separate middleware pipelines on selected files.
 *
 * @param {String or Object or Function} filter
 * @return {Function}
 *
 * Example:
 *
 *   metalsmith(__dirname)
 *     .use( branch()
 *             .pattern('*.md')      // for only md source files,
 *             .use( markdown() )    // generate html
 *         )
 *     .use( branch('images/*')        // you can specify pattern or filter in constructor
 *             .use( imageVariants() )
 *         )
 *     .build()
 *
 * Nested branches are possible too:
 *
 *   metalsmith(__dirname)
 *     .use( branch('*.md')
 *             .use( markdown() )
 *             .use( branch('special/*.html')  // post-process markdown files in 'special' dir
 *                     .use( postProcess() )
 *                 )
 *         )
 *     .build()
 *
 */
module.exports = function plugin(matcher){
    
  var files, root;
  var filter = function(){ return true; };
  var ware = new Ware();

  branch.use = function(fn){
    ware.use(wrap(fn));
    return this;
  }

  branch.filter = function(fn){
    filter = fn;
    return this;
  }
  
  branch.pattern = function(pattern){
    debug('pattern: ' + pattern);
    return this.filter( function(file){
      return !!match(file,pattern)[0];
    });
  }

  /**
   * Function called by root (metalsmith) pipeline
   *
   */
  function branch(f,metalsmith,done){
    files = f; root = metalsmith;
    if (matcher == undefined){
    } else if (typeof matcher == "function"){
      branch.filter(matcher);
    } else {
      branch.pattern(matcher);
    }
    run(done);
  }

  /**
   * Run filtered set of files through branch pipeline
   * and mutate root (metalsmith) files afterwards.
   *
   * Note also that root is injected.
   * That way, you can mutate the metadata directly in middleware
   *
   * Note also `done` callback is passed in from root.
   *
   */
  function run(fn){
    ware.run(files,root,fn);
  }

  // doesn't work for nested branches, 
  // because the root files mutation happens last-branch-first 
  function wrap(fn){
    return function(files,metalsmith,done){
      mutateObject(files, filter, function(selected){
        return fn(selected,metalsmith,done);
      });
    }
  }


  return branch;

}


// utils


function mutateObject( obj, filt, fn){
  
  // filter
  var selected = {}, keys = []
  Object.keys(obj).forEach( function(k,i){
    if (filt(k,obj[k],i)){
      selected[k] = obj[k];
      keys.push(k);    
    }
  });

  debug("selected files: " + Object.keys(selected).join(", "));

  // run
  fn(selected);  
  
  // add new and replace modified
  Object.keys(selected).forEach( function(k){
    obj[k] = selected[k];
  });
  
  // delete deleted
  keys.forEach( function(k){
    if (!(has.call(selected,k))){
      delete obj[k];
    }
  });

  debug("files after branch processed: " + Object.keys(obj).join(", "));
}

