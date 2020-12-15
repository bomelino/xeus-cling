
  
 #ifndef SVGBuffered_HPP
 #define SVGBuffered_HPP
  
 #include <iostream>
 #include <string>
 #include "xeus/xjson.hpp"
 #include "nlohmann/json.hpp"
 #include <algoviz/AlgoViz.hpp>
  
 using namespace std;
  
 class AlgoViz;
 class SVG;
  
 class SVGElement
 {
  
 protected:
     SVG *svg;
     int x;
     int y;
     int id;
     int alpha;
     void (*clickHandler)(SVGElement *);
     map<std::string,std::string> attributes = map<std::string,std::string>();
  
     friend class SVG;
  
     void sendAttributes();
  
 public:
     SVGElement();
  
     SVGElement(SVG *view);
  
     SVGElement(const SVGElement &original);
     
     virtual ~SVGElement();
  
     virtual void addTo(SVG *svg);
  
     SVGElement &operator=(const SVGElement &original);
  
     void copy(const SVGElement &original);
     
  
     xeus::xjson getMsg(std::string cmd);
  
     int getId();
  
     virtual int get_X() { 
         return this->x;
     }
  
     virtual int getY() {
         return this->y;
     }
  
     virtual void moveTo(int x, int y) = 0;
  
     void moveBy(int dx, int dy);
  
     void setAttribute(std::string attr, int value);
  
     void setAttribute(std::string attr, std::string value);
  
     virtual void rotateTo(int angle);
  
     void rotateBy(int angle);
  
     void toFront();
  
     void hide();
  
     void show();
  
     void removeFromView();
  
     void setColor(string color = "black");
  
     void setColor(int red, int green, int blue, float alpha = 1.0);
  
     void setFill(string color = "transparent");
  
     void setFill(int red, int green, int blue, float alpha = 1.0);
  
     void setStrokeWidth(int width);
  
     friend inline bool operator==(const SVGElement &left, const SVGElement &right);
  
     friend inline bool operator!=(const SVGElement &left, const SVGElement &right);
  
     void onclick(void (*handler)(SVGElement *));
  
 protected:
  
     virtual void clicked();
  
     virtual void create();
  
 }; // end of class SVGElement
  
  
  
  
  
 class SVGBuffered : public AlgoVizView
 {
  
 public:
     int nextElementID = 0;
     map<int, SVGElement*> elements = map<int, SVGElement*>();
     SVGElement *clickedElement = nullptr;
  
     int width;
     int height;
     string stroke = "black";
     int strokeWidth = 1;
     string fill = "transparent";
     string transform = "";
  
     friend class SVGElement;
  
     SVG(int width, int height, int gWidth, int gHeight, std::string title = "SVG")
     {
         this->id = AlgoVizView::nextViewID;
         AlgoVizView::views[this->id] = this;
         AlgoVizView::nextViewID++;
  
         this->type = "svg";
         this->width = width;
         this->height = height;
  
         AlgoViz::show();

          if (gWidth <= 0)
         {
             gWidth = width / this->colWidth + (width % this->colWidth > 0 ? 1 : 0);
         }
  
         if (gHeight <= 0)
         {
             gHeight = (height + 40) / this->rowHeight + ((height + 40) % this->rowHeight > 0 ? 1 : 0);
         }

         AlgoViz::js("this.createSVGBuffered("+to_string(this->id)+",width=500,height=500)")
     }
  
     SVG(int width, int height, std::string title = "SVG") : SVG(width,height,0,0,title) 
     {
     }
  
  
  
     SVG(std::string url, int width, int height, int gw, int gh, std::string title = "SVG") : SVG(width,height,gw,gh,title)
     {
         this->load(url);
     }
  
     SVG() : SVG(200,200,"SVG") {
     }
  
  
  
     inline int getWidth()
     {
         return this->width;
     }
  
     inline int getHeight()
     {
         return this->height;
     }
  
     void setViewBox(int x, int y, int w, int h, string aspect = "")
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "viewbox";
         obj["id"] = this->id;
         obj["coords"] = std::to_string(x) + " " + std::to_string(y) + " " + std::to_string(w) + " " + std::to_string(h);
         obj["aspect"] = aspect;
         AlgoViz::sendMsg(obj);
     }
  
  
     void clear()
     {
         AlgoVizView::clear();
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "clear";
         obj["id"] = this->id;
         AlgoViz::sendMsg(obj);
         this->elements.clear();
         this->nextElementID = 0;
     }
  
  
     void setColor(string color = "black")
     {
         this->stroke = color;
     }
  
     void setColor(int red, int green, int blue, float alpha = 1.0)
     {
         this->stroke = "rgba(" + std::to_string(red) + "," + std::to_string(green) + "," + std::to_string(blue) + "," + std::to_string(alpha) + ")";
     }
  
     void setFill(string color = "transparent")
     {
         this->fill = color;
     }
  
     void setFill(int red, int green, int blue, float alpha = 1.0)
     {
         this->fill = "rgba(" + std::to_string(red) + "," + std::to_string(green) + "," + std::to_string(blue) + "," + std::to_string(alpha) + ")";
     }
  
     void setLineWidth(int width = 1)
     {
         this->strokeWidth = width;
     }
  
     void setTransform(string transform = "")
     {
         this->transform = transform;
     }

     /** send javascript message, gets executed in view context
     this == View.js/SVGCanvasView instance */
     void js(string javascript){
     	auto obj = xeus::xjson::object();
     	obj["type"] = "js";
     	obj["id"] = this->id;
     	obj["cmd"] = javascript;
     	AlgoViz::sendMsg(obj);
     }
  
     void drawLine(int x1, int y1, int x2, int y2)
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "line";
         obj["attrs"] = {"x1", "y1", "x2", "y2", "stroke", "stroke-width", "transform"};
         obj["values"] = {x1, y1, x2, y2, this->stroke, this->strokeWidth, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
     void drawCircle(int cx, int cy, int r)
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "circle";
         obj["attrs"] = {"cx", "cy", "r", "stroke", "stroke-width", "fill", "transform"};
         obj["values"] = {cx, cy, r, this->stroke, this->strokeWidth, this->fill, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
     void drawRect(int x, int y, int width, int height, int rx = 0, int ry = 0)
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "rect";
         obj["attrs"] = {"x", "y", "width", "height", "rx", "ry", "stroke", "stroke-width", "fill", "transform"};
         obj["values"] = {x, y, width, height, rx, ry, this->stroke, this->strokeWidth, this->fill, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
     void drawEllipse(int cx, int cy, int rx, int ry)
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "ellipse";
         obj["attrs"] = {"cx", "cy", "rx", "ry", "stroke", "stroke-width", "fill", "transform"};
         obj["values"] = {cx, cy, rx, ry, this->stroke, this->strokeWidth, this->fill, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
     void drawPath(const string &d)
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "path";
         obj["attrs"] = {"d", "stroke", "stroke-width", "fill", "transform"};
         obj["values"] = {d, this->stroke, this->strokeWidth, this->fill, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
     void drawText(const string &text, int x, int y, int fontSize = 16, const string &fontFamily = "sans-serif")
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "text";
         obj["content"] = text;
         obj["attrs"] = {"x", "y", "font-size", "font-family", "stroke", "stroke-width", "fill", "transform"};
         obj["values"] = {x, y, fontSize, fontFamily, this->stroke, this->strokeWidth, this->fill, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
     void drawImage(const string &href, int x, int y, int width, int height)
     {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         obj["form"] = "image";
         obj["attrs"] = {"href", "x", "y", "width", "height", "transform"};
         obj["values"] = {href, x, y, width, height, this->transform};
         AlgoViz::sendMsg(obj);
     }
  
  
     void add(xeus::xjson &obj)
     {
         obj["type"] = "svg";
         obj["cmd"] = "add";
         obj["id"] = this->id;
         obj["eid"] = -1;
         AlgoViz::sendMsg(obj);
     }
  
  
     int addElement(SVGElement *element)
     {
         if ( element->svg != nullptr ) return -2;
         this->elements[this->nextElementID] = element;
         return this->nextElementID++;
     }
  
     inline SVGElement *getElement(int id)
     {
         return this->elements[id];
     }
  
     inline SVGElement *getClickedElement()
     {
         return this->clickedElement;
     }
  
     void clicked(const xeus::xjson &obj)
     {
         this->clickedElement = this->elements[id];
         if (this->clickedElement != nullptr)
         {
             this->clickedElement->clicked();
         }
     }
  
     void load(std::string url) {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "load";
         obj["url"] = url;
         obj["id"] = this->id;
         AlgoViz::sendMsg(obj);
     }
  
     std::vector<std::string> getIDs()
     {
         std::string result = xeus::blocking_input_request("#ALGOVIZ#" + std::to_string(this->id) + "#GETIDS", false);
         xeus::xjson obj = xeus::xjson::parse(result);
         return obj["ids"];
     }
  
  
     void setAttribute(std::string id, std::string attr, std::string value) {
         auto obj = xeus::xjson::object();
         obj["type"] = "svg";
         obj["cmd"] = "idattr";
         obj["id"] = this->id;
         obj["eid"] = id;
         obj["attr"] = attr;
         obj["value"] = value;
         AlgoViz::sendMsg(obj);
     }
  
 }; // end of class SVG
  
  
 // ============================================================================================
  
  
 /********************************
  *                              *
  * Implementation of SVGElement *
  *                              *
  ********************************/
  
 SVGElement::SVGElement() 
 {
     this->svg = nullptr;
     this->id = -1;
     this->x = 0;
     this->y = 0;
     this->alpha = 0;
 }
  
  
 SVGElement::SVGElement(SVG *view)
 {
     this->x = 0;
     this->y = 0;
     this->alpha = 0;
     this->svg = nullptr;
     this->id = view->addElement(this);
     this->svg = view;
 }
  
 SVGElement::SVGElement(const SVGElement &original)
 {
     this->svg = nullptr;
     this->copy(original);
 }
  
 SVGElement::~SVGElement()  {
     this->removeFromView();
     this->svg = nullptr;
     this->id = -1;
 }
  
  
 void SVGElement::addTo(SVG *svg) {
     if ( this->svg != nullptr ) return;
     this->id = svg->addElement(this);
     this->svg = svg;
  
     this->create();
 }
  
  
 void SVGElement::create() {}
  
  
 SVGElement &SVGElement::operator=(const SVGElement &original)
 {
     this->removeFromView();
     this->copy(original);
     return *this;
 }
  
 void SVGElement::copy(const SVGElement &original)
 {
     this->x = original.x;
     this->y = original.y;
     this->alpha = original.alpha;
     this->svg = nullptr;
     this->id = original.svg->addElement(this);
  
     this->svg = original.svg;
 }
  
 xeus::xjson SVGElement::getMsg(std::string cmd)
 {
     auto obj = xeus::xjson::object();
  
     if ( this->svg != nullptr ) {
         obj["type"] = "svg";
         obj["cmd"] = cmd;
         obj["id"] = this->svg->getId();
         obj["eid"] = this->id;
     } else {
         obj["type"] = "#IGNORE";
     }
  
     return obj;
 }
  
 int SVGElement::getId()
 {
     return this->id;
 }
  
 void SVGElement::moveBy(int dx, int dy)
 {
     this->moveTo(this->x + dx, this->y + dy);
 }
  
  
 void SVGElement::sendAttributes() {
     auto msg = this->getMsg("attrs");
     list<string> a;
     list<string> v;
     for ( auto attr : this->attributes ) {        
         a.push_back(attr.first);
         v.push_back(attr.second);
     }
     msg["attrs"] = a;
     msg["values"] = v;
     AlgoViz::sendMsg(msg);
  }
  
  
 void SVGElement::setAttribute(const std::string attr, int value)
 {
     this->attributes[attr] = to_string(value);
     auto msg = this->getMsg("attrs");
     msg["attrs"] = { attr };
     msg["values"] = { value };
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::setAttribute(std::string attr, std::string value)
 {
     this->attributes[attr] = value;
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {attr};
     msg["values"] = {value};
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::rotateTo(int angle)
 {
     this->alpha = angle;
     auto msg = this->getMsg("rotate");
     msg["angle"] = angle;
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::rotateBy(int angle)
 {
     this->rotateTo(this->alpha += angle);
 }
  
 void SVGElement::toFront()
 {
     auto msg = this->getMsg("tofront");
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::hide()
 {
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"display"};
     msg["values"] = {"none"};
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::show()
 {
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"display"};
     msg["values"] = {""};
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::removeFromView()
 {
     auto msg = this->getMsg("remove");
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::setColor(string color)
 {
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"stroke"};
     msg["values"] = {color};
     this->attributes["stroke"] = color;
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::setColor(int red, int green, int blue, float alpha)
 {
  
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"stroke"};
     string color = "rgba(" + std::to_string(red) + "," + std::to_string(green) + "," + std::to_string(blue) + "," + std::to_string(alpha) + ")";
     msg["values"] = {color};
     this->attributes["stroke"] = color;
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::setFill(string color)
 {
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"fill"};
     msg["values"] = {color};
     this->attributes["fill"] = color;
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::setFill(int red, int green, int blue, float alpha)
 {
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"fill"};
     string color = "rgba(" + std::to_string(red) + "," + std::to_string(green) + "," + std::to_string(blue) + "," + std::to_string(alpha) + ")";
     this->attributes["fill"] = color;
     msg["values"] = {color};
     AlgoViz::sendMsg(msg);
 }
  
 void SVGElement::setStrokeWidth(int width)
 {
     auto msg = this->getMsg("attrs");
     msg["attrs"] = {"stroke-width"};
     msg["values"] = {width};
     this->attributes["stroke-width"] = to_string(width);
     AlgoViz::sendMsg(msg);
 }
  
 inline bool operator==(const SVGElement &left, const SVGElement &right)
 {
     return ((left.id == right.id) && (left.svg == right.svg));
 }
  
 inline bool operator!=(const SVGElement &left, const SVGElement &right)
 {
     return ((left.id != right.id) || (left.svg != right.svg));
 }
  
 void SVGElement::clicked()
 {
     if (this->clickHandler != nullptr)
     {
         this->clickHandler(this);
     }
 }
  
 void SVGElement::onclick(void (*handler)(SVGElement *))
 {
     this->clickHandler = handler;
 }
  
  
  
  
 /*****************************************
  *                                       *
  * Implementation of several SVGElements *
  *                                       *
  *****************************************/
  
 //===============================================================================
  
 class Circle : public SVGElement
 {
  
 protected:
     int radius;
  
 public:
  
     Circle() : SVGElement() {};
  
     Circle(int cx, int cy, int radius, SVG *view) : SVGElement(view)
     {
         this->x = cx;
         this->y = cy;
         this->radius = radius;
  
         this->create();
     }
  
     Circle(const Circle &original) : SVGElement(original)
     {
         this->copy(original);
     }
  
  
     Circle &operator=(const Circle &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "circle";
         msg["attrs"] = {"cx", "cy", "r"};
         msg["values"] = {this->x, this->y, this->radius};
         AlgoViz::sendMsg(msg);
     }
  
  
  
     void copy(const Circle &original)
     { // Circle(const Circle& original) : SVGElement(original) {
         SVGElement::copy(original);
         this->radius = original.radius;
  
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"cx", "cy"};
         msg["values"] = {this->x, this->y};
         AlgoViz::sendMsg(msg);
     }
  
     void setRadius(int radius)
     {
         if (radius < 0)
             return;
         this->radius = radius;
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"r"};
         msg["values"] = {radius};
         AlgoViz::sendMsg(msg);
     }
  
     inline int getRadius() { return this->radius; }
 };
  
  
 //===============================================================================
  
 class Line : public SVGElement
 {
  
 protected:
     int x2;
     int y2;
  
 public:
  
     Line() : SVGElement() {};
  
     Line(int x1, int y1, int x2, int y2, SVG *view) : SVGElement(view)
     {
         this->x = x1;
         this->y = y1;
         this->x2 = x2;
         this->y2 = y2;
  
         this->create();
     }   
  
     Line(const Line &original)
     {
         this->copy(original);
     }
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "line";
         msg["attrs"] = {"x1", "y1", "x2", "y2"};
         msg["values"] = {this->x, this->y, this->x2, this->y2};
         AlgoViz::sendMsg(msg);
         this->sendAttributes();
     }
  
  
     Line &operator=(const Line &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Line &original)
     {
         SVGElement::copy(original);
         this->x2 = original.x2;
         this->y2 = original.y2;
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x2 = x + (this->x2 - this->x);
         this->y2 = y + (this->y2 - this->y);
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"x1", "y1", "x2", "y2"};
         msg["values"] = {this->x, this->y, this->x2, this->y2};
         AlgoViz::sendMsg(msg);
     }
  
     inline int getX2() { return this->x2; }
  
  
     inline int getY2() { return this->y2; }
  
 };
  
  
 //===============================================================================
  
  
 class Rect : public SVGElement
 {
  
 protected:
     int w;
     int h;
     int rx;
     int ry;
  
 public:
     Rect() : SVGElement() {};
  
     Rect(int x, int y, int w, int h, int rx, int ry, SVG *view) : SVGElement(view)
     {
         this->x = x;
         this->y = y;
         this->w = w;
         this->h = h;
         this->rx = 0;
         this->ry = 0;
  
         this->create();
     }
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "rect";
         msg["attrs"] = {"x", "y", "width", "height", "rx", "ry"};
         msg["values"] = {this->x, this->y, this->w, this->h, this->rx, this->ry};
         AlgoViz::sendMsg(msg);
         this->sendAttributes();
     }
  
     Rect(int x, int y, int w, int h, SVG *view) : Rect(x, y, w, h, 0, 0, view) {}
  
     Rect(const Rect &original)
     {
         this->copy(original);
     }
  
  
     Rect &operator=(const Rect &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Rect &original)
     {
         SVGElement::copy(original);
         this->w = original.w;
         this->h = original.h;
         this->rx = original.rx;
         this->ry = original.ry;
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"x", "y"};
         msg["values"] = {this->x, this->y};
         AlgoViz::sendMsg(msg);
     }
  
     void setWidth(int w)
     {
         this->w = w;
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"width"};
         msg["values"] = {this->w};
         AlgoViz::sendMsg(msg);
     }
  
     void setHeight(int h)
     {
         this->h = h;
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"height"};
         msg["values"] = {this->h};
         AlgoViz::sendMsg(msg);
     }
  
  
     inline int getWidth() { return this->w; }
  
  
     inline int getHeight() { return this->h; }
  
 };
  
  
 //===============================================================================
  
  
 class Ellipse : public SVGElement
 {
  
 protected:
     int rx;
     int ry;
  
 public:
  
     Ellipse() : SVGElement() {};
  
     Ellipse(int cx, int cy, int rx, int ry, SVG *view) : SVGElement(view)
     {
         this->x = cx;
         this->y = cy;
         this->rx = rx;
         this->ry = ry;
  
         this->create();
     }
  
  
     void create() {        
         auto msg = this->getMsg("add");
         msg["form"] = "ellipse";
         msg["attrs"] = {"cx", "cy", "rx", "ry"};
         msg["values"] = {this->x, this->y, this->rx, this->ry};
         AlgoViz::sendMsg(msg);
     }
  
     Ellipse(const Ellipse &original)
     {
         this->copy(original);
     }
  
     Ellipse &operator=(const Ellipse &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Ellipse &original)
     {
         SVGElement::copy(original);
         this->rx = original.rx;
         this->ry = original.ry;
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"cx", "cy"};
         msg["values"] = {this->x, this->y};
         AlgoViz::sendMsg(msg);
     }
  
     void setRadii(int rx, int ry)
     {
         this->rx = rx;
         this->ry = ry;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"rx", "ry"};
         msg["values"] = {this->rx, this->ry};
         AlgoViz::sendMsg(msg);
     }
  
     inline int getRadiusX() { return this->rx; }
  
  
     inline int getRadiusY() { return this->ry; }
  
 };
  
  
 //===============================================================================
  
  
 class Text : public SVGElement
 {
  
 protected:
     std::string content;
  
 public:
  
     Text() : SVGElement() {};
  
     Text(std::string text, int x, int y, SVG *view) : SVGElement(view)
     {
         this->x = x;
         this->y = y;
         this->content = text;
  
         this->create();
     }
  
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "text";
         msg["attrs"] = {"x", "y"};
         msg["values"] = {this->x, this->y};
         msg["content"] = this->content;
         AlgoViz::sendMsg(msg);
     }
  
     Text(const Text &original)
     {
         this->copy(original);
     }
  
  
     Text &operator=(const Text &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Text &original)
     {
         SVGElement::copy(original);
         this->content = original.content;
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"x", "y"};
         msg["values"] = {this->x, this->y};
         AlgoViz::sendMsg(msg);
     }
  
     void setText(std::string text)
     {
         this->content = text;
  
         auto msg = this->getMsg("settext");
         msg["content"] = this->content;
         AlgoViz::sendMsg(msg);
     }
  
     inline std::string getText() { return this->content; }
  
 };
  
  
 //===============================================================================
  
  
 class Path : public SVGElement
 {
  
 protected:
     std::string d;
  
 public:
  
     Path() : SVGElement() {};
  
     Path(std::string path, SVG *view) : SVGElement(view)
     {
         this->d = path;
         this->create();
     }
  
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "path";
         msg["attrs"] = {"d", "fill"};
         msg["values"] = {this->d, "transparent"};
         AlgoViz::sendMsg(msg);
     }
  
     Path(const Path &original)
     {
         this->copy(original);
     }
  
  
     Path &operator=(const Path &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Path &original)
     {
         SVGElement::copy(original);
         this->d = original.d;
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("transform");
         msg["x"] = this->x;
         msg["y"] = this->y;
         msg["angle"] = this->alpha;
         AlgoViz::sendMsg(msg);
     }
  
     void rotateTo(int alpha)
     {
         this->alpha = alpha;
  
         auto msg = this->getMsg("transform");
         msg["x"] = this->x;
         msg["y"] = this->y;
         msg["angle"] = this->alpha;
         AlgoViz::sendMsg(msg);
     }
  
     void setPath(std::string path)
     {
         this->d = path;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"d"};
         msg["values"] = {this->d};
         AlgoViz::sendMsg(msg);
     }
 };
  
  
 //===============================================================================
  
  
 class Group : public SVGElement
 {
  
 public:
  
     Group() : SVGElement() {};
  
     Group(SVG *view) : SVGElement(view)
     {
         this->x = 0;
         this->y = 0;
         this->create();
     }
  
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "g";
         AlgoViz::sendMsg(msg);
     }
  
     Group(const Group &original)
     {
         this->copy(original);
     }
  
  
     Group &operator=(const Group &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Group &original)
     {
         SVGElement::copy(original);
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"transform"};
         msg["values"] = {"translate(" + std::to_string(this->x) + "," + std::to_string(this->y) + ")"};
         AlgoViz::sendMsg(msg);
     }
  
     void add(xeus::xjson obj)
     {
         obj["type"] = "svg";
         obj["cmd"] = "addChild";
         obj["id"] = svg->getId();
         obj["eid"] = this->id;
         obj["childid"] = -1;
         AlgoViz::sendMsg(obj);
     }
  
     void add(SVGElement *element)
     {
         auto msg = this->getMsg("addChild");
         msg["childid"] = element->getId();
         msg["eid"] = this->id;        
         AlgoViz::sendMsg(msg);
     }
  
     void remove(SVGElement *element)
     {
         auto msg = this->getMsg("removeChild");
         msg["childid"] = element->getId();
         AlgoViz::sendMsg(msg);
     }
  
     void clear()
     {
         auto msg = this->getMsg("empty");
         AlgoViz::sendMsg(msg);
     }
 };
  
  
 //===============================================================================
  
  
 class Image : public SVGElement
 {
  
 protected:
     int w;
     int h;
     std::string path;
  
 public:
  
     Image() : SVGElement() {};
  
     Image(const std::string path, int x, int y, int w, int h, SVG *view) : SVGElement(view)
     {
         this->x = x;
         this->y = y;
         this->w = w;
         this->h = h;
         this->path = path;
         this->create();
     }
  
  
     void create() {
         auto msg = this->getMsg("add");
         msg["form"] = "image";
         msg["attrs"] = {"width", "height", "href"};
  
         if ((path[0] != '/'))
         {
             msg["values"] = {this->w, this->h, path};
         }
         else
         {
             msg["values"] = {this->w, this->h, path};
         }
         AlgoViz::sendMsg(msg);
  
         this->moveTo(this->x, this->y);
     }
  
     Image(const Image &original)
     {
         this->copy(original);
     }
     
  
     Image &operator=(const Image &original)
     {
         this->removeFromView();
         this->copy(original);
         return *this;
     }
  
  
     void copy(const Image &original)
     {
         SVGElement::copy(original);
         this->w = original.w;
         this->h = original.h;
         this->path = original.path;
         auto msg = this->getMsg("clone");
         msg["original"] = original.id;
         AlgoViz::sendMsg(msg);
     }
  
     void moveTo(int x, int y)
     {
         this->x = x;
         this->y = y;
  
         auto msg = this->getMsg("transform");
         msg["x"] = this->x;
         msg["y"] = this->y;
         msg["angle"] = this->alpha;
         AlgoViz::sendMsg(msg);
     }
  
     void rotateTo(int alpha)
     {
         this->alpha = alpha;
  
         auto msg = this->getMsg("transform");
         msg["x"] = this->x;
         msg["y"] = this->y;
         msg["angle"] = this->alpha;
         AlgoViz::sendMsg(msg);
     }
  
     void setSize(int w, int h)
     {
         this->w = w;
         this->h = h;
  
         auto msg = this->getMsg("attrs");
         msg["attrs"] = {"width", "height"};
         msg["values"] = {this->w, this->h};
         AlgoViz::sendMsg(msg);
     }
 };
  
  
 #endif