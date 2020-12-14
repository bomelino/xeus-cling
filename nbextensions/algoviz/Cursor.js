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

class Cursor {

    div = null;
    svg = null;
    text = null;
    rect = null;
    name = "Michael";
    circle = null;
    color = "red";
    x = 0;
    y = 0;


    constructor(name,color) {

        this.div = document.createElement("div");
        this.div.className = "algoviz-cursor";
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width",100);
        this.svg.setAttribute("height",20);
        this.svg.style.overflow = "visible";
        this.div.appendChild(this.svg);
        
        this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.circle.setAttribute("cx",0);
        this.circle.setAttribute("cy",0);
        this.circle.setAttribute("r",3);
        this.circle.setAttribute("fill",this.color);
        this.circle.setAttribute("stroke",this.color);

        this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.svg.appendChild(this.rect);

        this.rect.setAttribute("x",0);
        this.rect.setAttribute("y",0);
        this.rect.setAttribute("rx",6);
        this.rect.setAttribute("ry",6);
        this.rect.setAttribute("width",100);
        this.rect.setAttribute("height",20);
        this.rect.setAttribute("stroke",this.color);
        this.rect.setAttribute("stroke-width","2px");
        this.rect.setAttribute("fill","white");

        this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.text.style.fontSize = "10px";
        this.text.textContent = "xxx";
        this.text.setAttribute("text-anchor","middle");
        this.text.setAttribute("alignment-baseline","middle");
        this.svg.appendChild(this.text);
        this.svg.appendChild(this.circle);

        document.body.appendChild(this.div);

        this.setName(name);
        this.setColor(color);
    }

    setName(name) {
        this.name = name;

        this.text.textContent = this.name;
        var bbox = this.text.getBBox();

        this.text.setAttribute("x",bbox.width/2+5);
        this.text.setAttribute("y",bbox.height/2+2);

        this.rect.setAttribute("width",bbox.width+10);
        this.rect.setAttribute("height",bbox.height+4);
        this.rect.setAttribute("rx",bbox.height/2+2);
        this.rect.setAttribute("ry",bbox.height/2+2);

        this.svg.setAttribute("width",bbox.width+10);
        this.svg.setAttribute("height",bbox.height+4);
    }


    setColor(color) {
        this.color = color;
        this.rect.setAttribute("stroke",this.color);
        this.circle.setAttribute("fill",this.color);
        this.circle.setAttribute("stroke",this.color);
    }


    setPos(x,y) {
        this.x = x;
        this.y = y;
        this.div.style.left = "" + this.x + "px";
        this.div.style.top = "" + this.y + "px";
    }
    

    close() {
        document.body.removeChild(this.div);
    }

    
    hide() {
        this.div.style.display = "none";
    }

    show() {
        this.div.style.display = "block";
    }

}