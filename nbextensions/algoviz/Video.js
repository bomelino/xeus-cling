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

class Video {

    div = null;
    video = null;
    stream = null;
    title = null;
    novideo = null;
    col = null;
    name = "";
    size = 160;

    constructor(name, color = "") {

        this.div = document.createElement("div");

        this.title = document.createElement("div");
        this.title.className = "algoviz-video-div-title";
        this.div.appendChild(this.title);

        if ( color != "" ) {
            this.col = document.createElement("div");
            this.col.className = "algoviz-video-div-color";
            this.col.style.backgroundColor = color;
            this.title.appendChild(this.col);
        }

        this.nameDiv =  document.createElement("div");
        this.nameDiv.className = "algoviz-video-div-name";
        this.title.appendChild(this.nameDiv);

        this.icons =  document.createElement("div");
        this.icons.className = "algoviz-video-div-icons";
        this.title.appendChild(this.icons);

        this.expandIcon = document.createElement("i");
        this.expandIcon.className = "fa fa-arrows-alt";
        this.icons.appendChild(this.expandIcon);
        this.expandIcon.addEventListener('click', (event) => {
            this.expand();
        });

        this.video = document.createElement("video");
        this.video.setAttribute("autoplay",true);
        // this.video.setAttribute("controls",false);

        this.div.className = "algoviz-video-div";
        // this.div.setAttribute("draggable",true);
        this.div.appendChild(this.video);

        this.stream = new MediaStream();
        this.video.srcObject = this.stream;

        document.body.appendChild(this.div);

        this.dragX = 0;
        this.dragY = 0;

        this.novideo = document.createElement("i");
        this.novideo.className = "fa fa-eye-slash";
        this.icons.appendChild(this.novideo);

        if ( this.stream.getVideoTracks().length != 0 ) {
            this.novideo.style.display = "none";
            this.expandIcon.style.display = "block";

            this.div.addEventListener('mouseenter', (event) => {
                this.title.style.display = "flex";
            });
        
            this.div.addEventListener('mouseleave', (event) => {
                this.title.style.display = "none";
            });
        } else {
            this.title.style.display = "flex";
            this.expandIcon.style.display = "none";
            this.novideo.style.display = "block";
            this.video.style.display = "none";
            this.title.className = "algoviz-video-div-title-novideo";
            this.div.style.height="20px";
        }

        if (Overlay) {
            var div = this.div;
            // this.video.setAttribute("draggable",false);                    
            this.nameDiv.onmousedown = (event) => {
                Overlay.startDragging(div,event);
            }
            this.nameDiv.ontouchstart = (event) => {
                Overlay.startDraggingTouch(div,event);
            }

        } else {
            /*
            this.div.addEventListener('dragstart', (event) => {
                event.target.dragX = event.screenX;
                event.target.dragY = event.screenY;
            });

            this.div.addEventListener('dragend', (event) => {            
                var dx = event.screenX - event.target.dragX;
                var dy = event.screenY - event.target.dragY;
                var x = event.target.offsetLeft + dx;
                var y = event.target.offsetTop + dy;
                event.target.style.left = "" + x + "px";
                event.target.style.top = "" + y + "px";
            });
            */
        }

        this.setName(name);

        this.video.addEventListener("abort", (event) => {
            console.log("ABORTED");
        });


        // TODO: Find a place for the video
        /*
        var right = 0;
        var top = 0;

        var videos = document.getElementsByClassName("algoviz-video-div");

        for ( var i = 0; i < videos.length; i++ ) {
            if ( videos[i] != this.div ) {
                var bbox = videos[i].getBoundingClientRect();

            }
        }
        */
    }


    expand() {
        if ( this.size < 320 ) {
            this.size = this.size + 40;
            var x = (this.div.offsetLeft - 40);
            this.div.style.left = "" + x + "px";
        } else {
            this.size = 160;
            var x = (this.div.offsetLeft + 160);
            this.div.style.left = "" + x + "px"; 
        }
        this.div.style.width = this.size + "px";
        this.div.style.height = (0.75*this.size) + "px";
        this.video.style.width= this.size + "px";
        this.video.style.height = (0.75*this.size) + "px";
    }

    addTrack(track) {
        if ( track.kind == "video") {
            this.novideo.style.display = "none";
            this.expandIcon.style.display = "block";
            this.video.style.display = "block";
            this.div.style.height="120px";

            this.div.addEventListener('mouseenter', (event) => {
                this.title.style.display = "flex";
            });
        
            this.div.addEventListener('mouseleave', (event) => {
                this.title.style.display = "none";
            });
            this.title.className = "algoviz-video-div-title";

        }
        this.stream.addTrack(track);
    }


    close() {        
        this.stream.getTracks().forEach( (track) => {
            track.stop();
        });
        if ( this.div.parentNode != null ) {
            document.body.removeChild(this.div);
        }

    }

    setName(name) {
        this.name = name;
        this.nameDiv.textContent = this.name;
    }

}