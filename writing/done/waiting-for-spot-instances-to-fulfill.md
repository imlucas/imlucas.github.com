# Waiting for Spot Instances to Be Fulfilled with Boto

Something I do constantly is start spot instances, wait for them to be fulfilled
and then work with them.  I finally got around to just scripting this yesterday.

    import boto
    import copy

    def wait_for_fulfillment(conn, request_ids, pending_request_ids):
        """Loop through all pending request ids waiting for them to be fulfilled.
        If a request is fulfilled, remove it from pending_request_ids.
        If there are still pending requests, sleep and check again in 10 seconds.
        Only return when all spot requests have been fulfilled."""
        results = conn.get_all_spot_instance_requests(request_ids=pending_request_ids)
        for result in results:
            if result.status.code == 'fulfilled':
                pending_request_ids.pop(pending_request_ids.index(result.id))
                print "spot request `{}` fulfilled!".format(result.id)
            else:
                print "waiting on `{}`".format(result.id)

        if len(pending_request_ids) == 0:
            print "all spots fulfilled!"
        else:
            time.sleep(10)
            wait_for_fulfillment(conn, request_ids, pending_request_ids)

    # Connect to EC2
    conn = boto.connect_ec2()

    # Request a spot instance
    # Requests is a list because in the real world, you'll probably
    # want to make these requests in multiple availability zones
    requests = [conn.request_spot_instances(price, image_id, count=1,
            type='one-time', instance_type='m1.micro')]

    # Figure out what our actual spot reservations are
    request_ids = [req.id for req in request for request in requests]


    # Wait for our spots to fulfill
    wait_for_fulfillment(conn, request_ids, copy.deepcopy(request_ids))
