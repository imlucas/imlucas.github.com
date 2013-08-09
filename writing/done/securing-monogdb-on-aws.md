# Securing MongoDB in AWS

Security groups are one of the many great features of AWS.  To give you a quick primer: security groups allow you to define inbound traffic rules based on IP address or security group like IPtables, but without having to edit the rules on every machine when you change them.  They also allow you the advantage of applying rules based on security group, so that your application instances can talk to mongod, but nothing outside of your application can.

The following assumes that you, the reader, already has some working knowledge of how security groups work and are using them.  If not, take a look at the [Building three-tier architectures with security groups](http://aws.typepad.com/aws/2010/06/building-three-tier-architectures-with-security-groups.html) on the AWS blog.

Mongo's built-in security is admittedly weak at best, but getting better.  In fact, mongo's default seems to be to have you not use its built-in security at all, instead putting the impetus on you to create a ["trusted environment"](http://www.mongodb.org/display/DOCS/Security+and+Authentication).
The most common way to set up this trusted environment on AWS (other than not having it at all) is to modify the security group under which your instances are currently running and allow access to mongo only from specific IP addresses. This is a also a great way to guarantee heartburn when you forget allow a new instance or want to make your infrastructure more liquid.  A more effectiv way would be to allow only traffic from specific security groups-- that is, only from *your* instances.  An important note: In order to use security group based rules, you must connect to the instance via the private ip address.  Internally EC2 will route the public DNS ec2-100-00-000-000.compute-1.amazonaws.com to the correct private IP address of 10.100.00.00 for you.

We found the automatic routing to be a bit funky when actually trying to get this all set up and into production.  Instead, we created another domain in [route53](http://aws.amazon.com/route53/), say `supersecretex.am`, and added A records pointing directly to the private IP's.  This also made it easier to tell which things in the application we knew to be locked down, and which were intentionally more open. We also added A records pointing to the public DNS to make SSH, health checks and ops involve less typing.  Needless to say, you should also have your mongo instances associated with an elastic IP address.  There's nothing worse than the DNS changing out from under you and being woken up in the middle of the night because your app is now completely down.


## Lock It Down and Simplify

Say we have five instances: Two web apps (oscar and elmo), a mongo primary (bert), a mongo secondary (ernie) and an arbiter (arbiter).  The five instances are spread out between two security groups, and we're using the "add IP addresses as we add new instances" approach.

### Web - sg1

<table>
    <thead><tr><th>Port</th><th>Source</th></tr></thead>
    <tbody>
        <tr><td>22 (SSH)</td><td>0.0.0.0/0</td></tr>
        <tr><td>80 (HTTP)</td><td>0.0.0.0/0</td></tr>
        <tr><td>443 (HTTPS)</td><td>0.0.0.0/0</td></tr>
    </tbody>
</table>

### Mongo - sg2

<table>
    <thead><tr><th>Port</th><th>Source</th></tr></thead>
    <tbody>
        <tr><td>22 (SSH)</td><td>0.0.0.0/0</td></tr>
        <tr><td>27017</td><td>arbiter's ip address</td></tr>
        <tr><td>27017</td><td>bert's ip address</td></tr>
        <tr><td>27017</td><td>ernies's ip address</td></tr>
        <tr><td>27017</td><td>oscar's ip address</td></tr>
        <tr><td>27017</td><td>elmo's ip address</td></tr>
        <tr><td>30000</td><td>bert's ip address</td></tr>
        <tr><td>30000</td><td>ernies's ip address</td></tr>
    </tbody>
</table>

Now this is all well and good, but it's a headache when you add a new web instance to rememeber to add its IP to the Mongo security group; not to mention using autoscaling or cloudformation.  So, let's simplify this by adding two new rules to the mongo group to allow inbound traffic from the web and mongo security groups.  This is easy to do in the AWS console and it will autocomplete the correct security groups for you when you start typing `sg` into the source input box.  Our mongo security group will now look like this:

<table>
    <thead><tr><th>Port</th><th>Source</th></tr></thead>
    <tbody>
        <tr><td>22 (SSH)</td><td>0.0.0.0/0</td></tr>
        <tr><td>27017</td><td>sg1</td></tr>
        <tr><td>27017</td><td>sg2</td></tr>
        <tr><td>27017</td><td>arbiter's ip address</td></tr>
        <tr><td>27017</td><td>bert's ip address</td></tr>
        <tr><td>27017</td><td>ernies's ip address</td></tr>
        <tr><td>27017</td><td>oscar's ip address</td></tr>
        <tr><td>27017</td><td>elmo's ip address</td>
        <tr><td>30000</td><td>sg2</td></tr>
        <tr><td>30000</td><td>bert's ip address</td></tr>
        <tr><td>30000</td><td>ernies's ip address</td></tr>
    </tbody>
</table>

Don't go deleteing those old rules just yet!  We have a bit more to do to make sure things go smoothly.


## Changing replica set configuration

After you add your new DNS records and before you restict access to the security group, you'll want to update your replica set configuration to point to the new DNS entries.  Don't worry.  It's not as scary as it sounds.

    PRIMARY> rs.conf()
    {
        "_id" : "mydb",
        "version" : 1,
        "members" : [
            {
                "_id" : 0,
                "host" : "mongo-bert.company.com:27017",
                "self": true
            },
            {
                "_id" : 1,
                "host" : "mongo-arbiter.company.com:30000",
                "arbiterOnly" : true
            },
            {
                "_id" : 2,
                "host" : "mongo-ernie.company.com:27017"
            }
        ]
    }

The first thing we'll want to do is update the config for arbiter and ernie.  So jump into the mongo shell on your primary and run the following:

    PRIMARY> conf = rs.conf()
    PRIMARY> conf.members[0].host = "mongo-bert.int-company.com:27017"
    PRIMARY> conf.members[1].host = "mongo-arbiter.int-company.com:30000"
    PRIMARY> conf.members[2].host = "mongo-ernie.int-company.com:27017"
    PRIMARY> rs.reconfig(conf)

Running this on the primary will automatically update the configuration on your secondary and arbiter, so you just have to run it once. More information on replica set reconfiguration can be found in the [docs](http://docs.mongodb.org/manual/reference/replica-configuration/#usage).  You'll probably also want to update the hostnames on your mongo instances to use the new DNS entries.

## MMS

If you're using [MMS](https://mms.10gen.com/), which you absolutely should be, you'll need to make some changes so it doesn't freak out and start sending you alerts.  You can make changes in your /etc/hosts on the instance running MMS (usually the arbiter) to point the public dns records to the internal dns records.  In our case, we just deleted our old hosts in MMS that were using the public DNS records and added the new internal DNS records for that oh-so-fresh feeling and didn't really mind losing all of the old, bad data.


## Let's Do This!

We're now ready to remove those old IP address specific rules.  By now you've:

 * Updated your application configuration to point to the internal DNS records
 * Deployed your application to production with the new configuration changes
 * Updated MMS so it will be happy after this change

Go ahead and delete the ip address based rules in the Mongo security group and hit apply.  The Mongo security group will now look like:

<table>
    <thead><tr><th>Port</th><th>Source</th></tr></thead>
    <tbody>
        <tr><td>22 (SSH)</td><td>0.0.0.0/0</td></tr>
        <tr><td>27017</td><td>sg1</td></tr>
        <tr><td>27017</td><td>sg2</td></tr>
        <tr><td>30000</td><td>sg2</td></tr>
    </tbody>
</table>

Much nicer, no?  Your mongo cluster is now running in a trusted environment and you can add and remove machines as needed.

