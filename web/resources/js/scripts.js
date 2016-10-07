var webSocket;
var messages = document.getElementById("messages");
var socket_status = document.getElementById("socket-status");

/**
 * Open the websocket
 * @returns {undefined}
 */
function openSocket() {
    // Ensures only one connection is open at a time
    if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
        writeResponse("WebSocket is already opened.");
        return;
    }

    // Create a new instance of the websocket
    webSocket = new WebSocket("ws://localhost:8080/DemoWebsocketApplication/echo");

    // Update the socket status
    checkSocketStatus();

    // Bind the onopen handler
    webSocket.onopen = function (event) {

        // Update the socket status
        checkSocketStatus();

        if (event.data === undefined)
            return;
        writeResponse(event.data);
    };

    // Bind the onmessage handler
    webSocket.onmessage = function (event) {
        console.log("Message Received: " + event.data);
        writeResponse(event.data);
    };

    // Bind the onclose handler
    webSocket.onclose = function (event) {
        // Update the socket status
        checkSocketStatus();
        //messages.innerHTML += "<br/>" + "This connection has been closed by user.";
        updateMessages(getBlockquote("You've closed this connection.", "system", new Date().getTime()));
    };
}

/**
 * Send the text out through the websocket
 * @returns {undefined}
 */
function sendText() {
    var json = JSON.stringify({
        "type": "text",
        "data": document.getElementById("messageinput").value,
    });
    webSocket.send(json);
}

/**
 * Close the websocket
 * @returns {undefined}
 */
function closeSocket() {
    webSocket.close();
}

/**
 * Write the JSON response to this html
 * @param {type} json
 * @returns {undefined}
 */
function writeResponse(json) {

    // Parse the received JSON string
    var jsonResponse = JSON.parse(json);
    var output;
    var sender;
    var sent_time;

    // Determine the type of message recieved and handle accordingly
    switch (jsonResponse.type) {
        case "image":
        {
            output = "<img src=\'" + jsonResponse.data + "\'/>";
            break;
        }
        case "text":
        {
            output = jsonResponse.data;
            sender = jsonResponse.sender;
            sent_time = jsonResponse.received_time;
            break;
        }
    }

    //messages.innerHTML += "<blockquote class=\"twitter-tweet\">" + output + "</blockquote>";
    //messages.innerHTML += getBlockquote(output, sender, sent_time);
    updateMessages(getBlockquote(output, sender, sent_time));
}

/**
 * Checks the status of the socket and update the indicator element
 * @returns {undefined}
 */
function checkSocketStatus() {
    if (webSocket === undefined) {
        socket_status.innerHTML = wrapInSpan("socket-undefined", "undefined");
        return;
    }

    if (webSocket.readyState === WebSocket.CLOSED) {
        socket_status.innerHTML = wrapInSpan("socket-closed", "closed");
        return;
    }

    if (webSocket.readyState === WebSocket.CONNECTING) {
        socket_status.innerHTML = wrapInSpan("socket-connecting", "connecting");
        return;
    }

    if (webSocket.readyState === WebSocket.CLOSING) {
        socket_status.innerHTML = wrapInSpan("socket-closing", "closing");
        return;
    }

    if (webSocket.readyState === WebSocket.OPEN) {
        socket_status.innerHTML = wrapInSpan("socket-open", "open");
        return;
    }
}
/**
 * Helper function to wrap a given string in a span with a given id
 * @param {type} id
 * @param {type} string
 * @returns {String}
 */
function wrapInSpan(id, string) {
    id_prefix = "<span id=\"";
    id_suffix = "\">";
    close_suffix = "</span>";
    return id_prefix.concat(id).concat(id_suffix).concat(string).concat(close_suffix);
}

function getBlockquote(content, sender, time) {
    prefix = "<blockquote class=\"twitter-tweet\">";
    suffix = "</blockquote>";
    para_prefix = "<p>";
    para_suffix = "</p>";
    return prefix.concat(para_prefix).concat(content).concat(para_suffix)
            .concat("– ").concat(sender)
            .concat(" ").concat(wrapInSpan("time", getDateString(time)));
}

function getDateString(time) {
    var date = new Date(time);
    var options = {day: 'numeric', year: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit'};
    return date.toLocaleDateString('en-US', options);
}

function updateMessages(content) {
    content = parseForBold(content);
    content = parseForItalic(content);
    messages.innerHTML += content;
    messages.scrollTop = messages.scrollHeight;
}

/**
 * Run on body load
 * @returns {undefined}
 */
function bodyLoad() {
    // Check the socket status for the first time
    checkSocketStatus();
    // Bind the "enter" keypress to the messageinput field
    document.getElementById("messageinput")
        .addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                document.getElementById("send-message").click();
            }
        });
}

/**
 * Parse a string for bold intents, wrap string that is book-end with asterisk
 * and wrap it with <span style="font-weight: bold;"> and </span>
 * @param {type} content
 * @returns {undefined} */
function parseForBold(content) {
    var pattern = new RegExp("\\*([^*]*)\\*", "g");
    return content.replace(pattern, "<span style=\"font-weight: bold;\">$1</span>");
}

function parseForItalic(content) {
    var pattern = new RegExp("\\_([^_]*)\\_", "g");
    return content.replace(pattern, "<span style=\"font-style: italic;\">$1</span>");
}