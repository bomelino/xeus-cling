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
 * AlgoViz
 * 
 * This extension provides a panel which can be used
 * for visualisations.
 * 
 */

var AlgoVizConfig = {};

define([
    'require',
    'base/js/namespace',
    'base/js/utils',
    'services/config'
], function (
    requirejs,
    Jupyter,
    utils,
    configmod
) {
    //'use strict';
    
    /**
     * Extension loader
     */
    function load_ipython_extension() {

        console.log("[AlgoViz] Starting tree extension ...");

        requirejs(['./Logos','./Hint','./Overlay'], function () {
            Overlay.inject();
            console.log("[AlgoViz] extension started");

            // Inject stylsheet
            var link = document.createElement('link');
            link['rel'] = 'stylesheet';
            link.setAttribute('type','text/css');
            link.setAttribute('href', requirejs.toUrl('./AlgoViz.css'));
            document.head.appendChild(link);
        
            var link = document.createElement('link');
            link['rel'] = 'stylesheet';
            link.setAttribute('type','text/css');
            link.setAttribute('href', requirejs.toUrl('./Overlay.css'));
            document.head.appendChild(link);

            if ( localStorage.getItem("AlgoVizConfig") != null ) {
                /* try {
                    var local = JSON.parse(localStorage.getItem("AlgoVizConfig"));
                    for ( var key in local ) {
                        if ( key!="update_url" ) {
                            AlgoVizConfig[key] = local[key];
                        }
                    }
                } catch (err) {        
                } */
            }

            var config = new configmod.ConfigSection('tree',{ base_url : utils.get_body_data("baseUrl") } );
            config.loaded.then(function() {
                /* brauchen wir nicht?
                if ( !AlgoVizConfig.update ) {
                    AlgoVizConfig.update = config.data.algoviz.update;
                }

                if ( !AlgoVizConfig.update_url ) {
                    AlgoVizConfig.update_url = config.data.algoviz.update_url;
                }

                if ( !AlgoVizConfig.update_path ) {
                    AlgoVizConfig.update_path = config.data.algoviz.update_path;
                }
                */

                /*
                requirejs(['./Overlay','./Hint'], function () {
                    Overlay.inject();
                });
                */

                /*
                var but = document.getElementById("aud-update-button");
                if ( (AlgoVizConfig.update == "true") && (AlgoVizConfig.update_url != null ) ) {
                    but.addEventListener("click", () => { updateHome(); });
                }

                var audticker = document.getElementById("aud-ticker-frame");
                audticker.mouseIsOver = false;
                var req = new XMLHttpRequest();
                var ticker = null;
                req.addEventListener('load', (event) => {
                    if ( req.status == 200 ) {
                        audticker.innerHTML = req.responseText;
                        ticker= document.getElementById("ticker");
                        if (( ticker != null ) && (ticker.children.length > 0 )) {
                            var child = ticker.children[0];
                            child.style.display = "block";
                        }
                    }
                });
                req.open("GET","https://abbozza.informatik.uos.de/aud/jupyter/ticker/ticker.php");
                req.send();

                audticker.addEventListener("mouseenter", (event) => {
                    audticker.mouseIsOver = true;
                });
                audticker.addEventListener("mouseleave", (event) => {
                    audticker.mouseIsOver = false;
                });
                audticker.addEventListener("click", (event) => {
                    nextMessage(true);
                });

                setInterval( nextMessage ,5000);

                if ( (AlgoVizConfig.update == "true") && (AlgoVizConfig.update_url != null ) ) {
                    var updateButton = document.createElement("button");
                    updateButton.className=("btn btn-default btn-xs");
                    // updateButton.innerHTML = "<i class='fa fa-download'></i>&nbsp;Download AuD material";
                    updateButton.innerHTML = AuDLogo(12) + "&nbsp;Download AuD material";
                    updateButton.style.marginLeft = "10px";
                    updateButton.onclick = (event) => { updateHome(); };
                    document.querySelector("#refresh_notebook_list").parentNode.appendChild(updateButton);
                }
                */
            });
            config.load();
        });
    }   


    function nextMessage(force = false) {

        var audticker = document.getElementById("aud-ticker-frame");
        var ticker= document.getElementById("ticker");

        console.log(ticker.children.length);
        if (ticker.children.length <= 1) return;

        if (( ticker != null ) &&  (ticker.children.length > 1 ) && (!audticker.mouseIsOver || force)) {
            var child = ticker.children[0];
            var child2 = ticker.children[1];
            child2.style.display = "block";    

            var anim = child.animate([
                { transform: "translate(0,0)" },
                { transform: "translate(0,-100%)" }
            ],{
                duration: 500
            });

            anim.onfinish = () => {
                child.style.display = "none";
                ticker.removeChild(child);
                ticker.appendChild(child);
            }

            child2.animate([
                { transform: "translate(0,0)" },
                { transform: "translate(0,-100%)" }
            ],{
                duration: 500
            });
        }
    }
        /*
    readConfig = function() {
        // Default configuration
        AlgoVizConfig = {
            broker: "http://localhost:8080",
            webcam : true
        };

        var config = Jupyter.tree.config.data.algoviz;
        for ( var key in config ) {
            AlgoVizConfig[key] = config[key];
        }

        if ( localStorage.getItem("AlgoVizConfig") != null ) {
            try {
                var local = JSON.parse(localStorage.getItem("AlgoVizConfig"));
                for ( var key in local ) {
                    if ( key!="update_url" ) {
                        AlgoVizConfig[key] = local[key];
                    }
                }
            } catch (err) {        
            }
        }
        
    }
    */

    function updateHome() {
        // Jupyter.keyboard_manager.disable();
        var dialog = new OverlayFrame({
            icon: "<div style='transform: translate(0,1px);'>" + AlgoVizIcon(20,"#5b67a5","black") + "</div>&nbsp;",
            width: "500px",
            title: "AlgoViz Update Home",
            items: [
                {
                    type: "label",
                    text: "<p><b>Shall I download the material from the given URL?</b></p><br/>" +
                          "<p>The files will <b>REPLACE</b> those in your local directory!</p>"
                },{
                    type: "text",
                    id: "url",
                    label: "URL of material",
                    value: AlgoVizConfig.update_url
                },

            ],
            buttons: [
                {
                    title: "Cancel",
                    tooltip: "Do nothing",
                    width: "100px",
                    callback: (dialog) => {
                        console.log("HIER");
                        // Jupyter.keyboard_manager.enable();
                        dialog.hide();
                    }
                }, {
                    title: "Ok",
                    tooltip: "Update your home",
                    width: "100px",
                    callback: (dialog) => {
                        var values = dialog.getValues();
                        AlgoVizConfig.update_url = values.url;
                        localStorage.setItem("AlgoVizConfig", JSON.stringify(AlgoVizConfig));
                        doUpdate();
                        dialog.hide();
                    }
                }
            ]
        });
        dialog.show();
    }


    function doUpdate() {
        new Hint("<p>Downloading material from " + AlgoVizConfig.update_url + "!</b>", 2000);
        var request = new XMLHttpRequest();
        request.open("GET","/algoviz/update?url=" + AlgoVizConfig.update_url ); // + "&path=" + AlgoVizConfig.update_path);
        request.onload = (event) => {
            if ( request.status == 200 ) {
                new Hint("<p>Material successfully updated!</b>", 2000);
            } else {
                new Hint(request.responseText, 5000);
            }
        }
        request.send();
    }


    return {
        load_ipython_extension : load_ipython_extension
    };

});

