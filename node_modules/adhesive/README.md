<img src="https://s3.amazonaws.com/jstarrdewar.com.bucket/adhesive.jpg" alt="adhesive" width="800">

`adhesive` is a simple build tool that uses UglifyJS to concatenate your JavaScript and make you a nice source map.

I expect this to be most useful for simple, front-end focused projects, particularly those that are already working with a traditional list of `<script>` tags in `index.html` (and where you may not want to rock the boat).  There are [more sophisticated versions of this](https://github.com/h5bp/node-build-script) out there, but `adhesive` has some advantages: 
- There is very little configuration, so it won't take you more than a few minutes to get it working. 
- It __outputs source maps__ so you can easily debug the minified version of your code. 
- It's so simple that you can grab the repo and modify it to your heart's content – without spending very long learning how it works.

`adhesive` doesn't bother with css.  I usually have [compass](http://compass-style.org/) watching my scss files and combining them already.

##Installation

You need to install [Node](http://nodejs.org/) if you haven't already.  Then:

`npm install adhesive -g`

Or you can clone this repository, `cd` into into it, and run `npm link`.  That's a good option if you want to try modifying adhesive.

##Usage

`adhesive <config_path> [--debug | --dont-minify | --help]`

Your config file must have a .json extension.  You may omit the extension when invoking adhesive. For example, if your configuration file is named `build.json`, the following are equivalent:

`adhesive build`<br/>
`adhesive build.json`

###Flags

`--debug`
- Compiles a source map.
- Defines a constant DEBUG=true which you can use to hide console.log from the production build. [More info on my blog](http://jstarrdewar.com/blog/2013/02/28/use-uglify-to-automatically-strip-debug-messages-from-your-javascript/).

`--no-uglify`
- Will tell adhesive to only concatenate your code (no uglifying), which is useful if you need to debug something in a browser that doesn't support source maps.

`--help`
- Displays this information in the terminal.

###Automation

I recommend using [nodemon](https://github.com/remy/nodemon) with adhesive to recombine your code each time you make a change.  Thanks to source maps, this allows you to have a nice workflow that is pretty much identical to using `<script>` tags:

`npm install nodemon -g`<br/>
`nodemon adhesive build --debug`

##Configuration

The configuration file is a JSON document.  It requires that you specify an array of source files and an output path, like so:

```json
{
    "sources":[
        "swipe.js",
        "PxLoader.js",
        "PxLoaderImage.js",
        "main.js"
    ],
    "outputPath":"main_built.js"
}
```
It probably goes without saying that the sources are concatenated in the order listed, so if your site currently has a list of script tags, you'll want to maintain that same order in here.

###Optional Parameters
You can set a `sourceRoot` path that will be prepended to the filenames in the `sources` array:

```json
{
    "sourceRoot":"js/",
    "sources":[
        "vendor/swipe.js",
        "vendor/PxLoader.js",
        "vendor/PxLoaderImage.js",
        "main.js"
    ],
    "outputPath":"js/main_built.js"
}
```
###Source Map Options
The source map will automatically be saved alongside the built file.  In the previous example if you called `adhesive build.json --debug`, you would get two files saved to your `js` folder:

`main_built.js`<br/>
`main_built.js.map`

You can customize this by adding a `sourceMap` object.  It has two parameters: `path` and `root`.  The source map will be saved at `path`, and `root` specifies where the source map will look for files.  This gets a little confusing, because it's relative to the source map's path at runtime.  If you set the source map path to `maps/main_sourcemap.map` and the `root` isn't set to anything, the source map will look for files in `maps/js/`, which is not what you want.  When in doubt, don't set `root`.  It will automatically be pointed to the current folder, which is usually the right choice.

Here's an example configuration with everything in it:

```json
{
    "sourceRoot":"js/vendor/",
    "sources":[
        "swipe.js",
        "PxLoader.js",
        "PxLoaderImage.js"
    ],
    "outputPath":"js/built/vendor.js",
    "sourceMap":{
        "path":"maps/vendor.js.map",
        "root":"../"
    }
}
```

##License
FreeBSD:
```
Copyright (c) 2013, John Starr Dewar
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies, 
either expressed or implied, of the FreeBSD Project.
```
