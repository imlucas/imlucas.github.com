# Mott: A Tool for Building Phonegap and Multi-Platform Apps

A few months ago, we released a new version of ex.fm for iOS.  It was a pretty big change product wise; adding lots of new features and taking away others.  No one realized though the even larger change of switching from Objective-C to HTML and javascript.  [Dan](http://phonegap.com/blog/2013/04/23/story-behind-exfm/) has written up some of his thoughts on Phonegap and some of the reasons why we made this change.  This will be a more behind the scenes look at how we actually pulled it off with a new build tool we call [mott](https://github.com/exfm/mott).

When we first made the decision to do this switch after our phonegap tests proved to us it was more than feasible, we wanted to correct some mistakes we had made in the past developing the web app.  (Both backbone apps).

 * Module driven development
 * Real templating
 * Deploying to S3 and serve everything through cloudfront.


Browserify: Module driven development
Templating: Handlebars
Deploying: Build, Upload to S3, Served via Cloudfront, Copy to Native folder
