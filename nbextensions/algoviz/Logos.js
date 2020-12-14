

function DriverIcon(width, color = "black") {
    
    icon  = "<svg width='"+width+"' height='"+width+"' viewBox='0 0 50 50'>"
    icon += "<circle cx='25' cy='25' r='15' fill='none' stroke-width='5' stroke='"+color+"'></circle>";
    icon += "<circle cx='25' cy='25' r='3' fill ='"+color+"' stroke-width='1' stroke='"+color+"'></circle>";
    icon += "<line x1='25' y1='2.5' x2='25' y2='19' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='25' y1='47.5' x2='25' y2='31' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";    
    icon += "<line y1='25' x1='2.5' y2='25' x2='19' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line y1='25' x1='47.5' y2='25' x2='31' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='21' y1='21' x2='9' y2='9' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='21' y1='29' x2='9' y2='41' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";    
    icon += "<line x1='29' y1='21' x2='41' y2='9' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='29' y1='29' x2='41' y2='41' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "</svg>";

    return icon;
}



function NavigatorIcon(width, color = "black") {
    
    icon  = "<svg width='"+width+"' height='"+width+"' viewBox='0 0 50 50'>"
    icon += "<path d='M 5 37.5 a 30 30 0 0 0 40 0' fill='none' stroke-linecap='round' stroke-width='5' stroke='"+color+"'></path>"
    icon += "<path d='M 15 30 a 30 30 0 0 0 20 0' fill='none' stroke-linecap='round' stroke-width='3' stroke='"+color+"'></path>"
    icon += "<circle cx='25' cy='7.5' r='5' fill='"+color+"' stroke-width='1' stroke='"+color+"'></circle>";
    icon += "<line x1='25' y1='7.5' x2='7.5' y2='40' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='25' y1='7.5' x2='42.5' y2='40' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='25' y1='7.5' x2='25' y2='45' stroke-width='3' stroke-linecap='round' stroke='"+color+"'></line>";
    icon += "<line x1='5' y1='22' x2='35' y2='22' stroke-width='7' stroke='"+color+"'></line>";
    icon += "</svg>";

    return icon;
}

function AlgoVizIcon(width, colora = "black", colorv = "green") {
    
    icon  = "<svg width='"+width+"' height='"+width+"' viewBox='0 0 50 50'>";
    icon += "<path d='M 0 12.5 l 0 25 l 25 12.5 l 25 -12.5 l 0 -25 l -10 -5 l 0 25 l -15 7.5 l -15 -7.5 l 0 -25 z' fill='"+colorv+"' stroke-width='1' stroke='white'></path>";
    icon += "<path d='M 10 7.5 l 15 -7.5 l 15 7.5 l 0 25 l -10 5 l 0 -24 l -5 -2.5 l -5 2.5 l 0 24 l -10 -5 z' fill='"+colora+"' stroke-width='1' stroke='white'></path>";
    icon += "<rect x='20' y='20' width='10' height='7.5' fill='"+colora+"' stroke-width='1' stroke='"+colora+"'></path>";
    icon += "</svg>";

    return icon;
}


function AlgoVizIcon2(width, fg="black", bg = "white") {
    
    icon  = "<svg width='"+width+"' height='"+width+"' viewBox='0 0 50 50'>";
    icon += "<rect x='0' y='0' width='50' height ='50' fill='"+bg+"'></rect>";
    icon += "<path d='M 0 50 l 7.5 0 l 20 -50 l -7.5 0 z' fill='"+fg+"'></path>";
    icon += "<path d='M 50 50 l -7.5 0 l -20 -50 l 7.5 0 z' fill='"+fg+"'></path>";
    icon += "<path d='M 25 50 l 9 -22.5 l -18 0 z' fill='"+fg+"'></path>";
    icon += "</svg>";

    return icon;
}


function RunningArrow(width,height,speed,color = "black") {
    
    icon  = "<svg width='"+width+"' height='"+height+"' viewBox='0 0 "+width+" 20'>";
    icon += "<line x1='10' y1='10' x2='"+(width-20)+"' y2='10' stroke-dasharray='40' fill='"+color+"' stroke-linecap='round' stroke-width='10' stroke='"+color+"'>";
    icon += "<animate attributeName='stroke-dashoffset' from='0' to='-80' repeatCount='indefinite' dur='" +(1/speed)+ "s' ></animate>";
    icon += "</line>";
    // icon += "<line x1='"+(width-10)+"' y1='30' x2='"+(width-40)+"' y2='5' fill='"+color+"' stroke-linecap='round' stroke-width='10' stroke='"+color+"'></line>";
    // icon += "<line x1='"+(width-10)+"' y1='30' x2='"+(width-40)+"' y2='15' fill='"+color+"' stroke-linecap='round' stroke-width='10' stroke='"+color+"'></line>";
    icon += "</svg>";

    return icon;

}


function FlyingSheet(width,speed,color = "black") {
    
    icon  = "<svg width='"+width+"' height='40' viewBox='0 0 "+width+" 50'>";
    icon += "<g>";
    icon += "<rect x='0' y='10' width='20' height='30' fill='white' stroke-width='2' stroke='black'>";
    icon += "<animateTransform attributeName='transform' type='rotate' from='0 10 25' to='360 10 25' repeatCount='indefinite' dur='"+(1/(3*speed))+"s' ></animateTransform>";
    icon += "</rect>";
    icon += "<text x='1' y='35' font-size='30px' font-family='sans-serif'>?";
    icon += "<animateTransform attributeName='transform' type='rotate' from='0 10 25' to='360 10 25' repeatCount='indefinite' dur='"+(1/(speed*3))+"s' ></animateTransform>";
    icon += "</text>";
    icon += "<animate attributeName='x' from='0' to='"+width+"' repeatCount='indefinite' dur='" +(1/speed)+ "s' ></animate>";
    icon += "<animateMotion dur='"+(1/speed)+"s' repeatCount='indefinite' path='M-30,5 l "+(width+60)+" 0'></animateMotion>";
    icon += "<animateTransform attributeName='transform' type='scale' values='0.25; 0.75; 1; 0.75; 0.25' keyTime='0; 0.25; 0.5; 0.75; 1' repeatCount='indefinite' dur='"+(1/speed)+"s' ></animateTransform>";
    icon += "</g>";
    icon += "</svg>";

    return icon;
}


function AuDLogo(width,color="black") {
    icon  = "<svg width='"+width+"' height='"+width+"' viewBox='0 0 100 100'>";
    // icon += "<rect x='0' y='0' width='100' height='100' fill='transparent' stroke='"+color+"'></path>";
    icon += "<g>";
    icon += "<path d='M 50 0 l -50 100 l 10 0 l 40 -80' fill='"+color+"'></path>";
    icon += "<path d='M 50 0 l 0 100 l -10 0 l 0 -80' fill='"+color+"'></path>";
    icon += "<path d='M 0 70 l 50 0 l 0 -10 l -50 0' fill='"+color+"'></path>";
    icon += "<path d='M 52 0 a 47 50 0 0 1 0 100 l 0 -12 a 35 38 0 0 0 0 -76' fill='"+color+"'></path>";
    icon += "<path d='M 52 37 l 10 0 l 0 20 a 5 5 0 0 0 10 0 l 0 -20 l 10 0 l 0 20 a 15 15 0 0 1 -30 0' fill='"+color+"'></path>";
    icon += "</g>";
    icon += "</svg>";

    return icon;
}

class AlgoVizLogo {

    div = null;
    svg = null;
    
    constructor(width) {
        this.div = document.createElement("div");
        this.svg = document.createElementNS("http://www.w3.org/2000/svg","svg");

        var path = "M 0 84 l 10 0 l 25 -70 l 25 70 l 10 0 l -30 -84 l -10 0 z";
        var path2 = "M 35 84 l 12.5 -35 l -25 0  z";
        this.svg.innerHTML = "<rect class='algoviz_logo' x='0' y='0' width='70' height='84' fill='black'></rect><path class='algoviz_logo_a' d='" + path + "'></path>"
        + "<path class='algoviz_logo_v' d='" + path2 + "'></path>"
        this.svg.setAttribute("width",width);
        this.svg.setAttribute("height",width);
        this.svg.setAttribute("viewBox","0 0 70 84" );

        this.div.appendChild(this.svg);
    }

}


class InfinityLogo {

    div = null;
    svg = null;
    
    constructor(width,duration,frames = null) {
        if ( frames == null ) {
            frames = [{ color: "black" , opacity : 1.0}];
        }
        if  ( typeof frames == "string") {
            frames = [{ color: frames , opacity : 1.0}];
        }
        this.div = document.createElement("div");
        this.svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
        var svgString = "<path class='infinity_logo' " +
            "style='animation-duration: " + duration + "' " +
            "d='M 105 80 q 80 60 80 0 q 0 -60 -80 0 q -80 60 -80 0 q 0 -60 80 0'>\
            </path>";
        var defsString = "";
        if ( frames.length > 1 ) {
            defsString = "<defs><radialGradient id='infinitygrad' cx='50%' cy='50%' r='50%'>";
            var dx = 100/(frames.length-1);
            for ( var i = 0; i < frames.length; i++ ) {
                defsString = defsString +
                    "<stop offset='" + (dx*i) + "%' style='stop-color: " + 
                    (frames[i].color ? frames[i].color : "black")
                    + "; stop-opacity : '" +
                    (frames[i].opacity ? frames[i].opacity : "black")
                    +"'/>";
            }
            defsString = defsString + "</radialGradient></defs>";
            this.svg.innerHTML = defsString + svgString;
            this.svg.setAttribute("stroke", "url(#infinitygrad)");
        } else {
            this.svg.innerHTML = svgString;
            this.svg.setAttribute("stroke", frames[0].color ? frames[0].color : "black" );
            this.svg.setAttribute("opacity", frames[0].opycity ? frames[0].opycity : 1.0 );
        }
        this.svg.setAttribute("width",width);
        this.svg.setAttribute("height",3*width/4);
        this.svg.setAttribute("viewBox","0 0 210 160");

        this.div.appendChild(this.svg);
    }

}