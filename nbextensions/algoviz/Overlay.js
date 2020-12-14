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
 * This class provides a Hint appearing at the bottom of the window which
 * disappears after a given time.
 */

/**
 * This class provides an overlay for the display of dialogs, notifications etc.
 */
class Overlay {

    static overlay = null;
    static frame = null;
    static bottomBar = null;
    static pendingElements = [];

    static draggingOverlay;
    static draggingElement;
    static draggingHandler;
    static draggingX;
    static draggingY;

    static iconStyle = "";

    static inject() {

        Overlay.overlay = document.createElement("div");

        var overlay = Overlay.overlay;
        document.body.appendChild(overlay);
        overlay.id = "overlay";

        Overlay.frame = document.createElement("div");
        Overlay.frame.style.cssText =
            "width: auto; height: auto;" +
            "padding : 10px;" +
            "background-color: white;" +
            "opacity: 1.0;" +
            "box-shadow : 5px 5px 5px darkgrey;" +
            "border: 1px solid lightgray; border-radius: 2px;" +
            "display: block;";
        Overlay.frame_bar = document.createElement("div");

        Overlay.frame_content = document.createElement("div");
        Overlay.frame.appendChild(Overlay.frame_content);
        Overlay.frame_content.style.cssText =
            "width: auto; height: auto;" +
            "padding : 0px;" +
            "display: flex;" +
            "align-items: flex-start;" +
            "align-content: flex-start;" +
            "justify-content: center";
        Overlay.frame_bar = document.createElement("div");
        Overlay.frame_bar.style.cssText =
            "width: 100%; height: auto;" +
            "padding : 0px;" +
            "display: flex;" +
            "align-items: center;" +
            "align-content: center;" +
            "justify-content: flex-end;";
        Overlay.frame.appendChild(Overlay.frame_bar);

        Overlay.pendingElements = [];

        // Create dragging Overlay
        Overlay.draggingOverlay = document.createElement("div");
        var dragOv = Overlay.draggingOverlay;
        document.body.appendChild(dragOv);
        dragOv.id = "overlay-dragging";

        dragOv.addEventListener("mousemove", Overlay.drag);
        dragOv.addEventListener("mouseup", Overlay.dragend);
        dragOv.addEventListener("touchmove", Overlay.dragTouch);
        dragOv.addEventListener("touchend", Overlay.dragendTouch);
        dragOv.addEventListener("touchcancel" ,Overlay.dragendTouch);
    }


    static getIcon(symbol, fg, bg, size) {
        if (symbol == null) symbol = "fa-info";
        if (fg == null) fg = "black";
        if (bg == null) fg = "white";
        if (size == null) fg = 20;
        return '<i id="hinticon" class="btn fa ' + symbol + ' hidden-print" ' +
            'style="margin-right: 5px; padding: 5px; bordeer-radius: 2px;' +
            'background-color: ' + bg + '; color: ' + fg + '; font-size: ' + size + 'px"></i>';
    }

    static remove() {
        document.body.removeChild(Overlay.overlay);
    }


    static show() {
        Overlay.overlay.style.display = "flex";
    }


    static hide() {
        Overlay.overlay.style.display = "none";
    }


    static showFrame(content) {
        Overlay.frame_content.innerHTML = content;
        Overlay.show();
        Overlay.overlay.appendChild(Overlay.frame);
        Overlay.overlay.animate([
            { opacity: 0.0 },
            { opacity: 1.0 }
        ], {
            duration: 250,
            fill: "forwards"
        });
        Overlay.frame.animate([
            { opacity: 0.0, transform: "scale(0) translate(-1000px,0px)" },
            { opacity: 1.0, transform: "scale(1) translate(0,0)" }
        ], {
            duration: 250,
            fill: "forwards"
        });
    }



    static hideFrame(callback = null) {
        Overlay.overlay.animate([
            { opacity: 1.0 },
            { opacity: 0.0 }
        ], {
            duration: 250,
            fill: "forwards"
        });
        Overlay.frame.animate([
            { opacity: 1.0, transform: "scale(1) translate(0,0)" },
            { opacity: 0.0, transform: "scale(0) translate(1000px,0px)" }
        ], {
            duration: 250,
            fill: "forwards"
        }).onfinish = () => {
            Overlay.overlay.removeChild(Overlay.frame);
            Overlay.hide();
            if (callback != null) callback.call();
        };
    }


    static clearBar() {
        while (Overlay.frame_bar.hasChildNodes()) {
            Overlay.frame_bar.removeChild(Overlay.frame_bar.firstChild);
        }
    }


    static setBarText(text) {
        var el = document.createElement("div");
        el.style.cssText = "color: darkgray; font-size: 90%;";
        el.textContent = text;
        Overlay.clearBar();
        Overlay.frame_bar.appendChild(el);
    }


    static addBarButton(but, callback = null) {
        var config = but;
        if (typeof but == "string") {
            config = {
                text: but,
                css: {
                    backgroundColor: "white",
                    color: "black",
                    fontWeight: "bold"
                },
                hover: {
                    backgroundColor: "black",
                    color: "white"
                }
            }
        }

        var div = document.createElement("div");
        if (but.callback != null) {
            div.onclick = but.callback;
        }

        if (callback != null) {
            div.onclick = callback;
        }

        if (config.tooltip) div.title = config.tooltip;

        div.style.cssText =
            "border: 2px darkgrey solid; border-radius: 5px;" +
            "padding: 2px 10px 2px 10px;" +
            "margin: 0px 0px 0px 10px;" +
            "text-align: center; font-weight: bold;" +
            "cursor: pointer;";

        if (config.css == null) config.css = {};
        if (config.css.color == null) config.css.color = "black";
        if (config.css.backgroundColor == null) config.css.backgroundColor = "white";

        if (config.hover == null) config.hover = {};
        if (config.hover.color == null) config.hover.color = config.css.backgroundColor;
        if (config.hover.backgroundColor == null) config.hover.backgroundColor = config.css.color;

        Overlay.applyCSS(div, config.css);

        div.onmouseenter = () => {
            Overlay.applyCSS(div, config.hover);
        }
        div.onmouseleave = () => {
            Overlay.applyCSS(div, config.css);
        }

        var icon = "";
        if (config.icon != null) {
            icon = Overlay.getIcon(config.icon.symbol, config.icon.fg, config.icon.bg, config.icon.size);
        }
        div.innerHTML = icon + config.text;
        Overlay.frame_bar.appendChild(div);
    }


    static applyCSS(element, css) {
        if (css != null) {
            Object.keys(css).forEach((key) => {
                element.style[key] = css[key];
            });
        }
    }

    static info(content, symbol, fg, bg) {
        Overlay.overlay.onclick = null;
        content = Overlay.getIcon(symbol, fg, bg, 30) +
            "<div>" + content + "</div>";
        Overlay.setBarText("Click to proceed");
        Overlay.showFrame(content);
        Overlay.overlay.onclick = (event) => {
            Overlay.hideFrame();
        }
    }

    static alert(content) {
        Overlay.overlay.onclick = null;
        content = Overlay.getIcon('fa-exclamation-circle', "white", "red", 30) +
            "<div>" + content + "</div>";
        Overlay.showFrame(content);
        Overlay.overlay.onclick = (event) => {
            Overlay.hideFrame();
        }
    }


    static prompt() { }


    static confirm(content, okCallback, cancelCallback = null) {
        Overlay.dialog(Overlay.getIcon('fa_question-circle') + "<div>" + content + "</div>", [
            {
                text: "Cancel",
                tooltip: "Cancel",
                callback: () => {
                    Jupyter.keyboard_manager.enable();
                    Overlay.hideFrame(cancelCallback);
                },
                css: {
                    width: "100px"
                }
            }, {
                text: "OK",
                tooltip: "Confirm the action",
                callback: () => {
                    Jupyter.keyboard_manager.enable();
                    if ( okCallback != null ) okCallback.call();
                    Overlay.hideFrame();
                },
                css: {
                    width: "100px",
                    border: "2px black solid"
                }
            }
        ]);
    }



    static dialog(content, buttons) {
        Overlay.overlay.onclick = null;
        Overlay.clearBar();
        buttons.forEach((button) => {
            Overlay.addBarButton(button);
        });
        Overlay.showFrame(content);
    }


    static showElement(element) {
        Overlay.pendingElements.push(element);

        if ( Overlay.pendingElements.length > 1 ) return;

        Overlay.doShowElement(Overlay.pendingElements[0]);
    }

    static doShowElement(element) { 
        Overlay.show();
        Overlay.overlay.appendChild(element);
        Overlay.overlay.animate([
            { opacity: 0.0 },
            { opacity: 1.0 }
        ], {
            duration: 250,
            fill: "forwards"
        });
        element.animate([
            { opacity: 0.0, transform: "scale(0) translate(-200%,0px)" },
            { opacity: 1.0, transform: "scale(1) translate(0,0)" }
        ], {
            duration: 250,
            fill: "forwards"
        });
    }


    static hideElement(element, callback = null) {
        Overlay.show();
        Overlay.overlay.appendChild(element);

        Overlay.overlay.animate([
            { opacity: 1.0 },
            { opacity: 0.0 }
        ], {
            delay : 100,
            duration: 250,
            fill: "forwards"
        });

        var anim = element.animate([
            { opacity: 1.0, transform: "scale(1) translate(0,0)" },
            { opacity: 0.0, transform: "scale(0) translate(200%,0px)" }
        ], {
            delay : 100,
            duration: 250,
            fill: "forwards"
        });

        anim.onfinish = () => {
            if  ( callback != null ) {
                callback.call();
            }

            Overlay.overlay.removeChild(element);

            Overlay.pendingElements.shift();
            if ( Overlay.pendingElements.length > 0 ) {
                Overlay.doShowElement(Overlay.pendingElements[0]);
            } else {
                Overlay.hide();
            }
        }
    }


    static startDragging(element,event, handler = null) {
        Overlay.draggingOverlay.style.display = "block";
        Overlay.draggingElement = element;
        Overlay.draggingHandler = handler;
        Overlay.draggingX = event.clientX;
        Overlay.draggingY = event.clientY;
    }
    
    static startDraggingTouch(element,event, handler = null) {
        Overlay.draggingOverlay.style.display = "block";
        Overlay.draggingElement = element;
        Overlay.draggingHandler = handler;
        Overlay.draggingX = event.touches[0].clientX;
        Overlay.draggingY = event.touches[0].clientY;
    }


    static drag(event) {
        if ( Overlay.draggingElement == null ) return;
        if ( Overlay.draggingOverlay != event.target ) return;

        if ( Overlay.draggingHandler == null ) {
            var dx = event.clientX - Overlay.draggingX;
            var dy = event.clientY - Overlay.draggingY;

            var nx = Overlay.draggingElement.offsetLeft + dx;
            var ny = Overlay.draggingElement.offsetTop + dy;
            Overlay.draggingElement.style.left = nx + "px";
            Overlay.draggingElement.style.top = ny + "px";
        } else {
            Overlay.draggingHandler(event,Overlay.draggingX,Overlay.draggingY);
        }

        Overlay.draggingX = event.clientX;
        Overlay.draggingY = event.clientY;
    }


    static dragTouch(event) {
        if ( Overlay.draggingElement == null ) return;
        if ( Overlay.draggingOverlay != event.target ) return;

        if ( Overlay.draggingHandler == null ) {
            var dx = event.touches[0].clientX - Overlay.draggingX;
            var dy = event.touches[0].clientY - Overlay.draggingY;

            var nx = Overlay.draggingElement.offsetLeft + dx;
            var ny = Overlay.draggingElement.offsetTop + dy;
            Overlay.draggingElement.style.left = nx + "px";
            Overlay.draggingElement.style.top = ny + "px";
        } else {
            Overlay.draggingHandler(event,Overlay.draggingX,Overlay.draggingY);
        }

        Overlay.draggingX = event.touches[0].clientX;
        Overlay.draggingY = event.touches[0].clientY;
        event.preventDefault();
    }


    static dragend(event) {        
        if ( Overlay.draggingElement == null ) return;
        if ( Overlay.draggingOverlay != event.target ) return;

        Overlay.drag(event);

        Overlay.draggingOverlay.style.display = "none";
        Overlay.draggingElement = null
    }


    static dragendTouch(event) {        

        // if ( Overlay.draggingElement == null ) return;
        // if ( Overlay.draggingOverlay != event.target ) return;

        // Overlay.dragTouch(event);

        Overlay.draggingOverlay.style.display = "none";
        Overlay.draggingElement = null
    }

}





/**
 * This class provides a frame
 */
class OverlayFrame {

    parent = null;
    header = null;
    main = null;
    footer = null;

    buttons = [];
    items = [];

    constructor(content) {
        this.parent = document.createElement("div");
        this.parent.className = "overlayFrame";

        if ( content.width ) this.parent.style.width = content.width;

        this.header = document.createElement("div");
        this.header.className = "overlayFrameHeader";
        this.header.innerHTML = (content.icon ? content.icon : "") + 
                                (content.title ? content.title : "");
        this.parent.appendChild(this.header);

        this.main = document.createElement("div");
        this.main.className = "overlayFrameMain";
        this.parent.appendChild(this.main);

        this.items = [];
        if ( content.items ) {
            content.items.forEach( (item) => {
                var it = null;
                if ( typeof item == "string" ) {
                    it = document.createElement("div");
                    it.innerHTML = item;
                    this.main.appendChild(it);
                } else {
                    switch (item.type) {
                        case "label":
                            it = new OverlayText(item);
                            break;
                        case "text" :
                            it = new OverlayInput(item);
                            break;
                        case "switch" :
                            it = new OverlaySwitch(item);
                            break;
                        case "color" :
                            it = new OverlayColor(item);
                            break;
                    }
                    if ( it ) {
                        if ( item.id ) this.items[item.id] = it;
                        this.main.appendChild(it.parent);
                    }
                }
            });
        }

        this.footer = document.createElement("div");
        this.footer.className = "overlayFrameFooter";
        this.parent.appendChild(this.footer);

        this.buttons = [];
        if ( content.buttons ) {
            content.buttons.forEach( (button) => {
                var but = new OverlayButton(button,this);
                this.footer.appendChild(but.parent);
                this.buttons.push(but);
            });
        }

        if ( this.buttons.length == 0 ) {
            this.footerText = document.createElement("div");
            this.footerText.innerHTML = content.footer ? content.footer : "Click to proceed";
            this.footerText.style.fontSize = "80%";
            this.footerText.style.color = "black";
            this.footer.appendChild(this.footerText);
            var dialog = this;
            this.parent.onclick = () => { dialog.hide(); };
            Overlay.overlay.onclick = () => { dialog.hide(); };
        }
    }


    show() {
        Overlay.showElement(this.parent);

        /*
        var butWidth = 0;
        this.buttons.forEach( (but) => { 
            console.log(but.parent.offsetWidth);
            if ( but.parent.offsetWidth > butWidth ) {
                butWidth = but.parent.offsetWidth;
            }
        } );

        this.buttons.forEach( (but) => { but.parent.style.width = butWidth +"px"; } );        
        */
    }


    hide(callback) {
        Overlay.overlay.onclick = null;
        Overlay.hideElement(this.parent, callback);
    }


    getValues() {
        var result = {};
        Object.keys(this.items).forEach( (item) => {
            result[this.items[item].id] = this.items[item].getValue();
        });
        return result;
    }
}


class OverlayButton {

    parent = null;
    callback = null;
    dialog = null;

    constructor(content,dialog) {
        this.dialog = dialog;

        this.parent = document.createElement("div");
        this.parent.style.height = "auto";
        this.parent.style.width = content.width ? content.width : "auto";
        this.parent.style.padding = "5px";
        this.parent.style.textAlign = "center";
        this.parent.style.fontWeight = "bold";
        this.parent.style.margin = "0px 5px 0px 0px";
        this.parent.style.backgroundColor = content.bg ? content.bg : "white";
        this.parent.style.color = content.fg ? content.fg : "black";
        this.parent.style.boxShadow = "5px 5px 5px darkgrey";
        this.parent.style.border = "1px solid black";
        this.parent.style.borderRadius = "5px";
        this.parent.style.cursor = "pointer";

        this.parent.title = content.tooltip ? content.tooltip : ""
        this.parent.innerHTML = content.title ? content.title : "";

        this.parent.onmouseenter = (event) => {
            this.switchColors();
        };
        this.parent.onmouseleave = (event) => {
            this.switchColors();
        };

        this.callback = content.callback ? content.callback : null;

        this.parent.onclick = () => {
            this.parent.animate([
                { transform : "translate(0,0)" },
                { transform : "translate(5px,5px)" },
                { transform : "translate(0,0)" }
            ],{
                duration: 100
            });
            if ( this.callback ) {
                this.callback.call(null,this.dialog);
            } else {
                this.dialog.hide();
            }
        };

    }

    setContent(text) {
        this.parent.innerHTML = text
    }
    
    setTooltip(text) {
        this.parent.title = text
    }

    switchColors() {
        var bg = this.parent.style.backgroundColor;
        var fg = this.parent.style.color;
        this.parent.style.backgroundColor = fg;
        this.parent.style.color = bg;
    }
}


class OverlayText {

    parent = null;

    constructor(content) {
        this.parent = document.createElement("div");
        this.parent.style.height = "auto";
        this.parent.style.margin = "5px 5px 0px 5px";
        this.parent.style.width = "auto";
        this.parent.style.padding = "5px";
        this.parent.style.backgroundColor = content.bg ? content.bg : "white";
        this.parent.style.color = content.fg ? content.fg : "black";
        this.parent.style.borderRadius = "3px";

        this.parent.innerHTML = content.text ? content.text : "";
    }
}


class OverlayInput {

    parent = null;
    label = null;
    input = null;

    constructor(content) {
        this.id = content.id;

        this.parent = document.createElement("div");
        this.parent.style.height = "auto";
        this.parent.style.margin = "5px 5px 0px 5px";
        this.parent.style.width = "auto";
        this.parent.style.padding = "5px";
        this.parent.style.backgroundColor = content.bg ? content.bg : "white";
        this.parent.style.color = content.fg ? content.fg : "black";
        this.parent.style.borderRadius = "3px";
        this.parent.style.display = "flex";
        this.parent.style.alignItems = "center";

        this.parent.title = content.tooltip ? content.tooltip : null;

        this.label = document.createElement("label");
        this.label.style.flexGrow = 0;
        this.label.style.marginRight = "5px";
        this.label.setAttribute("for",content.id);
        this.label.textContent = content.label ? content.label : "";
        this.parent.appendChild(this.label);

        this.input = document.createElement("input");
        this.input.style.flexGrow = 1;
        this.input.style.marginRight = "5px";
        this.input.setAttribute("id",content.id);
        this.input.setAttribute("value",content.value ? content.value : "");
        this.input.style.fontSize = "100%";
        this.input.style.border = "1px darkgrey solid";
        this.input.style.boxShadow = "2px 2px 2px darkgrey";
        this.input.style.borderRadius = "2px";
        this.input.style.padding = "0px 5px 0px 5px";

        if ( content.readonly == true ) {
            this.input.setAttribute("readonly","true");
            this.input.style.backgroundColor = "#E8E8E8";
        }

        this.oncopyclick = content.oncopyclick ? content.oncopyclick : null;
        
        this.parent.appendChild(this.input);

        if ( content.copy == true ) {
            this.copy = document.createElement("i");
            this.copy.className="fa fa-clipboard";
            this.copy.style.flexGrow = 0;
            this.copy.style.marginRight = "5px";
            this.copy.style.padding = "3px";
            this.copy.style.fontSize = "100%";
            this.copy.style.border = "1px darkgrey solid";
            this.copy.style.boxShadow = "2px 2px 2px darkgrey";
            this.copy.style.borderRadius = "2px";
            this.copy.onclick = () => {
                if ( this.oncopyclick) this.oncopyclick.call(null);
                this.copy.animate([
                    { transform : "translate(0,0)" },
                    { transform : "translate(5px,5px)" },
                    { transform : "translate(0,0)" }
                ],{
                    duration:100
                });
                navigator.clipboard.writeText(this.input.value);                
            };
            this.parent.appendChild(this.copy);
        }
    }

    getValue() {
        return this.input.value;
    }
}


class OverlayColor {

    parent = null;
    label = null;
    input = null;

    constructor(content) {
        this.id = content.id;

        this.parent = document.createElement("div");
        this.parent.style.height = "auto";
        this.parent.style.margin = "5px 5px 0px 5px";
        this.parent.style.width = "auto";
        this.parent.style.padding = "5px";
        this.parent.style.backgroundColor = content.bg ? content.bg : "white";
        this.parent.style.color = content.fg ? content.fg : "black";
        this.parent.style.borderRadius = "3px";
        this.parent.style.display = "flex";
        this.parent.style.alignItems = "center";

        this.parent.title = content.tooltip ? content.tooltip : null;

        this.label = document.createElement("label");
        this.label.style.flexGrow = 1;
        this.label.style.marginRight = "5px";
        this.label.setAttribute("for",content.id);
        this.label.textContent = content.label ? content.label : "";
        this.parent.appendChild(this.label);

        this.input = document.createElement("input");
        this.input.setAttribute("type","color");
        this.input.style.flexGrow = 0;
        this.input.style.marginRight = "5px";
        this.input.setAttribute("id",content.id);
        this.input.setAttribute("value",content.value ? content.value : "");
        this.input.style.fontSize = "100%";
        this.input.style.border = "1px darkgrey solid";
        this.input.style.boxShadow = "2px 2px 2px darkgrey";
        this.input.style.borderRadius = "2px";
        this.input.style.padding = "0px";
        this.input.style.backgroundColor = "white";
        this.parent.appendChild(this.input);
        this.input.onclick = () => {
            this.input.animate([
                { transform : "translate(0,0)" },
                { transform : "translate(5px,5px)" },
                { transform : "translate(0,0)" }
            ],{
                duration: 100
            });
        };

    }

    getValue() {
        return this.input.value;
    }
}



class OverlaySwitch {

    parent = null;
    label = null;
    switch = null;
    value = false;
    color = "green";
    ontooltip = "";
    offtooltip = "";

    constructor(content) {
        this.id = content.id;
        this.value = content.value;
        this.color = content.color ? content.color : "green";
        this.ontooltip = content.ontooltip;
        this.offtooltip = content.offtooltip;

        this.parent = document.createElement("div");
        this.parent.style.height = "auto";
        this.parent.style.margin = "5px 5px 0px 5px";
        this.parent.style.width = "auto";
        this.parent.style.padding = "5px";
        this.parent.style.backgroundColor = content.bg ? content.bg : "white";
        this.parent.style.color = content.fg ? content.fg : "black";
        this.parent.style.borderRadius = "3px";
        this.parent.style.display = "flex";
        this.parent.style.alignItems = "center";
        this.parent.style.overflow = "visible";

        // this.parent.title = content.tooltip ? content.tooltip : null;

        this.label = document.createElement("div");
        this.label.style.flexGrow = 1;
        this.label.style.marginRight = "5px";
        this.label.setAttribute("for",content.id);
        this.label.textContent = content.label ? content.label : "";
        this.parent.appendChild(this.label);

        this.switch = document.createElementNS("http://www.w3.org/2000/svg","svg");
        this.switch.setAttribute("height","20");
        this.switch.setAttribute("width","40");
        this.switch.style.overflow = "visible";

        this.switch.innerHTML = '    <defs>\
        <filter id="dropShadow" x="-100%" y="-100%" width="300%" height="300%">\
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>\
          <feOffset dx="2" dy="2" result="offsetblur"/>\
          <feFlood flood-color="#000000"/>\
          <feComposite in2="offsetblur" operator="in"/>\
          <feMerge>\
            <feMergeNode/>\
            <feMergeNode in="SourceGraphic"/>\
          </feMerge>\
        </filter>\
      </defs>';

      this.sliderbg = document.createElementNS("http://www.w3.org/2000/svg","rect");
      this.sliderbg.setAttribute("x",4);
      this.sliderbg.setAttribute("y",4);
      this.sliderbg.setAttribute("rx",6);
      this.sliderbg.setAttribute("ry",6);
      this.sliderbg.setAttribute("width",32);
      this.sliderbg.setAttribute("height",12);
      this.sliderbg.setAttribute("stroke-width","2px");
      this.sliderbg.setAttribute("fill","white");
      this.sliderbg.setAttribute("stroke","white");
      this.sliderbg.setAttribute("opacity",0.5);

        this.slider = document.createElementNS("http://www.w3.org/2000/svg","rect");
        this.slider.setAttribute("x",4);
        this.slider.setAttribute("y",4);
        this.slider.setAttribute("rx",6);
        this.slider.setAttribute("ry",6);
        this.slider.setAttribute("width",32);
        this.slider.setAttribute("height",12);
        this.slider.setAttribute("stroke-width","2px");
        this.slider.setAttribute("fill",content.value ? this.color : "darkgrey");
        this.slider.setAttribute("stroke",content.value ? this.color : "darkgrey");
        this.slider.setAttribute("opacity",0.5);

        this.knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
        this.knob.setAttribute("cx",10);

        var x0 = this.value ? 20 : 0;
        this.knob.style.transform = "translate(" + x0 + "px,0)";

        this.knob.setAttribute("cy",9);
        this.knob.setAttribute("r",8);
        this.knob.setAttribute("width",34);
        this.knob.setAttribute("height",14);
        this.knob.setAttribute("stroke",content.value ? this.color : "darkgrey");
        this.knob.setAttribute("stroke-width","2px");
        this.knob.setAttribute("fill",content.value ? this.color : "darkgrey");
        this.knob.setAttribute("boxShadow",content.value ? this.color : "darkgrey");
        this.knob.setAttribute("filter","url(#dropShadow)");
        this.knob.style.overflow = "visible";


        this.switch.appendChild(this.sliderbg);
        this.switch.appendChild(this.slider);
        this.switch.appendChild(this.knob);
        this.parent.appendChild(this.switch);

        this.setTooltip();

        this.switch.onclick = () => {
            this.value = !this.value;

            var x0  = this.value ? 0 : 20;
            var x1  = this.value ? 20 : 0;

            this.knob.animate([
                { transform : "translate(" + x0 + "px,0)" },
                { transform : "translate(" + x1 + "px,0)" }
            ],{
                duration: 50,
                fill : "forwards"
            });
            this.knob.setAttribute("stroke",this.value ? this.color : "darkgrey");
            this.knob.setAttribute("fill",this.value ? this.color : "darkgrey");
            this.slider.setAttribute("fill",this.value ? this.color : "darkgrey");
            this.slider.setAttribute("stroke",this.value ? this.color : "darkgrey");  
            
            this.setTooltip();
        };
    }

    setTooltip () {
        if ( this.value ) {
            this.parent.title = this.ontooltip;
        } else {
            this.parent.title = this.offtooltip;
        }
    }

    getValue() {
        return this.value;
    }

}


class SlideshowFrame {

    div = null;
    width = "0px";
    height = "0px";
    iframe = null;
    scale = 1.0;
    footerDragX = 0;

    constructor(w,h) {
        this.div = document.createElement("div");

        var div = this.div;

        this.div.className = "algoviz-slideshow-frame";
        this.div.style.display = "none";
        document.body.appendChild(this.div);
        
        var nw = w;
        var nh = h;

        if ( w > 0.75 * document.body.offsetWidth ) {
            nw = 0.75 * document.body.offsetWidth;
            nh = h * (1.0 * nw/w);
        }

        if ( nh > 0.75 * document.body.offsetHeight ) {
            var oh = nh;
            nh = 0.75 * document.body.offsetHeight;
            nw = nw * (1.0 * nh/oh);
        }

        w = nw;
        h = nh;

        this.div.style.width = (w+4) + "px";
        this.div.style.height = (h+34) + "px";

        this.width = w;
        this.height = h;

        var x = (document.body.offsetWidth - this.div.offsetWidth)/2;
        var y = (document.body.offsetHeight - this.div.offsetHeight)/2;
        if ( x < 0 ) x=0;
        if ( y < 0 ) y=0;
        this.div.style.left = x + "px";
        this.div.style.top = y + "px";

        this.header = document.createElement("div");
        this.header.className = "header";
        this.div.appendChild(this.header);

        this.main = document.createElement("div");
        this.main.className = "main";
        this.div.appendChild(this.main);

        this.footer = document.createElement("div");
        this.footer.className = "footer";
        // this.footer.setAttribute("draggable","true");
        var me = this;

        this.footer.onmousedown = (event) => {
            Overlay.startDragging(div,event, (event,oldX,oldY) => {
                var dy = event.clientY - oldY;
                var h = me.height + dy;                
                var w = me.width * (1.0*h/me.height);
                if ( ( h >= 100 ) && ( w >= 100) ) {
                    me.resize(w,h);
                }
            });
        };

        this.footer.ontouchstart = (event) => {
            Overlay.startDraggingTouch(div,event, (event,oldX,oldY) => {
                var dy = event.touches[0].clientY - oldY;
                var h = me.height + dy;                
                var w = me.width * (1.0*h/me.height);
                if ( ( h >= 100 ) && ( w >= 100) ) {
                    me.resize(w,h);
                }
            });
        };

        this.div.appendChild(this.footer);

        // this.div.setAttribute("draggable","true");

        this.dragX = 0;
        this.dragY = 0;

        var slideshow = this;

        this.shrinkBtn = document.createElement("DIV");
        this.shrinkBtn.className = "button";
        this.shrinkBtn.innerHTML = "<i class='fa fa-minus'></i>";
        this.shrinkBtn.onclick = (event) => { slideshow.shrink(); };
        this.header.appendChild(this.shrinkBtn);

        this.growBtn = document.createElement("DIV");
        this.growBtn.className = "button";
        this.growBtn.innerHTML = "<i class='fa fa-plus'></i>";
        this.growBtn.onclick = (event) => { slideshow.grow(); };
        this.header.appendChild(this.growBtn);

        var span = document.createElement("DIV");
        span.style.flexGrow = 2;
        this.header.appendChild(span);
        span.onmousedown = (event) => {
            Overlay.startDragging(div,event);
        };
        span.ontouchstart = (event) => {
            Overlay.startDraggingTouch(div,event);
        };


        this.closeBtn = document.createElement("DIV");
        this.closeBtn.className = "button";
        this.closeBtn.innerHTML = "<i class='fa fa-close'></i>";
        this.closeBtn.onclick = (event) => { slideshow.hide(); };
        this.header.appendChild(this.closeBtn);

        this.iframe =document.createElement("iframe");
        this.iframe.setAttribute("width",this.width + "px");
        this.iframe.setAttribute("height",this.height + "px");
        this.iframe.setAttribute("src","");
        this.main.appendChild(this.iframe);




        /*
        this.div.ondragstart =  (event) => {            
            event.target.dragX = event.screenX;
            event.target.dragY = event.screenY;
        }
        */

        /*
        this.div.ondrag =  (event) => {            
            var dx = event.screenX - event.target.dragX;
            var dy = event.screenY - event.target.dragY;
            var x = event.target.offsetLeft + dx;
            var y = event.target.offsetTop + dy;
            event.target.style.left = "" + x + "px";
            event.target.style.top = "" + y + "px";
            event.target.dragX = event.screenX;
            event.target.dragY = event.screenY;
        }
        */

        /*
        this.div.ondragend = (event) => {
            var dx = event.screenX - event.target.dragX;
            var dy = event.screenY - event.target.dragY;
            var x = event.target.offsetLeft + dx;
            var y = event.target.offsetTop + dy;
            event.target.style.left = "" + x + "px";
            event.target.style.top = "" + y + "px";
        }
        */

        /*
        var me = this;

        this.footer.ondragstart = (event) => {
            event.target.footerDragY = event.clientY;
            event.target.dragging = true;
        }

        this.footer.ondrag = (event) => {            
            if ( event.target.dragging == true ) {
                var dy = event.clientY - event.target.footerDragY;
                var h = me.height + dy;
                var w = me.width * (1.0*h/me.height);
                me.resize(w,h);
                event.target.footerDragY = event.clientY;
                console.log(".");
            }
        }

        this.footer.ondragend = (event) => {            
            var dy = event.clientY - event.target.footerDragY;
            var h = me.height + dy;
            var w = me.width * (1.0*h/me.height);
            me.resize(w,h);
            event.target.dragging = false;
        }
        */

    }


    grow() {
        this.resize(this.width*1.1,this.height*1.1);
    }

    shrink() {
        this.resize(this.width/1.1,this.height/1.1);
    }


    resize(w,h) {
        this.width = w;
        this.height = h;
        this.div.style.width = (this.width + 4) + "px";
        this.div.style.height = (this.height + 34)  + "px";
        this.iframe.setAttribute("width",this.width + "px");
        this.iframe.setAttribute("height",this.height + "px");
    }


    toggle() {
        if ( this.div.style.display == "none" ) {
            this.show();
        } else {
            this.hide();
        }
    }


    close() {
        document.body.removeChild(this.div);
        this.button.frame = null;
    }

    hide() {
        this.div.style.display = "none";
    }

    show() {
        this.div.style.display = "flex";
        this.scale = 1.0;
        this.resize(this.width,this.height);

        var x = (document.body.offsetWidth - this.div.offsetWidth)/2;
        var y = (document.body.offsetHeight - this.div.offsetHeight)/2;
        if ( x < 0 ) x=0;
        if ( y < 0 ) y=0;
        this.div.style.left = x + "px";
        this.div.style.top = y + "px";        
    }

    setShow(path) {
        this.iframe.setAttribute("src",AlgoVizConfig["slideshow"].viewer + "?" + AlgoVizConfig["slideshow"].shows + path);
    }
}