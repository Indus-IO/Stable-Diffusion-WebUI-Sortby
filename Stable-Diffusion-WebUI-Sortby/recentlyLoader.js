var recently;

var xhr = new XMLHttpRequest();
xhr.open('GET', 'file=recently.dat', true);

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var fileContent = xhr.responseText;
        var lines = fileContent.split('\n');
        recently = lines.map(function (line) {
            return line.trim();
        });
    }
};

xhr.send();