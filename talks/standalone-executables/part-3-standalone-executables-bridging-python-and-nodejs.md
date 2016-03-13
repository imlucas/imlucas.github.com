# Standalone Executables
## Part 3: Bridging the gap between Python & node.js

---

# [Netflix Sidecar model][netflix-sidecar-post]

- "We wrote a whole lot of Java but we're switching to node.js and we don't
    want to rewrite all of that Java code"
- [Prana][netflix-prana] wrap Netflix Java stack and expose via HTTP api's

---

# python on npm

[python](https://www.npmjs.com/package/python)

> A super-simple wrapper for NodeJS to interact programmatically with
> the Python shell. Enables the use of Python-based tools from Node.

[python-js](https://www.npmjs.com/package/python-js)

> PythonJS is a multi-language Python translator. The translator is written in Python and runs inside NodeJS using a hacked and stripped down version of Empythoned. Empythoned is the standard C-Python interpreter compiled to JavaScript using Emscripten.


---

# `npm install -g evergreen`

- http://npm.im/evergreen
- postinstall hook downloads the correct binary for your platform from S3
-

---


# mtools + compass
- How to make mtools accessible to Compass?

[netflix-sidecar-post]: http://techblog.netflix.com/2014/11/prana-sidecar-for-your-netflix-paas.html
[netflix-prana]: https://github.com/netflix/Prana
