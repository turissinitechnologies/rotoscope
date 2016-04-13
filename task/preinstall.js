
var messages = [
    'test',
    'again'
];

messages.forEach(function (message) {
    console.log.apply(console, message);
});
