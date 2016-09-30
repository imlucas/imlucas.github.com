slidenumbers: true


# Electron at MongoDB

From Webapp to Desktop

LibertyJS Oct. 1 2016

^ Welcome

^ Thanks for having me this morning.

---

disclaimer:

---

@__lucas

#electron #libertyjs
---

## about:lucas

^ I'm Lucas

^ Founding member of the Compass team at MongoDB

^ Make tools Humans to work with data

---

## Agenda

- What is Compass?
- What is Electron?
- Why move Compass from web to desktop with Electron?
- How to get started w/ Electron?

---

## MongoDB

`leaf icon`

^ TODO MongoDB leaf

---

## Compass

^ TODO Compass screenshot

^ New product

---

## Compass Team

^ TODO Compass team map screenshot

^ New globally distributed team

---

## Started as webapp

^ TODO Screenshot of mongoscope

---

## Switched to Electron

^ May 14th, 2014
^ Still called atom-shell

---

## Electron

^ TODO Logo for electron

^ Desktop apps using web technologies

---

### Chromium + node.js

^ Chromium: html rendering
^ node.js: I/O, ecosystem

^ TODO Logos for Chromium & node.js

---

### Built by GitHub for Atom Editor

^ TODO Logos for gh and Atom

---

### Single codebase deployed to many platforms

^ TODO Platform logos

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

### Electron Early Adopters

- GitHub
- Slack
- Microsoft

^ TODO Logos for gh, slack, ms visual studio code

---

### Rise of node.js

---

### Auto Updates

---

### Embrace node.js ecosystem, conventions & values

- Independent parties building better tooling!

---

## Why not just a webapp?

^ "Electron gives your app superpowers". Ugh...

^ Seen enough features, shiny frameworks come and go

^ This was a business decision

^ Compass Team early goals

---

### Keep team small

- Shipped 1.0 w/ 2 engineers
- Single node.js version target
- No extra time debugging/tweaking CSS for Internet Explorer, Firefox, etc.

---

### User experience

- Have complete control
- Working with data in desktop feels natural
- Remove compromises

---

### How to remove compromises

- Integrate with platform specific API's as node.js native add-ons
- Break out of browser security sandbox

---

### Example: Keychain Access

- With great data comes high security
- Plain text passwords just not an option
- Lots of form inputs required to connect to MongoDB
- How can we make it dead simple for users to connect securely

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

### Desktop Apps easier to deploy for Enterprise

- No proxy to deploy
- No on-prem SaaS that's never updated

---

### Example: Windows Installers

- Don't require administrator to install and try!
- Individuals in control of their own tools

---

## More

---

### System Tray

- Fast easy access
- menubar apps

---

### Protocol Handlers

`open mongodb://...`

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

### Electron API Demos App

^ TODO screenshot electron api demos app

---

## Thanks to Humans

- @zcbenz, @kevinsawicki, @jlord, @zeke (Electron team at GitHub)
- @maxogden and @electron-userland (Essential tooling)
- @paulcbetts at Slack (Make it all work on Windows, Auto Updates)


---

# Q&A

![inline 50%](./img/LjsLogo-2016.png)

## lucas@mongodb.com

---

# :wave:
