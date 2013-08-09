# Keeping Configuration in Source Control

A while back, John Resig shared how [they handle configuration](http://ejohn.org/blog/keeping-passwords-in-source-control/) info at Khan Academy and I thought I would share our solution at exfm as well.

We have two reasons for not keeping configuration data in the code.  First, we don't want to accidentally expose the data.  This happens all the time; accidentally making a Github Gist public when it should have been private, committing your local `config.json` file to a public repo.  The second is we don't want to deploy just to enable a feature for A/B Testing.

The solution we use is centralizing the configuration details behind a service.  There are plenty of ways to skin this cat, for example
[Zookeeper](http://zookeeper.apache.org/), [Netflix's Archaius](https://github.com/Netflix/archaius) or [Rackspace Service Registry](http://docs.rackspace.com/rsr/api/v1.0/sr-devguide/content/overview.html).  These configuration services have, more or less, two layers of security: one on the network level (iptables, AWS security groups, etc) and the second being simple username and password authentication.  The problem you run into next is where do you store the credentials to access the configuration service?  You don't want these credentials to be littered throughout your different projects.  You'll just incur an extra expense when it's time to update them (which should be done regularly) and inevitably, each project will end up implementing a slightly different API to actually retrieve the configuration data.

The trick we use is to exploit the fact that npm and pip can install requirements from private repositories.  We have a private repository for each language we use that just contains the credentials for the configuration service and a consistent API for getting config values.  Each project then just adds the repo as a requirement to `package.json` or `requirements.txt`.

In lieu of Archaius or Zookeeper, we have a little express app running on one of our utility instances.  It handles basic HTTP auth from the incoming clients and grabs JSON from [DynamoDB](http://aws.amazon.com/dynamodb/) by environment.  Even this uses a local `config.json` on the instance, so no one ever really sees the AWS credentials.  As a bonus, DynamoDB comes with a ready made GUI in the AWS Console so we can reuse all of the built in AWS security, and updating or adding values is really simple.

So, how does this all fit together in code?  Here are a few examples.

    // Add our config client to dependencies in package.json
    "config-client": "git+ssh://git@github.com/<username>/config-client.git"

    // server.js
    var nconf = require('nconf'),
         getConfig = require('config-client');  // configuration client

    // Configure nconf
    nconf.argv().env().use('memory');

    // Bundles making REST calls to confighost/NODE_ENV
    getConfig(nconf.get('NODE_ENV'), function(err, config){
        if(err) return console.error('ERROR ', err);
        nconf.overrides(config);
        // Start listening for incoming
    });

Or with for our python services

    # Add to requirements.txt
    -e git+ssh://git@github.com/<username>/config-client.git#egg=exfmconfigclient


    # Put this in a module, say exfmconfigclient.__init__.py
    config_username = <some username>
    config_password = <some password>
    config_host = 'https://someserver.com'

    __all__ = ['get_config']

    def get_config(env):
        return requests.get(config_host + '/' + env, username=config_username,
            password=config_password, headers={'Accept': 'application/json'}).json


    # app.py, __init__.py, etc

    from flask import Flask
    from exfmconfigclient import get_config

    def get_environment():
        # Load from a file or environment variable like APP_ENVIRONMENT=production etc

    def create_app():
        app = Flask(__name__)
        app.config.from_object(get_config(get_environment()))
        return app

We've been using this for a few months now and it's been working out pretty well.  Not having to think about configuration at all feels great.
