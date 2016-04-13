var fs = require('fs');


function printMessage (version) {

    var messages = [
        '',
        '',
        '',
        '',
        '**********************************',
        '**',
        '**  Rotoscope v' + version,
        '**  Thanks for using rotoscope!',
        '**',
        '**',
        '**  Join the community!',
        '**',
        '**',
        '**  Slack: http://rotoscope-slack-invite.turissini.co/',
        '**  Github: https://github.com/turissinitechnologies/rotoscope',
        '**  Twitter: https://twitter.com/turissinitech',
        '**',
        '**',
        '**********************************',
        '',
        '',
        '',
        ''
    ];

    messages.forEach(function (message) {
        console.log(message);
    });
}

fs.readFile(__dirname + '/../package.json', function (err, contents) {
    var json = JSON.parse(contents.toString());

    printMessage(json.version);
});
