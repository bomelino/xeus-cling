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

class View {

   gridWidth = 1;
   gridHeight = 1;
   curGridWidth = 1;
   curGridHeight = 1;
   id = "";
   handlers = [];
   div = null;
   content = null;
   parent = null;
   hidden = true;
   mouseMoveCounter = 0;
   lastKey = "";
   lastClick = {};
   mouseData = {};

   constructor(id, w, h, title) {
      this.id = id;
      this.gridWidth = w;
      this.gridHeight = h;
      this.curGridWidth = w;
      this.curGridHeight = h;
      this.minimized = false;
      this.lastClick = {
         x : -1,
         y : -1,
         screenx : -1,
         screeny : -1,
         buttons : -1,
         view : -1,
         target : null,
         legal : false
      };
      this.mouseData = {
         x : -1,
         y : -1,
         screenx : -1,
         screeny : -1,
         buttons : -1,
         view : -1,
         target : null,
         legal : false
      };

      this.handlers["set"] = this.handleSet;
      this.handlers["add"] = this.handleAdd;
      this.handlers["show"] = this.show;
      this.handlers["hide"] = this.hide;
      this.handlers["style"] = this.handleStyle;
      this.handlers["status"] = this.handleStatus;
      this.handlers["clearStatus"] = this.handleClearStatus;

      var viewDiv = document.createElement("div");
      viewDiv.className = "algoviz-view";
      viewDiv.id = "algoviz-view-" + id;
      viewDiv.style.gridColumnStart = "auto";
      viewDiv.style.gridRowStart = "auto";
      viewDiv.style.gridColumnEnd = "span " + w;
      viewDiv.style.gridRowEnd = "span " + h;
      this.div = viewDiv;

      var titleDiv = document.createElement("div");
      titleDiv.className = "algoviz-view-title";
      titleDiv.innerHTML = "<span>" + title + "</span><div class='algoviz-view-title-buttons'>" +
         "<i title='Minimize' class='algoviz-view-title-button fa fa-circle' style='color:yellow; font-size: 16px;' onclick='AlgoViz.minimizeView(\"" + this.id + "\")'></i>" +
         "<i title='Shrink' class='algoviz-view-title-button fa fa-arrow-circle-down' style='color:green; font-size: 16px;' onclick='AlgoViz.shrinkView(\"" + this.id + "\")'></i>" +
         "<i title='Grow' class='algoviz-view-title-button fa fa-arrow-circle-up' style='color:green; font-size: 16px;' onclick='AlgoViz.growView(\"" + this.id + "\")'></i>" +
         // "<i class='algoviz-view-title-button fa fa-minus-circle' style='color:yellow; font-size: 16px;' onclick='AlgoViz.minimizeView(\""+ this.id +"\")'></i>"+
         "<i title='Close' class='algoviz-view-title-button fa fa-circle' style='color:red; font-size: 16px;' onclick='AlgoViz.hideView(\"" + this.id + "\")'></i></div>";
      this.title = titleDiv;
      this.div.appendChild(this.title);

      this.content = document.createElement("div");
      this.content.className = "algoviz-view-content";

      this.div.appendChild(this.content);

      this.statusBar = document.createElement("div");
      this.statusBar.className = "algoviz-view-statusbar";

      this.div.appendChild(this.statusBar);

      var me = this;
      // Add keyboard handling to View
      this.title.addEventListener("click", (event) => { me.content.focus(); });

      this.content.setAttribute("tabindex", 0);

      this.content.addEventListener("focusin", (event) => {
         Jupyter.keyboard_manager.disable();
         me.title.style.backgroundColor = "darkgrey";
         me.div.style.borderColor = "black";
      });

      this.content.addEventListener("focusout", (event) => {
         Jupyter.keyboard_manager.enable();
         me.title.style.backgroundColor = "lightgrey";
         me.div.style.borderColor = "darkgrey";
      });


      this.content.addEventListener("keydown", (event) => {
         var key = event.key;
         if (event.metaKey) key = "Meta+" + key;
         if (event.ctrlKey) key = "Ctrl+" + key;
         if (event.altKey) key = "Alt+" + key;

         me.lastKey = key;
         event.preventDefault();
      });


      this.content.addEventListener("click", (event) => {
         me.storeMouseData(event, me.lastClick);
         me.lastClick.buttons = 0;         
      });

      this.content.addEventListener("contextmenu", (event) => {
         me.storeMouseData(event, me.lastClick);
         me.lastClick.buttons = 2;         
         event.preventDefault();
         return false;
      });


      this.content.addEventListener("mouseleave", (event) => {
         me.mouseData.x = -1;
         me.mouseData.screenx = -1;
         me.mouseData.screeny = -1;
         me.mouseData.buttons = -1;
         me.mouseData.view = Number(me.id);
         me.mouseData.id = "";
         me.mouseData.legal = false;
      });

      this.content.addEventListener("mousemove", (event) => {
         me.storeMouseData(event,me.mouseData);
      });


      this.content.addEventListener("mousedown", (event) => {
         me.mouseData.buttons = event.button;
      });

      this.content.addEventListener("mouseup", (event) => {
         me.mouseData.buttons = -1;
      });

      this.resize();
   };


   show() {
      if ((this.parent != null) && (this.hidden == true)) {
         this.hidden = false;
         this.parent.append(this.div);
      }
   };


   hide() {
      this.hidden = true;
      this.parent = this.div.parentNode;
      if (this.div.parentNode != null) this.div.parentNode.removeChild(this.div);
   };


   minimize() {
      if (this.minimized == false) {
         this.div.style.gridColumnEnd = "span 1";
         this.div.style.gridRowEnd = "span 1";
         this.minimized = true;
      } else {
         this.div.style.gridColumnEnd = "span " + this.curGridWidth;
         this.div.style.gridRowEnd = "span " + this.curGridHeight;
         this.minimized = false;
         this.resize();
      }
   };


   grow() {
      this.curGridWidth++;
      this.curGridHeight++;
      this.div.style.gridColumnEnd = "span " + this.curGridWidth;
      this.div.style.gridRowEnd = "span " + this.curGridHeight;
      this.minimized = false;
      this.resize();
   }


   shrink() {
      this.curGridWidth--;
      this.curGridHeight--;
      if (this.curGridWidth <= 0) this.curGridWidth = 1;
      if (this.curGridHeight <= 0) this.curGridHeight = 1;
      this.div.style.gridColumnEnd = "span " + this.curGridWidth;
      this.div.style.gridRowEnd = "span " + this.curGridHeight;
      this.minimized = false;
      this.resize();
   }


   resize() {}


   /**
    * Generic message handler
    * 
    * @param {JSON} msg 
    */
   handle(msg, parent) {
      var handler = this.handlers[msg.cmd];
      if (handler != null) {
         handler.call(this, msg);
      } else {
         if (msg.cmd == "close") this.close();
         else if (msg.cmd == "show") this.show(parent);
      }
   };


   handleSet(msg) {
      this.content.innerHTML = msg.content;
   };


   handleAdd(msg) {
      var content = this.content.innerHTML + msg.content;
      this.content.innerHTML = content;
   };


   handleStyle(msg) {
      this.content.style[msg.name] = msg.value;
   };

   handleStatus(msg) {
      this.setStatusMsg(msg.msg);
   }

   handleClearStatus(msg) {
      this.clearStatusMsg();
   }


   waitForKey(callback) {
      var listener = (event) => {
         this.content.removeEventListener("keydown", listener);
         var key = event.key;
         if (event.metaKey) key = "Meta+" + key;
         if (event.ctrlKey) key = "Ctrl+" + key;
         if (event.altKey) key = "Alt+" + key;

         if (callback != null) callback.call(this, key);
      };

      this.content.addEventListener("keydown", listener);
   }


   waitForClick(callback) {
      var me = this;
      var listener = (event) => {
         me.content.removeEventListener("click", listener);
         var click = {};
         me.storeMouseData(event,click);
         click.buttons = 0;
         if (callback != null) callback.call(me, click);
      };
      this.content.addEventListener("click", listener);

      var listener2 = (event) => {
         me.content.removeEventListener("contextmenu", listener2);
         var click = {};
         me.storeMouseData(event,click);
         click.buttons = 2;
         if (callback != null) callback.call(me, click);
      };
      this.content.addEventListener("contextmenu", listener2);

   }


   storeMouseData(event, data) {
      data.x = event.offsetX;
      data.y = event.offsetY;
      data.screenx = event.screenX;
      data.screeny = event.screenY;
      // data.buttons = event.which | event.button ;
      data.view = Number(this.id);
      data.target = event.target.getAttribute("id");
      data.legal = true;
   }

   deleteLastClick() {
      this.lastClick = {
         x : -1,
         y : -1,
         screenx : -1,
         screeny : -1,
         buttons : -1,
         view : -1,
         target : null
      };         
   }


   handleStdinRequest(type, content, serialize) {
      switch (type) {
         case "GETKEY":
            this.waitForKey( (key) => {
               content["value"] = key;
               var msg = Jupyter.notebook.kernel._get_msg("input_reply", content);
               msg.channel = "stdin";
               Jupyter.notebook.kernel._send(serialize.serialize(msg));            
            });
            return false;

         case "LASTKEY":
            content["value"] = this.lastKey;
            this.lastKey = "";         
            break;

         case "MOUSE":
            if ( this.mouseData != null ) {
               content["value"] = JSON.stringify(this.mouseData);
            } else {
               content = { value: "" };
            }
            break;

         case "LASTCLICK":
            if ( this.lastClick != null ) {
               content["value"] = JSON.stringify(this.lastClick);
               this.deleteLastClick();
            } else {
               content = { value: "" };
            }
            break;

         case "GETCLICK":            
            this.waitForClick( (click) => {
               content["value"] = JSON.stringify(click);
               var msg = Jupyter.notebook.kernel._get_msg("input_reply", content);
               msg.channel = "stdin";
               Jupyter.notebook.kernel._send(serialize.serialize(msg));            
            });
            return false;

         case "GETIDS":
            content["value"] = this.getIDs();
            break;

         default:
            content["value"] = "AlgoViz error : Unknown  request type " + type;
      }
      return true;
   }


   setStatusMsg(msg) {
      console.log(msg);
      this.statusBar.innerHTML = msg;
   }

   clearStatusMsg() {
      this.statusBar.innerHTML = "";
   }

} // End of class View


// ==========================================================================


class SVGView extends View {

   svg = null;
   elements = null;
   menu = null;

   constructor(id, w, h, gw, gh, title) {
      super(id, gw, gh, title);
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", "100%");
      this.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      this.svg.setAttribute("id", "_" + id);
      this.content.appendChild(this.svg);

      this.elements = [];

      this.handlers["add"] = this.addElement;
      this.handlers["clone"] = this.cloneElement;
      this.handlers["remove"] = this.removeElement;
      this.handlers["clear"] = this.clear;
      this.handlers["style"] = this.handleStyle;
      this.handlers["attr"] = this.handleAttr;
      this.handlers["attrs"] = this.handleAttrs;
      this.handlers["transform"] = this.handleTransform;
      this.handlers["rotate"] = this.handleRotate;
      this.handlers["style"] = this.handleStyle;
      this.handlers["tofront"] = this.toFront;
      this.handlers["viewbox"] = this.handleViewBox;
      this.handlers["addChild"] = this.handleAddChild;
      this.handlers["removeChild"] = this.handleRemoveChild;
      this.handlers["empty"] = this.handleEmpty;
      this.handlers["settext"] = this.handleSetText;
      this.handlers["fit"] = this.fitToContent;
      this.handlers["load"] = this.handleLoad;
      this.handlers["idattr"] = this.handleIDAttr;
   }


   add(element) {
      if (element.id != -1) {
         if (this.elements[element.id] == null) {
            this.elements[element.id] = element;
            this.svg.appendChild(element.svg);
            element.svg.id = "_" + this.id + "_" + element.id;
            element.parent = this;
         }
      } else {
         // Aonymous element
         this.svg.appendChild(element.svg);
         element.parent = this;
      }
   }


   remove(element) {
      var i = this.elements.indexOf(element);
      if (i != -1) {
         this.elements[i] = null;
         this.svg.removeChild(element.svg);
      }
   }


   clear() {
      while (this.svg.firstChild != null) {
         this.svg.removeChild(this.svg.firstChild);
      }
      this.elements = [];
   }



   addElement(msg, parent) {
      var el = new SVGElement(msg);
      this.add(el);
   }


   cloneElement(msg, parent) {
      var original = this.elements[msg.original];
      if (original == null) return;

      var el = new SVGElement(original, msg.eid);
      this.add(el);
   }


   removeElement(msg, parent) {
      var el = this.elements[msg.eid];
      this.remove(el);
   }


   handleStyle(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      el.setStyle(msg.name, msg.value);
   }

   handleStyle(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      el.setStyle(msg.style, msg.value);
   }

   handleAttr(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      el.setAttr(msg.attr, msg.value);
   }


   handleAttrs(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      el.setAttrs(msg.attrs, msg.values);
   }


   handleTransform(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      var bbox = el.svg.getBBox();
      var rx = bbox.x + bbox.width / 2;
      var ry = bbox.y + bbox.height / 2;
      var angle = msg.angle;
      var x = msg.x;
      var y = msg.y;
      el.setAttr("transform", "translate(" + (x - bbox.width / 2) + "," + (y - bbox.height / 2) + ") " + "rotate(" + angle + "," + rx + "," + ry + ")");
   }

   handleRotate(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      var bbox = el.svg.getBBox();
      var rx = bbox.x + bbox.width / 2;
      var ry = bbox.y + bbox.height / 2;
      var angle = msg.angle;
      el.setAttr("transform", "rotate(" + angle + "," + rx + "," + ry + ")");
   }


   handleViewBox(msg, parent) {
      this.svg.setAttribute("viewBox", msg.coords);
      if ( msg.aspect != "" ) {
         this.svg.setAttribute("preserveAspectRatio", msg.aspect);
      }
   }


   handleAddChild(msg, parent) {
      if (msg.childid != -1) {
         var el = this.elements[msg.eid];
         var child = this.elements[msg.childid];
         el.svg.appendChild(child.svg);
      } else {
         var el = this.elements[msg.eid];
         // create anonymous child
         // Masquerade group id
         msg.eid = -1;
         var child = new SVGElement(msg);
         el.svg.appendChild(child.svg);
      }
   }


   handleRemoveChild(msg, parent) {
      var el = this.elements[msg.eid];
      var child = this.elements[msg.childid];
      el.svg.removeChild(child.svg);
   }

   handleEmpty(msg, parent) {
      var el = this.elements[msg.eid];
      while (el.svg.firstChild != null) {
         el.svg.removeChild(el.svg.firstChild);
      }
   }

   toFront(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      this.svg.removeChild(el.svg);
      this.svg.appendChild(el.svg);
   }


   handleSetText(msg, parent) {
      var el = this.elements[msg.eid];
      if (el == null) return;
      el.svg.textContent = msg.content;
   }


   fitToContent() {
      var svg = this.svg;
      var bbox = svg.getBBox();
      // Update the width and height using the size of the contents
      if (bbox.width > 500)
         svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
      // svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
   }

   storeMouseData(event, data) {
      var id = event.target.id;
      var ids = id.split("_");
      var viewId = ids[1];
      var elId = -1;

      if (ids.length > 1) {
         elId = ids[2];
      }

      var pt = this.svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      var svgPt = pt.matrixTransform(this.svg.getScreenCTM().inverse());
      data.x = svgPt.x;
      data.y = svgPt.y;
      data.screenx = event.screenX;
      data.screeny = event.screenY;
      // data.buttons = event.which | event.button;
      data.view = Number(this.id);
      data.element = Number(elId);
      data.target = event.target.getAttribute("id");
      data.legal = true;
   }


   handleIDAttr(msg, parent) {
      var el = this.svg.getElementById(msg.eid);
      if (el != null) {
         var attrAttr = msg.attr.replace(/[A]/g, (match) => { return '-' + match.toLowerCase(); });
         var styleAttr = msg.attr.replace(/-[a-z]/g, (match) => { return match.substring(1).toUpperCase(); });
         try {
            el.setAttribute(attrAttr, msg.value);
         } catch (ex) {}
         try {
            el.style[styleAttr] = msg.value;
         } catch (ex) {}
      } else {
         console.warn("[AlgoViz] Element with id " + msg.eid + " not found!");
      }
   }


   handleLoad(msg, parent) {
      var url = msg.url;
      var request = new XMLHttpRequest();
      request.open("GET", url);
      request.addEventListener("load", (event) => {
         if (request.status >= 200 && request.status < 300) {
            var parser = new DOMParser();
            var xml = parser.parseFromString(request.responseText, "text/xml");
            var svgs = xml.getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg");
            var svg = svgs[0];
            var w = Number(svg.getAttribute("width").match(/\d+/));
            var h = Number(svg.getAttribute("height").match(/\d+/));
            document.adoptNode(svg);
            this.content.removeChild(this.svg);
            this.svg = svg;
            this.content.appendChild(this.svg);
            this.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
            this.svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
         } else {
            console.warn(request.statusText);
            console.warn(request.responseText);
         }
      });
      request.send();
   }


   getIDs() {
      var els = this.svg.querySelectorAll("[id]");
      var ids = [];
      for (var el of els) {
         ids.push(el.getAttribute("id"));
      }
      var obj = { ids: ids };
      return JSON.stringify(obj);
   }

}


// =====================================================================


class SVGElement {

   svg = null;
   id = -1;
   parent = null;
   dragging = false;
   svgTitle = null;

   constructor(msg, id = -1) {
      if (id == -1) {
         this.id = msg.eid;
         this.svg = document.createElementNS("http://www.w3.org/2000/svg", msg.form);

         if (msg.content != null) {
            this.svg.textContent = msg.content;
         }

         if ((msg.form != "text") && (msg.form != "g")) {
            this.svg.setAttribute("stroke", "black");
            this.svg.setAttribute("stroke-width", "1");
            this.svg.setAttribute("fill", "black");
         }

         this.setAttrs(msg.attrs, msg.values);
      } else {
         var original = msg;
         this.id = id;
         this.svg = original.svg.cloneNode(true);
         this.parent = original.parent;
         this.svgTitle = original.svgTitle;
         this.parent.svg.appendChild(this.svg);
      }
   }



   set(names, msg) {
      for (var i = 0; i < names.length; i++) {
         var val = msg[names[i]];
         if (val != null) {
            this.svg.setAttr(names[i], val);
         }
      }
   }


   setAttr(name, value) {
      if (name == "title") {
         if (this.svgTitle == null) {
            this.svgTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
            this.svg.appendChild(this.svgTitle);
         }
         this.svgTitle.textContent = value;
      } else {
         var attrAttr = name.replace(/[A]/g, (match) => { return '-' + match.toLowerCase(); });
         var styleAttr = name.replace(/-[a-z]/g, (match) => { return match.substring(1).toUpperCase(); });
         try { 
            this.svg.setAttribute(attrAttr, value);
         } catch (ex) {}
         try {
            // TODO 
            // this.svg.style[styleAttr] = value;
         } catch (ex) {}
      }
   }


   setAttrs(names, values) {
      if (names == null) return;
      for (var i = 0; i < names.length; i++) {
         if (values[i] != null) {
            this.setAttr(names[i], values[i]);
         }
      }
   }


   setStyle(name, value) {
      this.svg.style[name] = value;
   }

}
