#!/usr/bin/env node

var linter = require("../lib/linter");
var reporter = require("../lib/reporter");
var nopt = require("nopt");
var fs = require("fs");

function commandOptions () {
    var flags = [
        'adsafe', 'bitwise', 'browser', 'cap', 'continue', 'css',
        'debug', 'devel', 'es5', 'evil', 'forin', 'fragment',
        'newcap', 'node', 'nomen', 'on', 'onevar', 'passfail',
        'plusplus', 'regexp', 'rhino', 'undef', 'safe', 'windows',
        'strict', 'sub', 'white', 'widget', 'goodparts', 'json',
        'plainoutput'
    ];

    var commandOpts = {
        'indent' : Number,
        'maxerr' : Number,
        'maxlen' : Number,
        'predef' : [String, null]
    };

    flags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}

var options = commandOptions(),
    shorthandOptions = {
        "good" : ["--goodparts"],
        "gp" : ["--goodparts"]
    },
    shorthands = Object.keys(shorthandOptions);

var parsed = nopt(options, shorthandOptions);

function die(why) {
    console.warn(why);
    console.warn("Usage: " + process.argv[1] +
        " [--" + Object.keys(options).join("] [--") +
        "] [-" + shorthands.join("] [-") +
        "] <scriptfile>...");
    process.exit(1);
}

if (!parsed.argv.remain.length) {
    die("No files specified.");
}

var errors = false;

function lintFile(file) {
    fs.readFile(file, function (err, data) {
        if (err) {
            throw err;
        }
        data = data.toString("utf8");
        var lint = linter.lint(data, parsed);
        if (parsed.json) {
            console.log(JSON.stringify([file, lint]));
        } else {
            reporter.report(file, lint);
        }
        if(lint.errors.length > 0) {
            errors = true;
        }
    });
}

parsed.argv.remain.forEach(lintFile);

var on_exit = false;

process.on('exit', function () {
    if(errors && !on_exit) {
        on_exit = true;
        process.exit(1);
    }
});
