Why PhantomJS is Awesome
========================

We started working on the [sites redesign](http://blog.ex.fm/post/24683628450/sites-makeover-relaunch)
a while back.  The extension has always kept a history of which sites with music
you've visited and then exposed the usual iTunes grid UI to browse your
history and drill down to listen to everything from just a single site.
All of this history was kept in local storage and only on the client side.  This
had two major drawbacks we wanted to solve immediately on this project.


## Kill Local Storage

Local Storage has a hard limit of 5 MB of data.  There is not way in the API to
see how close you are to that limit.  Our initial tactic for addressing this
issue was to limit the history to 1000 songs.  Even with this change, there
were still issues storing a lot of information because reads and writes always
go to disk.  On an SSD, you probably didn't notice the hiccups.  On a spinning
disk though, this could mean the extension locking up the browser for 15 seconds
or more.  Unacceptable.

## Device Portability

Storing all of this information only in Local Storage of course meant it was
limited only to one device.  It's  a bad experience having different data on
at work vs your laptop at home, not to mention it's just weird not being able
to access your information for your phone in any fashion.

## Enter PhantomJS

A couple of weeks into the sites redesign, we had all of our new API's in place,
things were looking good, but something was really missing.  We could easily
grab all of the meta info for a site (title, favicon, description).  For
soundcloud pages and bandcamp albums, we could easyily grab the album art and
show that as a thumbnail for the site, but it really needed screenshots for all
those blogs posting really amazing music.  We played around with the usual GTK/QT
based screenshot scripts, but they all had their own downsides and just didn't
work.

A few days into this experimenting process, we were starting to lose hope.
PhantomJS looked great, but involved a lot of hacking to get it running
on ubuntu ec2 instances.  Miraculously, just after we discovered Phantom,
1.5 was released and it was huge.  1.5 ran perfectly on the instances with no
hacking!


## Neat! We can take screenshots now!

Once we found Phantom could solve our screenshot problem we started to dig deeper.
The extension code that finds what things are playable on a page was constantly
in flux.  API's and regexes would need constant updating and pushing out
extension updates takes several days to filter down to all users, meaning
our core functionality could be broken for users for several days.  With
PhantomJS, we were able to move almost all of this discovery code to the backend.
When an API or regex changes, we can now immediately push an update to the server,
and almost no one notices.  In order to make this actually happen, we prototyped
a small wrapper script to load the page in PhantomJS and inject the extension
playable discovery code.  It was a burning bush type moment.

## Getting it to production

Our initial design was to use celeryworkers to call the PhantomJS script via
subprocess.  Too predictably, this completed bombed all of our servers.  After
a quick re-think, we whipped together a a little express app that would run
on a single instance as a REST service and memcache discovery results for a few
minutes.  Celery workers could then just make an HTTP call and this has worked
great.  (Side note: service-ify everything.)

## Other Improvements

For any PhantomJS script longer than just a few lines, make you life easier and
user [phantomjs-nodify](https://github.com/jgonera/phantomjs-nodify) or hack in
your own require function override (PhantomJS's built-in require can only access
a subset of moudles like fs, although hopefully this will change in the future).
Without a good require function, longer scripts will get out of control really
quickly.  Modularize as much as possible, as early as possible.

Set a timeout for child_process.exec and another loading timeout in your page
loader script to avoid thousands of processes hanging out.

Use cluster on the express app so you can swamp the whole box.

Handle errors in your page loader script.  Scripts you are injecting will be
broken in some cases because of unexpected failures or broken scripts on the
pages you're trying to load or unexpected native object prototype overloads.
Make sure to at least log failures somewhere as most of these problems are easily
fixed.