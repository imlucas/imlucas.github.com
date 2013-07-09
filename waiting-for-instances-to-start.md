# Waiting for Instances to Start with Boto

Again, this is something I do almost everyday and finally got around to scripting it.
At some point there was a helper already in boto to do this, but it seems to have
been factored out.

    import boto
    import copy

    def wait_for_instances_to_start(conn, instance_ids, pending_ids):
        """Loop through all pending instace ids waiting for them to start.
            If an instance is running, remove it from pending_ids.
            If there are still pending requests, sleep and check again in 10 seconds.
            Only return when all instances are running."""
        reservations = conn.get_all_instances(instance_ids=pending_ids)
        for reservation in reservations:
            for instance in reservation.instances:
                if instance.state == 'running':
                    print "instance `{}` running!".format(instance.id)
                    pending_ids.pop(pending_ids.index(instance.id))
                else:
                    print "instance `{}` starting...".format(instance.id)
        if len(pending_ids) == 0:
            print "all instances started!"
        else:
            time.sleep(10)
            wait_for_instances_to_start(conn, instance_ids, pending_ids)

    # Connect to EC2
    conn = boto.connect_ec2()

    # Run an instance
    requests = [conn.run_instances('<ami-image-id>')]

    instance_ids = [instance.id for instance in request.reservation.instances
                    for request in requests]

    # Wait for our spots to fulfill
    wait_for_instances_to_start(conn, instance_ids, copy.deepcopy(instance_ids))