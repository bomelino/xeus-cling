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
    'base/js/events',
    'base/js/utils',
    'services/config',
    './socket.io',
    'services/kernels/serialize',    
], function (
    requirejs,
    Jupyter,
    events,
    utils,
    configmod,
    io,
    serialize
) {
    //'use strict';
    
    // Side panel geometry
    var side_panel_connect_contract = null;
    var side_panel_inner = null;
    var algoviz_container = null;

    var side_panel_min_rel_width = 10;
    var side_panel_max_rel_width = 90;
    var side_panel_start_width = 45;


    /**
     * Extension loader
     */
    function load_ipython_extension() {
        
        console.log("[AlgoViz] Starting extension ...");
        AlgoViz.readConfig();

        requirejs(['./View','./SignalingProtocol','./Video','./Logos','./Cursor','./Overlay','./Hint','./Driver'], function () {
            // window.AlgoViz.msgHandler["graph"] = GraphView.handle;
            Driver.io = io;
            Overlay.inject();
            AlgoViz.slideshowFrame = new SlideshowFrame(700,610);
            console.log("[AlgoViz] extension started");

            Jupyter.notebook.events.on("kernel_ready.Kernel", AlgoViz.kernelReady );

            Jupyter.notebook.kernel.comm_manager.register_target("algoviz",  (comm,msg) => {
                AlgoViz.comm = comm;
                console.log("[AlgoViz] Comm : Connection opened with id " + comm.comm_id);
    
                comm.on_msg( (msg) => {
                    AlgoViz.processMsg(msg.content.data);
                });
            });

            var hipr = Jupyter.notebook.kernel._handle_input_request;
            Jupyter.notebook.kernel._handle_input_request = (request) => {
                var prompt = request.content["prompt"];
                if ( prompt.startsWith("#ALGOVIZ") ) {
                    var parts = prompt.split("#");
                    var id = parts[2];
                    var view = AlgoViz.views[id];
                    var type = parts[3];
                    var content = {  value : "AlgoViz error: Unknown view!" };
                    if ( view != null ) {
                        if ( view.handleStdinRequest(type, content, serialize) ) {
                            var msg = Jupyter.notebook.kernel._get_msg("input_reply", content);
                            msg.channel = "stdin";
                            Jupyter.notebook.kernel._send(serialize.serialize(msg));
                        } else {
                        }
                    }
                } else if ( prompt.startsWith("#JSON#") ) {
                    var jsonStr = prompt.substring(6);
                    try {
                        var obj = JSON.parse(jsonStr);
                        AlgoViz.processMsg(obj);
                    } catch (e) {
                        console.error("[AlgoViz] Error parsing json in prompt: " + jsonStr);
                    }
                } else {
                    hipr.call(Jupyter.notebook.kernel,request);
                }
            }

            // AlgoViz.loadModule("World");
        } );


        // Inject stylsheet
        var link = document.createElement('link');
        link['rel'] = 'stylesheet';
        link.setAttribute('type','text/css');
        link.setAttribute('href', requirejs.toUrl('./AlgoViz.css'));
        document.head.appendChild(link);
        
        link = document.createElement('link');
        link['rel'] = 'stylesheet';
        link.setAttribute('type','text/css');
        link.setAttribute('href', requirejs.toUrl('./Overlay.css'));
        document.head.appendChild(link);

        // Set default handlers
        window.AlgoViz.registerDefaultHandlers();

        // Add action
        var action = {
            icon: 'algoviz-col-icon',
            // icon: 'fa-pencil-square-o', // a font-awesome class used on buttons, etc
            help    : 'Show/Hide AlgoViz',
            help_index : 'zz',
            handler : toggleAlgoViz
        };
        var prefix = 'algoviz';
        var action_name = 'toggle';

        var full_action_name = Jupyter.actions.register(action, action_name, prefix);
        Jupyter.toolbar.add_buttons_group([full_action_name]);

        // Add action
        var action2 = {
            icon: 'driver-icon', // a font-awesome class used on buttons, etc
            help    : 'Mob Programming',
            help_index : 'zz',
            handler : showDriverInfo
        };
        var action_name2 = 'navigator';

        full_action_name = Jupyter.actions.register(action2, action_name2, prefix);
        Jupyter.toolbar.add_buttons_group([full_action_name]);

        if ( (AlgoVizConfig.update == "true") && (AlgoVizConfig.update_url != null ) ) {
            // Add action
            var action3 = {
                icon: 'update-icon', // a font-awesome class used on buttons, etc
                help    : 'Update AuD material',
                help_index : 'zz',
                handler : updateHome
            };
            var action_name3 = 'updateHome';

            full_action_name = Jupyter.actions.register(action3, action_name3, prefix);        
            Jupyter.toolbar.add_buttons_group([full_action_name]);
        }


        // Create side panel
        var main_panel = $('#notebook_panel');
        var side_panel = $('#side_panel');

        side_panel = $('<div id="side_panel"/>');
        build_side_panel(main_panel, side_panel,
            side_panel_min_rel_width, side_panel_max_rel_width);
        hideAlgoViz();

        // Upgrade slideshows once
        var slideshows = document.getElementsByClassName("slideshow");
        Array.prototype.filter.call(slideshows, (show) => { 
            AlgoViz.upgradeSlideshow(show);
        });

        // Then run "thread"
        setInterval( () => {
            var slideshows = document.getElementsByClassName("slideshow");
            Array.prototype.filter.call(slideshows, (show) => { 
                AlgoViz.upgradeSlideshow(show);
            });
        }, 5000 );

        window.addEventListener("beforeunload", (event) => {
            if ( AlgoViz.comm ) AlgoViz.comm.close();
        });

    };

    /**
     * Build the side panel
     * 
     * @param {*} main_panel 
     * @param {*} side_panel 
     * @param {*} min_rel_width 
     * @param {*} max_rel_width 
     */
    function build_side_panel(main_panel, side_panel, min_rel_width, max_rel_width) {
        if (min_rel_width === undefined) min_rel_width = 0;
        if (max_rel_width === undefined) max_rel_width = 100;

        side_panel.css('display','none');
        side_panel.insertAfter(main_panel);

        var side_panel_splitbar = $('<div class="side_panel_splitbar"/>');
        side_panel_inner = $('<div class="side_panel_inner"/>');
        side_panel_connect_contract = $('<i class="btn fa fa-info hidden-print" style="background-color:red; color:white">');
        var side_panel_expand_contract = $('<i class="btn fa fa-expand hidden-print">');
        algoviz_container = $('<div class="algoviz_container"/>');
        algoviz_container.css({'grid-template-columns':"repeat(auto-fit," + window.AlgoViz.gridCol + "px)"});
        algoviz_container.css({'grid-template-rows':"repeat(auto-fit," + window.AlgoViz.gridRow + "px)"});
        algoviz_container.css({'grid-auto-rows': window.AlgoViz.gridRow + "px"});
    
        side_panel.append(side_panel_splitbar);
        side_panel.append(side_panel_inner);

        populate_side_panel(side_panel);

        side_panel.append(algoviz_container);

        side_panel_inner.append(side_panel_connect_contract);
        side_panel_inner.append(side_panel_expand_contract);

        side_panel_connect_contract.css({'background-color':'green'});
        side_panel_connect_contract.attr({title : 'AlgoViz ready'});

        side_panel_connect_contract.attr({
            title: 'About AlgoViz',
            'data-toggle': 'tooltip'
        }).tooltip({
            placement: 'right'
        }).click( function() {
            AlgoViz.showInfo();
            // Do nothing!
        });


        side_panel_expand_contract.attr({
            title: 'Expand/collapse AlgoViz',
            'data-toggle': 'tooltip'
        }).tooltip({
            placement: 'right'
        }).click(function () {
            var open = $(this).hasClass('fa-expand');
            var site = $('#site');
            slide_side_panel(main_panel, side_panel,
                open ? 100 : side_panel.data('last_width') || side_panel_start_width);
            $(this).toggleClass('fa-expand', !open).toggleClass('fa-compress', open);

            var tooltip_text = (open ? 'shrink to not' : 'expand to') + ' fill the window';
            if (open) {
                side_panel.insertAfter(site);
                site.slideUp();
                $('#header').slideUp();
                side_panel_inner.css({'margin-left': 0});
                side_panel_splitbar.hide();
            }
            else {
                side_panel.insertAfter(main_panel);
                $('#header').slideDown();
                site.slideDown({
                    complete: function() { events.trigger('resize-header.Page'); }
                });
                side_panel_inner.css({'margin-left': ''});
                side_panel_splitbar.show();
            }

            if (have_bs_tooltips) {
                side_panel_expand_contract.attr('title', tooltip_text);
                side_panel_expand_contract.tooltip('hide').tooltip('fixTitle');
            }
            else {
                side_panel_expand_contract.tooltip('option', 'content', tooltip_text);
            }
        });

        // bind events for resizing side panel
        side_panel_splitbar.mousedown(function (md_evt) {
            md_evt.preventDefault();
            $(document).mousemove(function (mm_evt) {
                mm_evt.preventDefault();
                var pix_w = side_panel.offset().left + side_panel.outerWidth() - mm_evt.pageX;
                var rel_w = 100 * (pix_w) / side_panel.parent().width();
                rel_w = rel_w > min_rel_width ? rel_w : min_rel_width;
                rel_w = rel_w < max_rel_width ? rel_w : max_rel_width;
                if ( side_panel.parent().width() - pix_w  > 300 ) {
                    main_panel.css('width', (100 - rel_w) + '%');
                    side_panel.css('width', rel_w + '%').data('last_width', rel_w);
                } else {
                    main_panel.css('width', "300px");
                }
            });
            return false;
        });
        $(document).mouseup(function (mu_evt) {
            $(document).unbind('mousemove');
        });

        return side_panel;
    };

    
    /**
     * Animate the appearance/disappearance of the side panel
     * 
     * @param {*} main_panel 
     * @param {*} side_panel 
     * @param {*} desired_width 
     */
    function slide_side_panel(main_panel, side_panel, desired_width) {

        var site = document.getElementById("site");
        var siteScroll = site.scrollTop;

        var panel = document.getElementById("notebook_panel");
        var panelScroll = panel.scrollTop;

        var anim_opts = {
            step : function (now, tween) {
                main_panel.css('width', 100 - now + '%');
            }
        };

        if (desired_width === undefined) {
            if (side_panel.is(':hidden')) {
                desired_width = (side_panel.data('last_width') || side_panel_start_width);
            }
            else {
                desired_width = 0;
            }
        }

        var visible = desired_width > 0;
        if (visible) {
            main_panel.css({float: 'left', 'overflow-x': 'auto'});
            side_panel.show();
            var cont = document.getElementById('notebook-container');
            cont.style.marginLeft = "";
            cont.style.maxWidth = "95%";
            cont.style.minWidth = "300px";
            panel.scrollTop = siteScroll;
        }
        else {
            anim_opts['complete'] = function () {
                side_panel.hide();
                main_panel.css({float : '', 'overflow-x': '', width: ''});
                site.scrollTop = panelScroll;
                cont.style.marginLeft = "";
            };
            var cont = document.getElementById('notebook-container');
            cont.style.maxWidth = "";
            cont.style.minWidth = "";
        }

        side_panel.animate({width: desired_width + '%'}, anim_opts);

        return visible;
    };


    function showDriverInfo() {
        Driver.showInfo();
    }


    function updateHome() {
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
                        Jupyter.keyboard_manager.enable();
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
        request.open("GET","/algoviz/update?" + AlgoVizConfig.update_url);
        request.onload = (event) => {
            if ( request.status == 200 ) {
                new Hint("<p>Material successfully updated!</b>", 2000);
            } else {
                new Hint(request.responseText, 5000);
            }
        }
        request.send();
    }

    /**
     * Fill the side panel with content
     * 
     * @param {} side_panel 
     */
    function populate_side_panel(side_panel) {
        var errPanel = $('<div class="algoviz_panel"><div id="algoviz-error"><i id="algoviz-error-icon" class="fa fa-exclamation-circle" style="color:red"/><div id="algoviz-error-msg"></div></div></div>');
        side_panel.append(errPanel);        
        var msgPanel = $('<div class="algoviz_panel"><div id="algoviz-message"><i id="algoviz-message-icon" class="fa fa-envelope-o"></i><div id="algoviz-message-msg"></div></div></div>');
        side_panel.append(msgPanel);
        // msgPanel.on("click", (event) => { AlgoViz.hideMessage(); });
    };


    /**
     * Allow access by a navigator
     */
    function allowNavigator() {
        window.AlgoViz.allowNavigator();
    }


    /**
     * Show/Hide the AlgoViz side panel
     */
    function toggleAlgoViz() {
        var main_panel = $('#notebook_panel');
        var side_panel = $('#side_panel');

        var visible = slide_side_panel(main_panel, side_panel);

        return visible;
    };


    /**
     * Hide AlgoViz side panel 
     */
    function hideAlgoViz() {
        if (!$('#side_panel').is(':hidden')) {        
            toggleAlgoViz();
        }
    };


    /**
     * Show AlgoViz side panel
     */
    function showAlgoViz() {
        if ($('#side_panel').is(':hidden')) {        
            toggleAlgoViz();
        }
    };



    /**********************
     *                    *
     * The AlgoViz Object *
     *                    *
     **********************/

    window.AlgoViz = {
        version : "0.5",
        msgHandler : [],
        msgQueue : [],
        views    : [],
        gridCol  : 80,
        gridRow  : 80,
        slideshowFrame : null,
        comm : null,
        modules : []
    };


    var AlgoViz = window.AlgoViz;

    /**
     * Register the default message handlers.
     */
    AlgoViz.registerDefaultHandlers = function() {
        this.msgHandler["init_direct"] = handleInitDirect;
        this.msgHandler["init"] = handleInit;
        this.msgHandler["show"] = handleShow;
        this.msgHandler["hide"] = handleHide;
        this.msgHandler["clear"] = handleClear;
        this.msgHandler["msg"] = handleMsg;
        this.msgHandler["error"] = handleError;
        this.msgHandler["view"] = handleView;
        this.msgHandler["svg"] = handleSVG;
        this.msgHandler["module"] = handleModule;
        this.msgHandler["code"] = handleCode;
    }


    AlgoViz.readConfig = function() {
        var configsec = new configmod.ConfigSection('notebook',{ base_url : utils.get_body_data("baseUrl") } );

        configsec.loaded.then(function() {
    
            // Default configuration
            AlgoVizConfig = {
                broker: "https://abbozza.informatik.uos.de:8080",
                webcam : true
            };

            
            var config = configsec.data.algoviz;

            for ( var key in config ) {
                AlgoVizConfig[key] = config[key];
            }

            if ( localStorage.getItem("AlgoVizConfig") != null ) {
                try {
                    var local = JSON.parse(localStorage.getItem("AlgoVizConfig"));
                    for ( var key in local ) {
                        if ( key != "update_url" ) {
                            AlgoVizConfig[key] = local[key];
                        }
                    }
                } catch (err) {        
                }
            }
        });

        configsec.load();
    };

    AlgoViz.kernelReady = function(event,data) {
        AlgoViz.clear();
        AlgoViz.showMessage("The kernel is ready!",5000);
    }


    /**
     * Show the about dialog
     */
    AlgoViz.showInfo = function() {
        alert("AlgoViz " + this.version);
    }


    /**
     * Enqueue a received message.
     * 
     * @param {Object} msg The message
     * @param {string} id The id of the script tag
     */
    AlgoViz.enqueueMsg = function(msg,id) {
        AlgoViz.processMsg(msg,id);
    };


    /**
     * 
     * @param {Object} msg The message object 
     * @param {string} id The id of the script tag
     */
    AlgoViz.processMsg = function(msg,id = null) {
        if ( msg == null ) return;

        if ( this.msgHandler[msg.type] != null )  {
            try {
                this.msgHandler[msg.type](msg);
            } catch (err) {
                console.error("[AlgoViz] Error during the processing of message");
                console.error(msg);
                console.error(err);
            }
        } else {
            console.error("[AlgoViz] No handler found for message type " + msg.type);
            console.error(msg);
        }

        // Remove the script tag
        if ( id != null ) {
            script = document.getElementById(id);
            var parent = script.parentNode.parentNode;
            parent.parentNode.removeChild(parent);
        }
    };


    AlgoViz.sendMsg = function(msg) {
        if ( AlgoViz.comm == null ) return;
        AlgoViz.comm.send(msg);
    }


    AlgoViz.sendControlMsg = function(msg) {
        if ( AlgoViz.comm == null ) return;
        var content = {
            comm_id : AlgoViz.comm.comm_id,
            data : msg
        };
        var message = AlgoViz.comm.kernel._get_msg("comm_msg",content); // comm_msg
        message.channel = "control";
        AlgoViz.comm.kernel._send(serialize.serialize(message));
    }



    AlgoViz.clear = function() {
        var views = AlgoViz.views;
        // hideMessage();
        if ( views != null ) {
            var view;
            for ( view in views ) {
                views[view].hide();
            }
        }

        algoviz_container.empty();
    }



    AlgoViz.sendAnswer = function(answer) {
        var content = { value : JSON.stringify(answer) };
        var msg = Jupyter.notebook.kernel._get_msg("input_reply", content);
        msg.channel = "stdin";
        console.log(msg);
        Jupyter.notebook.kernel._send(serialize.serialize(msg));
    }


    /**
     * Show error message
     * 
     * @param {*} msg 
     */
    AlgoViz.showError = function(msg) {
        var errPanel = document.getElementById('algoviz-error');
        var errPanelMsg = document.getElementById('algoviz-error-msg');
        errPanelMsg.innerHTML = msg;
        errPanel.style.display = "flex";
    }

    
    AlgoViz.hideError = function() {        
        var errPanel = document.getElementById('algoviz-error');
        errPanel.style.display = "none";
    }


    AlgoViz.showMessage = function(msg, timeout = 0, span = 1) {
        var panel = document.getElementById('algoviz-message');
        var panelMsg = document.getElementById('algoviz-message-msg');
        var panelIcon = document.getElementById('algoviz-message-icon');
        // panel.style.gridRowEnd = "span " + span;
        panelMsg.innerHTML = msg;
        panel.style.display = "flex";
        if ( timeout > 0 ) {
            setTimeout(() => { AlgoViz.hideMessage(); }, timeout);
            panelIcon.setAttribute("class","fa fa-info")
        } else {
            panelIcon.setAttribute("class","fa fa-envelope-o")
        }
    }

    AlgoViz.hideMessage = function() {        
        var panel = document.getElementById('algoviz-message');
        panel.style.display = "none";
    }





    AlgoViz.getSvg = function(view,element) {
        try {
            return window.AlgoViz.views[view].elements[element].svg;
        } catch (ex) {
            return null;
        }
        return null;
    };




    AlgoViz.allowNavigator = async function() {
        if ( Driver.socket == null ) {
            Driver.connect(AlgoVizConfig.broker);
        } else {
            if ( confirm("Disconnect as Driver?") ) {
                Driver.disconnect();
            }
        }
    }


    AlgoViz.upgradeSlideshow = function(div) {
        var title = div.textContent;
        div.textContent = "";
        var classname = div.className;
        var comp = classname.split(' ');
        var path = comp[1];
        var width = Number(comp[2]);
        var height= Number(comp[3]);
        if (( width == 0 ) || ( height == 0 )) {
            width = 700;
            height = 610;
        }


        div.className = "slideshowContainer";

        var container = document.createElement("DIV");
        container.className = "slideshowControl";
        div.appendChild(container);

        var showButton = document.createElement("DIV");
        showButton.className = "slideshowButton";        
        showButton.innerHTML = "<i class='fa fa-eye fa-2x' style='transform:translate(0px,-2px)'></i>"
        container.appendChild(showButton);

        container.onclick = (event) => {
            // AlgoViz.slideshowFrame.resize(width,height);
            AlgoViz.slideshowFrame.setShow(path);
            AlgoViz.slideshowFrame.show();
        };


        var titleBar = document.createElement("DIV");
        titleBar.className = "slideshowTitle";
        titleBar.textContent = title;
        container.appendChild(titleBar);
    }
    

    AlgoViz.injectSlideshow = function(id,title,path,width=700,height=600) {
        var div = document.getElementById(id);
        div.iframe = null;
        var container = document.createElement("DIV");
        container.className = "slideshowControl";
        div.appendChild(container);

        var showButton = document.createElement("DIV");
        showButton.className = "slideshowButton";        
        showButton.innerHTML = "<i class='fa fa-eye fa-2x' style='transform:translate(0px,-2px)'></i>"
        container.appendChild(showButton);

        container.onclick = (event) => {
            var frame = new SlideshowFrame(width,height);
            if ( div.iframe == null ) {
                var iframeDiv =document.createElement("div");
                iframeDiv.style.width="100%";
                var iframe =document.createElement("iframe");
                div.appendChild(iframeDiv);
                var w = iframeDiv.offsetWidth;
                var h = ratio * w;
                iframe.setAttribute("width","100%");
                iframe.setAttribute("height",h + "px");
                iframe.setAttribute("src",AlgoVizConfig["slideshow"].viewer + "?" + AlgoVizConfig["slideshow"].shows + path);
                iframeDiv.appendChild(iframe);
                div.iframe = iframeDiv;
                showButton.innerHTML = "<i class='fa fa-no-eye fa-2x' style='transform:translate(0px,-2px)'></i>"
            } else {
                div.removeChild(div.iframe)
                div.iframe = null;
                showButton.innerHTML = "<i class='fa fa-eye fa-2x' style='transform:translate(0px,-2px)'></i>"
            }
        };

        var titleBar = document.createElement("DIV");
        titleBar.className = "slideshowTitle";
        titleBar.textContent = "Open " + title;
        container.appendChild(titleBar);
    }

    AlgoViz.hideView = function(id) {
        var view = AlgoViz.views[id];
        if ( view == null ) return;
        view.hide();
    }

    AlgoViz.minimizeView = function(id) {
        var view = AlgoViz.views[id];
        if ( view == null ) return;
        view.minimize();
    }

    AlgoViz.restoreView = function(id) {
        var view = AlgoViz.views[id];
        if ( view == null ) return;
        view.restore();
    }

    AlgoViz.growView = function(id) {
        var view = AlgoViz.views[id];
        if ( view == null ) return;
        view.grow();
    }

    AlgoViz.shrinkView = function(id) {
        var view = AlgoViz.views[id];
        if ( view == null ) return;
        view.shrink();
    }

    AlgoViz.createView = function(id,width,height,title) {
        if ( AlgoViz.views == null ) AlgoViz.views = [];
        var view = new View(id,width,height,title);
        algoviz_container.append(view.div);
        if ( AlgoViz.views[id] != null ) {
            algoviz_container.remove(AlgoViz.views[id].div);
        }
        AlgoViz.views[id] = view;
        return view;
    }


    AlgoViz.loadModule = function(module) {
        if ( AlgoViz.modules[module] != null ) {
            console.log("[AlgoViz] Module " + module + " already loaded");            
        } else {
            requirejs(["./" + module], function(mod) {
                console.log("[AlgoViz] Module " + module + " loaded");
                AlgoViz.modules[module] = mod;
                AlgoViz.msgHandler[module] = mod.handleMsg;
                mod.init();
            });
        }

    }


    /*************************
     *                       *
     * The standard handlers *
     *                       *
     *************************/

    /**
     * 
     * @param {*} msg 
     */
    function handleShow(msg) {
        side_panel_connect_contract.css({'background-color':'green'});
        side_panel_connect_contract.attr({title : 'Direct AlgoViz connection established'});
        showAlgoViz();        
    }

    /**
     * 
     * @param {*} msg 
     */
    function handleHide(msg) {
        side_panel_connect_contract.css({'background-color':'red'});
        side_panel_connect_contract.attr({title : 'Direct AlgoViz connection established'});
        hideAlgoViz();        
    }

    /**
     * 
     * @param {*} msg 
     */
    function handleInit(msg) {
        side_panel_connect_contract.css({'background-color':'green'});
        side_panel_connect_contract.attr({title : 'Direct AlgoViz connection established'});
        showAlgoViz();        
        directConnection = true;
    }


    function handleInitDirect(msg) {
        side_panel_connect_contract.css({'background-color':'green'});
        side_panel_connect_contract.attr({title : 'Direct AlgoViz connection established'});
        showAlgoViz();        
        directConnection = true;
    }

    /**
     * 
     * @param {*} msg 
     */
    function handleClear(msg) {
        AlgoViz.clear();
    }

        
    function handleMsg(msg) {
        if ( msg.timeout == null ) msg.timeout = 0;
        AlgoViz.showMessage(msg.content, msg.timeout, msg.span);
    }


    function handleError(msg) {
        AlgoViz.showError(msg.content, msg.span);
    }


    function handleView(msg) {
        var view = AlgoViz.views[""+msg.id];
        if  ( msg.cmd == "create" ) {
            AlgoViz.createView(""+msg.id,msg.width,msg.height,msg.title);
        } else if ( view != null ) {
            view.handle(msg,algoviz_container);
        } else {
            console.error("[AlgoViz] No view with id " + msg.id);
        }
    }


    function handleModule(msg) {
        if ( msg.module == "" ) return;
        AlgoViz.loadModule(msg.module);
    }

    /*
    function createView(id,width,height,title) {
        if ( AlgoViz.views == null ) AlgoViz.views = [];
        var view = new View(id,width,height,title);
        algoviz_container.append(view.div);
        if ( AlgoViz.views[id] != null ) {
            algoviz_container.remove(AlgoViz.views[id].div);
        }
        AlgoViz.views[id] = view;
        return view;
    }
    */

    function handleHTML(msg) {
    }


    function handleSVG(msg) {
        var view = AlgoViz.views[""+msg.id];
        if  ( msg.cmd == "create" ) {
            createSVG(""+msg.id,msg.width,msg.height,msg.gwidth,msg.gheight,msg.title);
        } else if ( view !=  null ) {
            view.handle(msg,algoviz_container);
        } else {
            console.error("[AlgoViz] No view with id " + msg.id);
        }
    }


    function createSVG(id,width,height,gwidth,gheight,title) {
        if ( AlgoViz.views == null ) AlgoViz.views = [];
        var view = new SVGView(id,width,height,gwidth,gheight,title);
        algoviz_container.append(view.div);
        if ( AlgoViz.views[id] != null ) {
            algoviz_container.remove(AlgoViz.views[id].div);
        }
        AlgoViz.views[id] = view;
    }

    // =========================================================

    AlgoViz.CODES = [];
    AlgoViz.CODES["17433010852801135122"] = { url : "https://www.gocomics.com/calvinandhobbes/2020/02/11" };
    AlgoViz.CODES["4966851745552065935"] = { url : "https://www.youtube.com/watch?v=rtzsVWCvtCY" };
    AlgoViz.CODES["12500537102306738973"] = { url : "https://www.youtube.com/watch?v=rtzsVWCvtCY" };
    AlgoViz.CODES["11681515775108640411"] = { url : "https://www.youtube.com/watch?v=rtzsVWCvtCY" };
    
    function handleCode(msg) {
        var code = String(msg.code);
        var entry = AlgoViz.CODES[code];
        if ( entry != null ) {
            if ( entry.url != null ) {
                window.open(entry.url,"_blank");
            }
        } else {
            var dialog = new OverlayFrame({
                icon: "<div style='transform: translate(0,1px);'>" + AlgoVizIcon(20,"#5b67a5","black") + "</div>&nbsp;",
                width: "500px",
                title: "Das war wohl nichts!",
                items: [
                    {
                        type: "label",
                        text: "<p>Der Code war <b>falsch</b>!</p>"
                    }
    
                ],
                buttons: [
                    {
                        title: "Pech",
                        tooltip: "Do nothing",
                        width: "100px",
                        callback: (dialog) => {
                            Jupyter.keyboard_manager.enable();
                            dialog.hide();
                        }
                    }
                ]
            });
            dialog.show();    
        }
    }

    return {
        load_ipython_extension : load_ipython_extension
    };



});

