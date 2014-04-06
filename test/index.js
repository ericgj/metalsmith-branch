var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var branch = require('..');

describe('metalsmith-branch', function(){

  function assertDirEqual(fix,done){
    return function(err){
      if (err) return done(err);
      equal('test/fixtures/' + fix + '/expected', 'test/fixtures/' + fix + '/build');
      done();
    };
  }

  it('should process files selected by pattern, according to branch', function(done){
    Metalsmith('test/fixtures/basic')
      .use( branch()
              .pattern('*.md')
              .use( markdown() )
          )
      .build( assertDirEqual('basic',done) )
  });


  it('should process files selected by pattern passed into constructor, according to branch', function(done){
    Metalsmith('test/fixtures/basic')
      .use( branch('*.md')
              .use( markdown() )
          )
      .build( assertDirEqual('basic',done) )
  });


  // TODO
  
  it('should process selected files through three plugins in a branch')
  
  it('should process files according to two branches, branch selections do not intersect')

  it('should process files according to two branches, branch selections intersect')

  it('should process files according to nested branches, branch selections do not intersect')

  it('should process files according to nested branches, branch selections intersect')

});


