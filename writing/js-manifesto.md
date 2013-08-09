# exfm Javascript Manifesto

## Workflow

### Use NPM

Use packages as much as possible.  Avoid installing things globally unless
they're actually system wide binaries like `coffee` or `lessc`.

We have our own npm set up to replicate from the main npm repository.
Anything open source should be publish to the main npm repository.
All internal packages should be published to the internal repository.

In your internal package, you should include the following in your package.json

    "publishConfig": {
        "registry":"http://exfm:Repeat1.@npm.ex.fm"
    }


You can find more info on working with custom registries [here](http://npmjs.org/doc/registry.html#I-don-t-want-my-package-published-in-the-official-registry-It-s-private).

Open source everything that can be.

### Testing

Use mocha and should.

If you have an open source package, it should have tests and be setup to run on
[travis](http://travis-ci.org/).

If you have a private package, it should run on jenkins.

Don't write silly unit tests.  Functional tests are always preferred, but should run as fast as possible.

Keep test area small.  One case for one thing.  Don't cheat by testing multiple areas in one test.

### App Design

Keep it as simple as possible.

For any process your app needs to run, your package should make a binary available for that.

So for a project like `liam`, there would be `./bin/liam` to run the web server and
`./bin/liam-worker` to run the worker.

Your project should have a grunt file for dev-ing.  `grunt start` should start your app,
`grunt test` should run tests, `grunt bundle` should generate browserify bundles,
etc, etc.


### Always Write Docs

Helps you think about your code differently, in most likely a much better way.

Required for open sourcing.

Don't go crazy with type hinting and javadoc declarations.

Use markdown in your comments.

Use docco for generation (we'll have a central repository for uploading your docs to at some point soon).

## Style Guide

Most of this is copy and pasted from jquery, but there are some important distinctions.

### JSHint

Install sumblielinter from sublime package control.

@todo add exceptions.


### OOP

Constructor definition

    // What does this do?
    function Baz(){
        this.constructorCalled = true;
    }

If arguments are required, don't put them in options.

    // No
    function Baz(opts){
        if(!opts.foo){
            throw new Error('Mus specify foo!');
        }
    }

    // Yes
    function Baz(foo, opts){
        this.foo = foo;
    }

Explicitly define methods on the prototype.
    function Baz(foo, opts){
        this.foo = foo;
    }

    Baz.prototype.bar = function(){
        alert(this.foo);
    };

Use extend or inherits.

    var util = require('util'),
        events = require('events');

    // The Baz
    function Baz(foo, opts){
        // foo is a string that does something.
        this.foo = foo;
    }

    util.inherits(Baz, events.EventEmitter);

    Baz.prototype.bar = function(){
        this.emit('alert', {'foo': this.foo});
    };

Use bind.  If you're using apply or call you're probably doing something wrong.

    var util = require('util'),
        events = require('events');

    // The Baz
    function Baz(foo, opts){
        // foo is a string that does something.
        this.foo = foo;

        this.on('alert', this.onAlert.bind(this));
    }

    util.inherits(Baz, events.EventEmitter);

    Baz.prototype.bar = function(){
        this.emit('alert', {'foo': this.foo});
    };

    Baz.prototype.onAlert = function(data){
        alert(this.foo === data.foo);
    };


### Naming

TitleCase for classes.

camelCase for everything else.

__camelCase for priva.... don't make things private.

### Scoping

Always use module.exports.

If for some reason you actually want something to be private (you probably don't),
don't put it in exports.


### Spacing

Should for 80 column width.

No tabs.  4 space indentation or death.
No craziness with extra whitespace around operators.

    // Yes:
    if(blah === "foo"){
        foo("bar", "baz", {zoo: 1});
    }

    // No:
    if ( blah === "foo" ) {
        foo( "bar", "baz", {
            zoo: 1
        });
    }

    // No:
    if(blah==="foo"){
        foo("bar","baz",{zoo:1});
    }

Lines with nothing on them should have no whitespace.

There should be no whitespace at the end of a line.

Always have spaces after commas.

In object literals, always have a space after a colon, never have a space before a colon.

In ternary operators, always have a space before and after the colon and the question mark.

Use semicolons.

Feel free to use whitespace in literals.

    // No
    var songIdList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, NaN];

    // Yes
    var songIdList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, NaN];

    // Sure why not
    var songIdList = [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        NaN
    ];


### Comments

Always use `//` for comments, not blocks.

Single line comments should always be on their own line and be above the line they reference.
Additionally there should be an extra endline above it. For example:

    var some = "stuff";

    // We're going to loop here
    for (var i=0; i<10; i++){}

### Equality

Strict equality checks (===) should be used in favor of == wherever possible.

### Blocks

if/else/for/while/try always have braces and always go on multiple lines.

Braces should always be used on blocks.

`else/else` `if/catch` go on the line after the brace to allow for comments.

    // No
    if(blah){
        baz();
    } else {
        baz2();
    }

    // Yes
    if(blah){
        baz();
    }
    // Fallback to baz2 because blah is blargtown.
    else {
        baz2();
    }

### Assignments

Assignments should always have a semicolon after them.

Semicolons should always be followed by an endline.

Assignments in a declaration should always be on their own line. Declarations that don't have an assignment should be listed together at the start of the declaration. For example:

    var a, b, c,
        test = true,
        test2 = false;

### Enums

At the top of all js files, make it a point to declare your enums withing a self container object.  

    var enums = {
        'THANKYOU' : "Thanks for signing up!",
        'ERROR'    : "Sorry, but there was an error!",
        'WELCOME'  : "Welcome to Exfm!"        
    }
    

### Strings

Strings should always use double-quotes instead of single-quotes.


### Literals

Object literals should always have single quotes around keys.

    // No
    var a = {foo: true};

    // Yes
    var a = {'foo': true};

Prefer dot notation for object access over brackets.

    // No
    var b = a['foo'];

    // Yes
    var b = a.foo;


### Flow Control

Don't pass callbacks as arguments.

Use promises as much as possible.

Don't write your own custom promises module.  Use [when](https://github.com/cujojs/when).
