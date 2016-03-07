# Sorted Sets in DynamoDB

Now that [Secondary Local Indexes](http://aws.amazon.com/about-aws/whats-new/2013/04/18/amazon-dynamodb-announces-local-secondary-indexes/)
are available in Dynamo, many interesting patterns can be implemented.
The feature that came to mind right away after the announcement was sorted sets.
If you're familiar with Redis, you'll already know how handy these can be.
On [ex.fm](http://ex.fm), this is where all of the data from [trending](http://ex.fm/trending) comes from.
As users start interacting with songs, points are added for that songs daily total.
In redis, this looks something like:

    ZADD trending:20130419 song_id:1 1
    ZADD trending:20130419 song_id:1 0.1
    ZADD trending:20130419 song_id:2 0.3
    ZADD trending:20130419 song_id:3 0.7
    ZADD trending:20130419 song_id:4 0.9


Then to grab song ids to show for trending we just grab the top 20

    ZRANGE 0 20

Now with secondary indexes, we can implement the same basic functionality.

If we have a `Trending` table with a hash on `day`, a range on `song_id` and
a secondary index on `points`, our full schema looks something like this.

    {
        "KeySchema": [
            {
                "AttributeName": "day",
                "AttributeType": "HASH"
            },
            {
                "AttributeName": "song_id",
                "AttributeType": "RANGE"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "day",
                "AttributeType": "S"
            },
            {
                "AttributeName": "song_id",
                "AttributeType": "S"
            },
            {
                "AttributeName": "points",
                "AttributeType": "N"
            }
        ],
        "LocalSecondaryIndexes": [
            {
                "IndexName": "points-index",
                "KeySchema": [
                    {
                        "AttributeName": "day",
                        "KeyType": "HASH"
                    },
                    {
                        "AttributeName": "points",
                        "KeyType": "RANGE"
                    },

                ],
                "Projection": {
                    "NonKeyAttributes": [
                        "song_id"
                    ],
                    "ProjectionType": "INCLUDE"
                }
            }
        ]
    }

We can then represent this in [mambo](http://exfm.github.com/node-mambo) like so

    var mambo = require('mambo');

    var model = new mambo.Model(new mambo.Schema(
        'Trending', 'trending', ['day', 'song_id'],
        {
            'day': mambo.StringField,
            'song_id': mambo.StringField,
            'points': mambo.NumberField,
            'points-index': new mambo.IndexField('points').project(['song_id'])
        }
    ));


Then instead of calling `ZADD`, we just call an atomic update:

    var items = [
            ['song_id:1', 1],
            ['song_id:1', 0.1],
            ['song_id:2', 0.3],
            ['song_id:3', 0.7],
            ['song_id:4', 0.9]
        ],
        day = '20130419';

    items.map(function(item){
        return model.update('trending', day, '1')
            .inc('points', 1)
            .commit();
    });

Instead of calling `ZRANGE` to get our most popular song ids, we can just query
with our secondary index

    model.objects('tending', day)
        .index('points')
        .reverse() // Return DESC by points
        .fetch()
        .then(function(items){
            var ids = items.map(function(item){
                return item.song_id;
            });
        });

After a jetlag fueled morning of reading up on how to actually use secondary indexes
and getting this initial version working, I added the [SortedSet](https://github.com/exfm/node-mambo/blob/master/lib/sortedset.js)
helper right into mambo.  I'm really excited to get this into production and see
how it actually performs.

