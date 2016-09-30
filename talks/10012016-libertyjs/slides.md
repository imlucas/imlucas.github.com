slidenumbers: true

# Electron at MongoDB

From Web to Desktop

LibertyJS Oct. 1 2016

^ Welcome

^ Thanks for having me this morning

^ Get a few logistics out of the way first

---

`#libertyjs` `#electron`

@__lucas

^ Tweet about this talk using these hashtags

^ We'll have time for Q&A at the end but feel free to @ me instead or if we run out of time

---

disclaimer:

---

# Agenda

- What is MongoDB Compass?
- What is Electron?
- Why go from web to desktop?
- How to get started w/ Electron?
- Q&A

^ 40 min of talking
^ 15 min of Q&A at the end

---

# about:lucas

^ I'm Lucas

^ My desk is in NYC, but most of the time I'm working from home in the Fairmount neighborhood of Philadelphia.

^ Relocated from Brooklyn 2 years ago

---

![inline](./img/mongodb-logo-white.png)

^ Lucas Hrabovsky

^ Senior Software engineer at MongoDB for ~3 years

^ Founding member of the Compass team at MongoDB

^ Make tools Humans to work with data

---

## <compass screenshot>

^ TODO Grab existing Compass screenshot/gif

^ New product

---

## Compass Team

^ TODO Compass team map screenshot

^ New globally distributed team

^ All over the world

^ Excited everyone will be in NYC next week

---

## Compass: web -> desktop

^ Earliest versions of Compass as web app
^ Weekend hacking
^ May 14th, 2014
^ Still called atom-shell
^ Switched to Electron and haven't looked back

---

# Electron

^ TODO Logo for electron

^ Desktop apps using web technologies

---

## Chromium + node.js

^ Chromium: html rendering
^ node.js: I/O, ecosystem

^ TODO Logos for Chromium & node.js

---

## Built by GitHub for Atom Editor

^ TODO Logos for gh and Atom

---

## Single codebase deployed to many platforms

^ TODO Platform logos

---

## Electron Early Adopters

- GitHub
- Slack
- Microsoft

^ TODO Logos for gh, slack, ms visual studio code

---

# Why go from web to desktop?

^ "Electron gives your app superpowers"

^ Seen enough features, shiny frameworks come and go

^ Compass Team early goals Electron enables

---

### Goal #1

## Keep team small

---

### Single node.js target

^ Single version of node.js to worry about and test against

---

### Single rendering target

^ Just chrome

^ No extra time debugging/tweaking CSS for Internet Explorer, Firefox, etc.

---

### Goal #2
## Make it awesome

^ Raise bar for user experience
^ Have complete control
^ Easy for anyone to try
^ Working with data in desktop feels natural
^ Remove compromises

---

### Avoid compromise

^ Integrate with platform specific API's as node.js native add-ons

---

### Example: Keychain Access

- With great data comes high security
- Plain text passwords just not an option
- Lots of form inputs required to connect to MongoDB
- How can we make it dead simple for users to connect securely

---

### Break out of browser security sandbox

---

### Example: Clipboard

`compass connect clipboard screenshot`

^ TODO compass connect clipboard screenshot

- Copy a `mongodb://` URL
- Compass polls clipboard
- When `mongodb://` URL detected
- Parse it
- Just click ok to populate complicated form

---

### Easy for anyone to try

^ Desktop Apps easier to deploy for Enterprise
^ No proxy to deploy
^ No on-prem SaaS that's never updated

---

### Example: Windows Installers

- Don't require administrator to install
- Individuals in control their own tools

---

## More

---

### System Tray

^ Fast easy access
^ menubar apps

---

### Screenshot

---

### Process Control

---

### Native Notifications

---

## Getting Started with Electron

---

### http://electron.atom.io

---

^ Electron API Demos App

^ Try for yourself

^ TODO screenshot electron api demos app

---

## Thanks!

- @zcbenz, @kevinsawicki, @jlord, @zeke (Electron team at GitHub)
- @maxogden and @electron-userland (Essential tooling)
- @paulcbetts at Slack (Make it all work on Windows, Auto Updates)
- Evan from Nylas

---

# Q&A

![inline 50%](./img/LjsLogo-2016.png)

## lucas@mongodb.com

---

# :wave:

---

---

## Why has electron been so successful?

---

### Not a new idea...

- nw.js
- breach
- macgap
- brackets-shell
- Chrome Apps
- appjs
- Mozilla Chromeless

---

### Seriously

- Titanium
- Google Gears
- QT
- Adobe Air
- Mozilla XULRunner
- Swing (2001!)

---

### Auto Updates

---

### Embrace node.js ecosystem, conventions & values

- Independent parties building better tooling!

---

### Rise of node.js
