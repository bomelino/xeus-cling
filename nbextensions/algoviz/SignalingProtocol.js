class SignalingProtocol {

    static connections = [];

    static configuration = {
        iceServers : [{ urls : 'stun:stun.l.google.com:19302' }]
    };

    /**
     * This operation adds all message handlers to the given socket.
     * 
     * The generich handler offerCallback(connection,data) is called if
     * an offer is received and answered. The object data contains the
     * following attributes:
     * - id : The id of the connection
     * - to and from : The ids of the peers
     * - details : The details send by from
     * 
     * @param {socket.io.socket} socket A brokered socket
     * @param {function} offerCallback The callback
     */
    static apply(socket, offerCallback) {
        socket.on("rtc_offer", (msg) => {
            SignalingProtocol.handleRTCOffer(socket,msg, offerCallback);
        });

        socket.on("rtc_answer", (msg) => {
            SignalingProtocol.handleRTCAnswer(msg);
        });

        socket.on("rtc_ice", (msg) => {
            SignalingProtocol.handleICECandidate(msg);
        });

        /*
        socket.on("rtc_renew_offer", (msg) => {
            SignalingProtocol.handleRenewedOffer(socket,msg);
        });
        */
    }


    static ontrack(connection, data, event) {};
    static onerror(err, details) { 
        console.error("[SignalingProtocol] Unhandled error : " + err);
        console.error(details);
    };

    /**
     * Send an offer.
     * 
     * It returns the connection.
     * datachannels is an object with the labels of datachannels as keys.
     * After the sending of the offer, the keys contain the corresponding datachannels.
     * 
     * After the connection is established, callback(connection) is called.
     * 
     * @param {*} socket The socket on which the offer is sent
     * @param {*} from My own broker id
     * @param {*} to The recievers broker id
     * @param {*} tracks The streams to be added
     * @param {*} datachannels An object containig the labels of all required datachannels
     * @param {*} details Details for additional handling at receiver
     * @param {function} callback The callback
     */
    static sendOffer(socket,from,to,tracks,datachannels, details, callback) {
        var id;
        do {
            id = Math.random().toString(36);
        } while ( SignalingProtocol.connections[id] != null );
        SignalingProtocol.connections[id] = { id : id };
        var conn = SignalingProtocol.connections[id];
        conn.callback = callback;

        var connection = new RTCPeerConnection(SignalingProtocol.configuration);
        conn.connection = connection;

        Object.keys(datachannels).forEach( (label) => {
            datachannels[label] = connection.createDataChannel(label);
        });


        tracks.forEach( (track) => {
            connection.addTrack(track);
        });

        connection.onicecandidate = (event) => {
            socket.emit("relay", {
                type : "rtc_ice",
                to : to,
                from : from,
                id : id,
                candidate : event.candidate
            })
        };

        connection.createOffer()
            .then( (offer) => {
                connection.setLocalDescription(offer)
                    .then( (desc) => {
                        socket.emit("relay",{
                            type : "rtc_offer",
                            to : to,
                            from : from,
                            offer : offer,
                            id : id,
                            details : details
                        });
                    })
                    .catch( (err) => {
                        console.error("[SignalingProtocol] Error while creating offer:");
                        console.error(err);
                        SignalingProtocol.onerror("error local description", { err : err, to : to });
                    });
            })
            .catch( (err) => { 
                console.error("[SignalingProtocol] Error while creating offer:");
                console.error(err);    
                SignalingProtocol.onerror("error create offer", { err : err ,to : to });
            });

        return connection;
    }


    /**
     * Send a new offer to an existing connection
     * 
     * @param {*} connection The connection
     * @param {*} socket The socjet used for signaling
     * @param {*} from The senders id
     * @param {*} to The receivers id
     * @param {*} details The details of the offer
     */
    static renewOffer(connection,socket,from,to,details) {
        console.log("RENEW");

        var id = null;
        Object.keys(SignalingProtocol.connections).forEach( (key) => {
            if ( SignalingProtocol.connections[key].connection == connection ) {id = key};
        });
        if (id == null) {
            console.error("[SignalingProtocol] Unknown connection");
            return;
        }

        connection.createOffer()
            .then( (offer) => {
                connection.setLocalDescription(offer)
                    .then( (desc) => {
                        socket.emit("relay",{
                            type : "rtc_offer",
                            to : to,
                            from : from,
                            offer : offer,
                            id : id,
                            details : details
                        });
                    })
                    .catch( (err) => {
                        console.error("[SignalingProtocol] Error while creating offer:");
                        console.error(err);
                        SignalingProtocol.onerror("error new local description", { err : err, to : to });
                    });
            })
            .catch( (err) => { 
                console.error("[SignalingProtocol] Error while creating offer:");
                console.error(err);    
                SignalingProtocol.onerror("error create new offer", { err : err, to : to  });
            });

        return connection;
    }


    /**
     * Handle an RTC offer on the receivers side
     * 
     * data.from - origin of offer
     * data.to - target of offer
     * data.offer - the offer
     * data.details - some details of the offer
     *      audio,screen,webcam - track ids
     *      origin - driver, navigator, peer
     * @param {*} data 
     */
    static handleRTCOffer(socket,data,offerCallback) {
        var conn = SignalingProtocol.connections[data.id];
        if ( conn == null ) {
            var connection = new RTCPeerConnection(SignalingProtocol.configuration);
            conn = { id : data.id, connection : connection };
            SignalingProtocol.connections[data.id] = conn;
        }

        connection = conn.connection;
        // connection.ondatachannel = (event) => {
        //     SignalingProtocol.ontrack(connection,data,event);
        // };

        connection.ontrack = (event) => {
            SignalingProtocol.ontrack(connection,data,event);
        };

        connection.setRemoteDescription(new RTCSessionDescription(data.offer));

        connection.createAnswer()
            .then( (answer) => {
                console.log("[SignalingProtocol] Sending answer to " + data.from );
                connection.setLocalDescription(answer);
                if ( offerCallback ) offerCallback.call(null,connection,data);
                socket.emit("relay", {
                    type : "rtc_answer",
                    to : data.from,
                    from : data.to,
                    id : data.id,
                    answer : answer,
                    origin: data.origin
                });
            })
            .catch( (err) => {
                console.error("[SignalingProtocol] Error during the handling of an offer from " + data.from);
                console.error(err);
                SignalingProtocol.onerror("error sending answer",{ err : err , from : data.from });
            });
    }


    /**
     * Handle a renewed offer
     * 
     * @param {*} socket 
     * @param {*} data 
     */
    static handleRenewedOffer(socket,data) {
        var conn = SignalingProtocol.connections[data.id];
        if ( conn == null ) {
            console.error("[SignalingProtocol] Error during renegotiation");
            SignalingProtocol.onerror("error renew",{ from : data.from });
            return;
        }

        var connection = conn.connection;
        console.log(data.offer.type);
        connection.setRemoteDescription(data.offer);

        var id = null;
        Object.keys(SignalingProtocol.connections).forEach( (key) => {
            if ( SignalingProtocol.connections[key] == connection ) {id = key};
        });
        if (id == null) return;

        connection.createAnswer()
            .then( (answer) => {
                console.log("[SignalingProtocol] Sending answer to " + data.from );
                connection.setLocalDescription(answer);
                socket.emit("relay", {
                    type : "rtc_answer",
                    to : data.from,
                    from : data.to,
                    id : data.id,
                    answer : connection.localDescription
                });
            })
            .catch( (err) => {
                console.error("[SignalingProtocol] Error during the renegotiation from " + data.from);
                console.error(err);
                SignalingProtocol.onerror("error sending renew answer",{ err : err , from : data.from });
            });
    };



     /**
     * Handle an RTC answer
     * 
     * data.from - origin of offer
     * data.to - target of offer
     * data.answerr - the answer
     * @param {*} data 
     */
    static handleRTCAnswer(data) {
        console.log("[SignalingProtocol] " + data.to + " Answer received from driver " + data.from);

        var offer = SignalingProtocol.connections[data.id];
        if ( offer == null ) {
            console.error("[SignalingProtocol] Answer to unknown offer received");
            SignalingProtocol.onerror("error unknown answer",{ id : data.id });
            return;
        }

        offer.connection.setRemoteDescription(new RTCSessionDescription(data.answer))
            .then( (desc) => {
                if ( offer.callback ) {
                    offer.callback.call(this,offer.connection,data);
                }
            })   
            .catch( (err) => {
                console.error("[AlgoViz] Error during handling of answer");
                console.error(err);
                SignalingProtocol.onerror("error answer",{ err : err , from : data.from });
            });
    }


    /**
     * Handle an ICE candidate 
     * 
     * @param {*} data 
     */
    static handleICECandidate(data) {        
        var conn = SignalingProtocol.connections[data.id];

        if ( conn == null ) {
            return;
        }

        if (data.candidate) conn.connection.addIceCandidate(data.candidate);
    }

}