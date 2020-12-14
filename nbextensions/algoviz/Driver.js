/* 
 * The MIT License
 *
 * Copyright 2020 Michael Brinkmeier, AG Didaktik der Informatik.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
* This class handles the socket connection to the broker
*/
class Driver {

    static io = null;

    static brokerChannel = null;
    static ownId = null;
    static driverConn = null;
    static navigators = [];
    static connected = false;
    static pendingRequests = [];

    static webcamStream = null;
    static screenStream = null;
    static audioStream = null;

    static video = null;

    static dataChannel = null;

    /**
     * Connect to the broker
     * 
     * @param {string} broker The broker's URL
     */
    static connect(broker) {
        // Possible errors:
        // - broker not reachable

        if (Driver.socket != null) {
            Driver.disconnect();
        }

        Driver.socket = Driver.io(broker, { autoConnect: false, reconnection: false });

        // State handlers
        Driver.socket.on("connect", () => {
            Driver.socket.emit("register", {});
        });

        Driver.socket.on('connect_error', () => {
            Driver.showError("<h4>Could not connect to Broker!</h4><p>The URL <b>" + broker + "</b> may be wrong?");
        });

        Driver.socket.on('connect_timeout', () => {
            Driver.showError("Could not connect to Broker due to timeout!");
        });

        Driver.socket.on('disconnect', () => {
            Driver.showError("Disconnected from Broker!");
        });


        // Setup broker protocol
        Driver.socket.on("registered", (data) => {
            Driver.registered(data.id);
        });


        // Signaling prototcol
        Driver.socket.on("request", Driver.handleRTCRequest);

        SignalingProtocol.apply(Driver.socket, (connection, data) => {
            if (data.origin != "peer") {
                Driver.receivedRTCConnection(connection, data);
            }
        });

        SignalingProtocol.onerror = Driver.handleError;



        SignalingProtocol.ontrack = (connection, data, event) => {
            console.log("[Driver] Received track");
            var navigator = Driver.navigators[data.from];
            if (navigator == null) return;
            switch (data.details.origin) {
                case "navigator":
                    if (event.track.kind == "audio") {
                        navigator.audio = event.track;
                    }
                    navigator.video.addTrack(event.track);
                    break;
                default:
            }
        };

        Driver.socket.open();
    }



    /**
     * Disconnect from broker and all navigators
     */
    static disconnect() {
        Driver.connected = false;
        Driver.socket.send("unregister", { id: Driver.ownId });
        Driver.ownId = null;

        if (Driver.video != null) Driver.video.close();

        Driver.socket.close();
        Driver.socket = null;

        for (var id in Driver.navigators) {
            var navigator = Driver.navigators[id];
            navigator.receiver.close();
            navigator.sender.close();
            navigator.video.close();
        };
        Driver.navigators = [];

        new Hint("<p style='font-size: 110%'><b>Disconnected from broker and navigators!</b><p>", 5000);

        return false;
    }


    /**
     * Disconnect one navigator.
     * 
     * @param {Object} The navigator description
     */
    static disconnectNavigator(navigator) {
        Driver.removeAudioFromPeers(navigator);
        if (navigator.receiver) navigator.receiver.close();
        if (navigator.sender) navigator.sender.close();
        if (navigator.video) navigator.video.close();
        new Hint("<p><b>Closing connection to navigator " + navigator.name + "</b></p>", 5000);
        delete Driver.navigators[navigator.id];
    }


    /**
     * This is called as soon as the Driver is registered at the broker.
     * 
     * @param {Object} msg The message send by the broker.
     */
    static async registered(id) {
        // Possible errors
        // - could not get video stream
        Driver.connected = true;
        new Hint("<p style='font-size: 110%'><b>Connected to broker as " + id + "</b><p>", 5000);

        Driver.ownId = id;

        // Setup local webcam
        await Driver.getWebcam();
        if (Driver.webcamStream != null) {
            Driver.video = new Video();
            Driver.video.setName("Driver");
            Driver.webcamStream.getTracks().forEach((track) => {
                Driver.video.addTrack(track);
            })

            Driver.showConnectedInfo();
        } else {
            new Hint("<b>Blöd gelaufen</b>", 5000);
        }
    }



    /**
     * This function handles a request by a navigator.
     * 
     * @param {Object} msg The message from the navigator
     */
    static handleRTCRequest(msg) {
        if (msg.to != Driver.ownId) {
            console.log("[AlgoViz] Received request with wrong id");
            Driver.socket.send("relay", {
                type: "refused",
                to: msg.from,
                from: Driver.ownId,
                reason: "unknown driver"
            });
            return;
        }

        Driver.pendingRequests.push(msg);
        if (Driver.pendingRequests.length == 1) {
            Driver.executeRequest(Driver.pendingRequests[0]);
        }        
    }


    static executeRequest(msg) {
        var dialog = new OverlayFrame({
            icon: "<i width='20px' class='driver-icon'></i>&nbsp;",
            width: "500px",
            title: "AlgoViz Mob Programming",
            items: [
                {
                    type: "label",
                    text: "Navigator " + msg.details.name + " requests connection with the follwoing message:"
                },
                {
                    type: "text",
                    id: "msg",
                    label: "",
                    readonly: true,
                    value: msg.details.msg
                }
            ],
            buttons: [
                {
                    title: "Refuse",
                    tooltip: "Refuse connection",
                    width: "100px",
                    callback: (dialog) => {
                        Driver.pendingRequests.shift();
                        Driver.socket.emit("relay", {
                            type: "refused",
                            to: msg.from,
                            from: Driver.ownId,
                            reason: "refused by driver"
                        });
                        dialog.hide();
                    }
                }, {
                    title: "Accept",
                    tooltip: "Accept connection",
                    width: "100px",
                    callback: (dialog) => {
                        dialog.hide(() => {
                            var navId = msg.from;
                            console.log("[Driver] Accepted request from navigator " + navId);

                            var navigator = {
                                id: navId,
                                socket: Driver.socket,
                                name : msg.details.name,
                                color : msg.details.color,
                                video: new Video(msg.details.name, msg.details.color),
                                audio: null,
                                cursor: new Cursor(msg.details.name, msg.details.color),
                                sender: null,
                                receiver: null
                            };
                            Driver.navigators[navId] = navigator;
                            Driver.sendRTCOffer(navigator);
                        });
                    }
                }
            ]
        });
        dialog.show();
    }


    /**
     * Send a requested offer to the navigator
     * 
     * @param {Object} navi The navigator description
     */
    static async sendRTCOffer(navi) {
        var details = { origin: "driver" };

        // Ad the tracks
        await Driver.getAudio();
        await Driver.getScreen();

        if ((Driver.audioStream == null) || (Driver.screenStream == null)) {
            new Hint("<p>Could not connect to to webcam and microphone!</p>", 5000);
            // Remove offer from queue
            Driver.pendingRequests.shift();
            Driver.disconnectNavigator(navi);
            Driver.socket.emit("relay", {
                type: "refused",
                to: navi.id,
                from: Driver.ownId,
                reason: "refused by driver"
            });
            return;
        }

        var tracks = [];
        Driver.audioStream.getTracks().forEach((track) => {
            details.audio = track.id;
            tracks.push(track);
        });

        Driver.screenStream.getTracks().forEach((track) => {
            details.screen = track.id;
            tracks.push(track);
        });

        // Add peer tracks
        details.peers = [];
        Object.keys(Driver.navigators).forEach((id) => {
            var nav = Driver.navigators[id];
            if (nav != null) {
                if (nav.audio != null) {
                    tracks.push(nav.audio);
                    details.peers.push({
                        id : nav.id,
                        name : nav.name,
                        color : nav.color,
                        audio : nav.audio.id
                    });
                }
            }
        });

        // Send the offer. If it is completed
        var channels = { data: null };
        navi.sender = SignalingProtocol.sendOffer(
            Driver.socket, Driver.ownId, navi.id, tracks,
            channels, details, (connection, data) => {
                if (data.origin != "peer") {
                    navi.dataChannel = channels.data;
                    // Check if other requests persist
                    Driver.pendingRequests.shift();
                    if (Driver.pendingRequests.length > 0) {
                        Driver.executeRequest(Driver.pendingRequests[0]);
                    }
                }
            }
        );
    }


    /**
     * Handle an offer received by a navigator (the receiving side)
     * 
     * @param {RTCPeerConnection} connection The connection
     * @param {Object} data The data for the offer
     */
    static receivedRTCConnection(connection, data) {
        var navigator = Driver.navigators[data.from];

        if (navigator == null) {
            Driver.pendingRequests.shift();
            Driver.disconnectNavigator(navi);
            Driver.socket.send("relay", {
                type: "refused",
                from: Driver.ownId,
                to: data.from,
                reason: "not expecting offer"
            });
            return;
        }

        var navId = data.from;

        console.log("[AlgoViz] Received offer from navigator " + navId);

        navigator.receiver = connection;

        switch (data.details.origin) {
            case "navigator":
                Driver.setupNavigatorConnection(navigator);
                break;
            default:
        }

        Driver.placeVideo(navigator);
        Driver.sendAudioToPeers(navigator);
    }

    /**
     * Setup the event handlers for a new Navigator connection
     * 
     * @param {Object} navigator The navigator description
     */
    static setupNavigatorConnection(navigator) {
        navigator.receiver.onconnectionstatechange = (event) => {
            switch (navigator.receiver.connectionState) {
                case "connected":
                    new Hint("<p style='font-size: 110%'><b>Navigator "+ navigator.name + " connected! We recommend switching to Fullscreen!</b><p>", 10000);
                    break;
                case "disconnected":
                    Driver.disconnectNavigator(navigator);
                    break;
                case "failed":
                    Driver.disconnectNavigator(navigator);
                    break;
                case "closed":
                    Driver.disconnectNavigator(navigator);
                    break;
            }
        };

        navigator.receiver.ondatachannel = (event) => {
            if (event.channel.label == "data") {
                navigator.dataChannel = event.channel;
                // Add mouse protocol to data channel
                navigator.dataChannel.onmessage = (msg) => {
                    try {
                        var obj = JSON.parse(msg.data);
                        switch (obj.type) {
                            case "mouse-move":
                                navigator.cursor.setPos(obj.x * window.innerWidth, obj.y * window.innerHeight);
                                break;
                            case "mouse-show":
                                navigator.cursor.show();
                                break;
                            case "mouse-hide":
                                navigator.cursor.hide();
                                break;
                            case "navigator-disconnect":
                                Driver.disconnectNavigator(navigator);
                                break;
                        }
                    } catch (err) {
                        console.error("[Driver] Error on data channel");
                        console.error(err);
                    }
                }
            }
        };
    }


    /**
     * Show the info, if action is triggered in frontend
     */
    static async showInfo() {
        if (Driver.connected == false) {
            Driver.showConnectInfo();
        } else {
            Driver.showConnectedInfo();
        }
    }


    /**
     * Show information before connection to broker!
     */
    static async showConnectInfo() {
        Jupyter.keyboard_manager.disable();
        var dialog = new OverlayFrame({
            icon: "<div style='transform: translate(0,1px);'>" + AlgoVizIcon(20,"#5b67a5","black") + "</div>&nbsp;",
            width: "500px",
            title: "AlgoViz Mob Programming",
            items: [
                {
                    type: "label",
                    text: "<p><b>You are currently not registered at a broker!</b></p><br/>" +
                        "<p>To allow other users as <b>navigators</b>, you have to register at a broker.</p>"
                },
                {
                    type: "text",
                    id: "broker",
                    label: "URL of your favorite broker",
                    value: AlgoVizConfig.broker,
                },
                {
                    type: "switch",
                    id: "webcam",
                    label: "We recommend using a webcam. But you may turn it off.",
                    ontooltip: "Webcam is used",
                    offtooltip: "Webcam is not used",
                    value: AlgoVizConfig.webcam
                }
            ],
            buttons: [
                {
                    title: "Cancel",
                    tooltip: "Do nothing",
                    width: "100px",
                    callback: (dialog) => {
                        Jupyter.keyboard_manager.enable();
                        dialog.hide();
                    }
                }, {
                    title: "Restore Default",
                    tooltip: "Restore the default configuration",
                    width: "120px",
                    callback: (dialog) => {
                        Jupyter.keyboard_manager.enable();
                        localStorage.removeItem("AlgoVizConfig");
                        AlgoViz.readConfig();
                        dialog.hide();
                        new Hint("<p>Config restored!</b>", 2000);
                        this.showConnectInfo();
                    }
                }, {
                    title: "Save Config",
                    tooltip: "Save configuration, but do not connect to broker",
                    width: "100px",
                    callback: (dialog) => {
                        Jupyter.keyboard_manager.enable();
                        var values = dialog.getValues();
                        AlgoVizConfig.broker = values.broker;
                        AlgoVizConfig.webcam = values.webcam;
                        localStorage.setItem("AlgoVizConfig", JSON.stringify(AlgoVizConfig));
                        dialog.hide();
                        new Hint("<p>Config saved!</b>", 2000);
                    }
                }, {
                    title: "Ok",
                    tooltip: "Connect to broker",
                    width: "100px",
                    callback: (dialog) => {
                        var values = dialog.getValues();
                        AlgoVizConfig.broker = values.broker;
                        AlgoVizConfig.webcam = values.webcam;
                        localStorage.setItem("AlgoVizConfig", JSON.stringify(AlgoVizConfig));
                        dialog.hide(() => {
                            Driver.connect(AlgoVizConfig.broker);
                        });
                    }
                }
            ]
        });
        dialog.show();
    }


    /**
     * Show the information for an existing connection.
     * 
     * The callback(dialog) is executed if the user decides to disconnect.
     * 
     * @param {function} callback 
     */
    static async showConnectedInfo(callback = null) {
        Jupyter.keyboard_manager.disable();
        var dialog = new OverlayFrame({
            icon: "<div style='transform: translate(0,1px);'>" + DriverIcon(20,"black","black") + "</div>&nbsp;",
            width: "500px",
            title: "AlgoViz Mob Programming",
            items: [
                {
                    type: "label",
                    text: "<p><b>You are currently registered at a broker!</b></p>"
                },
                {
                    type: "text",
                    id: "url",
                    label: "Send this URL to your navigators",
                    value: Driver.socket.io.uri + "/navigator.html?" + Driver.ownId,
                    copy: true,
                    oncopyclick: () => { new Hint("<p>URL copied to clipboard!</p>", 1000); },
                    readonly: true
                }
            ],
            buttons: [
                {
                    title: "Disconnect",
                    tooltip: "Disconnect from broker",
                    width: "100px",
                    callback: (dialog) => {
                        Jupyter.keyboard_manager.enable();
                        dialog.hide(() => { Driver.disconnect(); });
                    }
                }, {
                    title: "Continue",
                    tooltip: "Stay connected",
                    width: "100px",
                    callback: (dialog) => {
                        Jupyter.keyboard_manager.enable();
                        dialog.hide(callback);
                    }
                }
            ]
        });
        dialog.show();
    }


    /************************/
    /**   ERROR HANDLING   **/
    /************************/


    static handleError(err, details) {
        switch (err) {
            case "error local description":
            case "error create offer":
            case "error new local description":
            case "error create new offer":
                var navi = Driver.navigators[details.to];
                Driver.showError("Error sending offer to " + navi.name + ": " + details.err);
                Driver.disconnectNavigator(navi);
                break;
            case "error sending answer":
            case "error sending renew answer":
                var navi = Driver.navigators[details.from];
                Driver.showError("Error creating answer to " + navi.name + ": " + details.err);
                Driver.disconnectNavigator(navi);
                break;
            case "error renew":
                var navi = Driver.navigators[details.from];
                Driver.showError("Error during renewal with " + navi.name + ": " + details.err);
                Driver.disconnectNavigator(navi);
                break;
            case "error unknown answer":
                Driver.showError("Received answer from unknown navigator");
                break;
            case "error answer":
                var navi = Driver.navigators[details.from];
                Driver.showError("Error receiving answer from " + navi.name + ": " + details.err);
                Driver.disconnectNavigator(navi);
                break;
        }
    };


    /**
     * Show an error message.
     * 
     * @param {string} msg The message as HTML
     */
    static showError(msg) {
        var dialog = new OverlayFrame({
            icon: "<i class='fa fa-exclamation-circle' style='color:red'></i>&nbsp;",
            title: "An Error occured",
            width: "400px",
            items: [
                {
                    type: "label",
                    text: msg
                }
            ],
            buttons: [
                {
                    title: "OK",
                    tooltip: "Got it!",
                    width: "100px",
                    callback: (dialog) => { dialog.hide(); }
                }
            ]
        });
        dialog.show();
    }


    /******************************/
    /**   SEND VIDEOS TO PEERS   **/
    /******************************/

    static sendAudioToPeers(nav) {
        Object.keys(Driver.navigators).forEach((key) => {
            var peer = Driver.navigators[key];
            if (nav != peer) {
                console.log("[Driver] Add track to navigator " + peer.id);
                var track = nav.audio;
                if (peer.sender) {
                    peer.sender.addTrack(track);
                    SignalingProtocol.renewOffer(peer.sender, Driver.socket, Driver.ownId, peer.id, { origin: "peer", peer: nav.id, name : nav.name, color: nav.color });
                }
            }
        });
    }


    static removeAudioFromPeers(nav) {
        Object.keys(Driver.navigators).forEach((key) => {
            var peer = Driver.navigators[key];
            if (nav != peer) {
                console.log("[Driver] Remove track from navigator " + peer.id);
                var track = nav.audio;
                if (peer.sender) {
                    peer.sender.getSenders().forEach( (sender) => {
                        if ( sender.track == track ) {
                            peer.sender.removeTrack(sender);
                            peer.dataChannel.send(JSON.stringify({
                                type : "peer-disconnect",
                                id : nav.id
                            }));
                        }
                    });
                    SignalingProtocol.renewOffer(peer.sender, Driver.socket, Driver.ownId, peer.id, { origin: "peer", peer: nav.id });
                }
            }
        });
    }


    /************************/
    /**   VIDEO HANDLING   **/
    /************************/


    static placeVideo(rec) {
        Driver.moveVideo(rec.video, Driver.video);
        Object.keys(Driver.navigators).forEach((key) => {
            var navigator = Driver.navigators[key];
            if (rec != navigator) {
                Driver.moveVideo(rec.video, navigator.video);
            }
        });
    }

    static moveVideo(video, fixed) {
        var bbox = video.div.getBoundingClientRect();
        var bbox2 = fixed.div.getBoundingClientRect();

        if ((bbox.x + bbox.width >= bbox2.x) && (bbox.x < bbox2.x + bbox2.width) &&
            (bbox.y + bbox.height >= bbox2.y) && (bbox.y < bbox2.y + bbox2.height)) {
            var dx = (bbox.x + bbox.width) - bbox2.x;
            var dy = (bbox2.y + bbox2.height) - bbox.y;
            if (dx <= dy) {
                video.div.style.left = (bbox.x - dx) + "px";
            } else {
                video.div.style.top = (bbox.y + dy) + "px";
            }
        }
    }


    /*************************/
    /**   STREAM HANDLING   **/
    /*************************/

    static getAudio() {
        if (Driver.audioStream != null) {
            return new Promise((resolve, reject) => {
                resolve(Driver.audioStream);
            });
        } else return navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then((stream) => { Driver.audioStream = stream })
            .catch((err) => {
                new Hint("Couldn't access microphone due to error: " + err, 5000);
                Driver.audioStream = null;
            });
    }


    static getWebcam() {
        if (Driver.webcamStream != null) {
            return new Promise((resolve, reject) => {
                resolve(Driver.webcamStream);
            });
        } else {
            return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((stream) => { Driver.webcamStream = stream })
                .catch((err) => {
                    new Hint("Couldn't access webcam due to error: " + err, 5000);
                    Driver.webcamStream = null;
                });
        }
    }

    static getScreen() {
        if (Driver.screenStream != null) {
            return new Promise((resolve, reject) => {
                resolve(Driver.screenStream);
            });
        } else {
            return navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false })
                .then((stream) => { Driver.screenStream = stream; })
                .catch((err) => {
                    new Hint("Couldn't access screen due to error: " + err, 5000);
                    Driver.screenStream = null;
                });
        }
    }

}

