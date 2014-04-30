## Sketch

- npm
- patterns
- browserify
- answer questions and write some code

### npm

- terrible name
- manage **anything** as a package, not just js for node
- not to be confused with http://npm.org

### the registry

- versioned metadata + source
- just tarballs with some stuff

### `npm -h`

- command-line tool
- lots of good stuff for consumers and producers

### `npm init` → `package.json`

- metadata that gets stored in the registry
- basics: name, version, description, author
- special: dependencies, bin, scripts

### `man npm`

- `npm home express` → look up the express package, open browser
- `npm ls` → what are all the packages i currently have installed
- `npm install --save-dev mocha` → install mocha, add it to `devDependecies`
- `alias yay="npm test && npm version patch && npm publish && git push origin master --tags"`

### patterns

1. `require('thing')`
1. `module.exports = function(){};`
1. `function(err, res)`

### `require('thing')`

- [require](http://nodejs.org/docs/latest/api/modules.html#modules_module_require_id) is the best thing since penicilin
- synchronous
- `require('thing')` → stdlib?  `./node_modules/`?
- `require('./thing')` → `./thing.js`? `./thing/index.js`?

### `module.exports`

- [magic](http://nodejs.org/docs/latest/api/modules.html#modules_module_exports)
- `require` runs your file in a sandbox, `module`
- aka dont need to wrap everything in a `function(process){...}(process);`
- define the "public" api

### `module.exports = function(){};`

- if this module could do one thing what would it be?
- "how do i use this thing?"
- `console.log(require('thing').toString())`

### `function(err, res)`

- always be async'ing.
- in your face if something fails

### `module.exports = function(opts, fn)`

```
var fs = require('fs');
// doublin` - read a README with double vision
module.exports = function(opts, fn){
  fs.readFile(opts.path || './README.md', function(err, buf){
    if(err) return fn(err);
    fn(null, Buffer.concat([buf, buf]);
  });
};
```

### "flow-control"



### setup

1. `npm install -g jsontool`
1. `npm install --save-dev mocha`
1. `echo '{"scripts": {"test": "mocha"}}' >> package.json | json -I -f package.json --deep-merge`

### setup 2

1. `npm install -g imlucas/guzzle && guz`
1. `guz ui graphs && npm install --save d3 && echo "console.log('hiya', require('d3'));" > index.js && echo '<html><body><h1>word</h1><script src="index.js"></script></body></html>' > index.html && npm start`

### process

Don't listen to anybody, just do your thing.

### my process

```
# mongodb-security

[![build status](https://secure.travis-ci.org/imlucas/mongodb-security.png)](http://travis-ci.org/imlucas/mongodb-security)

Portable business logic of MongoDB security model.

## Example

\```mocha-should
var security = require('mongodb-security');

security.humanize({cluster: true})
  .should.equal('For the deployment');

security.humanize({collection: 'users', db: 'mscope'})
  .should.equal('On mscope.users');

security.humanize({collection: '', db: 'mscope'})
  .should.equal('On any any collection in the mscope database');

security.humanize({collection: 'users', db: ''})
  .should.equal('On the users collection in any database');
\```

## api

### `security.humanize(:resource)`

Take the `:resource` of a MongoDB grant and hand back a literate sentence prefix.

## License

MIT
```
