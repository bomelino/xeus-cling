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


class Hint {

    div = null;
    wrapper = null;

    constructor(content, timeout = 0, icon = "fa-info", fgcolor = "white", bgcolor = "red") {
        this.wrapper = document.createElement("div");
        this.wrapper.style.position = "absolute";
        this.wrapper.style.display = "flex";
        this.wrapper.style.justifyContent = "center";
        this.wrapper.style.alignItems = "center";
        this.wrapper.style.bottom = "0px";
        this.wrapper.style.left = "0px";
        this.wrapper.style.right = "0px";
        this.wrapper.style.height = "55px";
        this.wrapper.style.zIndex = 500;
        this.wrapper.style.opacity = 1.0;
        this.wrapper.style.padding = "0px";
        this.wrapper.style.overflow = "hidden";

        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.display = "flex";
        this.div.style.justifyContent = "center";
        this.div.style.alignItems = "center";
        this.div.style.bottom = "0px";
        this.div.style.left = "0px";
        this.div.style.right = "0px";
        this.div.style.height = "45px";
        this.div.style.zIndex = 500;
        this.div.style.backgroundColor = "white";
        this.div.style.opacity = 1.0;
        this.div.style.boxShadow = "0px 0px 5px 5px darkgray";
        this.div.style.padding = "5px";

        this.div.innerHTML = '<i class="hinticon btn fa ' + icon + ' hidden-print" style="margin-right: 5px; padding: 5px; background-color: ' + bgcolor + '; color: '  + fgcolor + '"> </i>' + content;

        document.body.appendChild(this.wrapper);
        this.wrapper.appendChild(this.div);

        var icons = document.getElementsByClassName("hinticon");
        for ( var i = 0; i < icons.length; i++ ) {
            icons[i].animate([
                { transform : "rotate(0deg)" },
                { transform : "rotate(-10deg)" },
                { transform : "rotate(0deg)" },
                { transform : "rotate(10deg)" },
                { transform : "rotate(0deg)" }
            ],{
                duration: 500,
                iterations: Infinity,
            });
        }

        this.div.animate([
            { transform: "translate(0,100%)" },
            { transform: "translate(0,0)" }
        ],
        {            
            duration : 500,
            fill : "forwards"
        });

        if ( timeout > 0 ) {
            setTimeout( () => {
                this.div.animate([
                    { transform: "translate(0,0)" },
                    { transform: "translate(0,100%)" }
                ],
                {            
                    duration : 500,
                    fill : "forwards"
                });    
                setTimeout( () => {
                    document.body.removeChild(this.wrapper);
                }, 500 );
            }, timeout );            
        }
    }
}