# npm version

Found a nice little helper in npm for my module development workflow I haven't
heard anyone bring up before and thought I would share: [`npm version`](https://npmjs.org/doc/version.html).

My most frequent screw-ups when publishing module changes are:

 * forgetting to increment the version number in `package.json`
 * making a promise to add git tags for each version, and then promptly forgetting to add them 4 times out of 10

Fortunately, `npm version` is here to help.

With no args, you'll get the versions of npm, node and node's dependencies.  If
you're in a module with a `package.json`, you'll get it's version number as well.

    {
        http_parser: '1.0',
        node: '0.10.11',
        v8: '3.14.5.9',
        ares: '1.9.0-DEV',
        uv: '0.10.11',
        zlib: '1.2.3',
        modules: '11',
        openssl: '1.0.1e',
        npm: '1.2.30',
        'imlucas.github.com': '0.0.1'
    }

`npm version` also has a setter form.  The most basic is to just set the version
in `package.json` and create a tag.

    [master] imlucas.github.com/ npm version 0.0.2
    v0.0.2
    [master] imlucas.github.com/ cat package.json
    {
      "name": "imlucas.github.com",
      "version": "0.0.2",
      "dependencies": {}
    }
    [master] imlucas.github.com/ git tag -l
    v0.0.1
    v0.0.2

That's handy, but prone to fat-fingering.  Instead, you can pass a valid argument
to `semver.inc`, major, minor, patch or build.  This gives a pretty nice workflow
for day-to-day.

    # ... write code
    # ... run tests
    # ... commit

    [master] imlucas.github.com/ npm version patch
    v0.0.3
    [master] imlucas.github.com/ cat package.json
    {
      "name": "imlucas.github.com",
      "version": "0.0.3",
      "dependencies": {}
    }
    [master] imlucas.github.com/ git tag -l
    v0.0.1
    v0.0.2
    v0.0.3

    # ... push
    # ... npm publish

Please do this.  People using your modules for their projects will be extremely
greatful and not send you hate mail.  Now that I've been using this for a bit,
next steps are:

 * is it helpful to generate a CHANGELOG.md with `git log <previous-version> <new-version>` and add that as the tag commit messgage?
 * how does it feel to increment package build number, with branch name after running through CI?

