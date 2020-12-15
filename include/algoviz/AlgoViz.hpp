/** 
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
  
 #ifndef ALGOVIZ_HPP
 #define ALGOVIZ_HPP
  
 #define ALGOVIZ_VERSION "2020-11-20"
  
 #include <string>
 #include <iostream>
 #include <unistd.h>
 #include <map>
 #include <chrono>
 #include "xcpp/xdisplay.hpp"
 #include "xeus/xcomm.hpp"
 #include "xeus/xinterpreter.hpp"
 #include "xeus/xjson.hpp"
 #include "xeus/xinput.hpp"
 #include "nlohmann/json.hpp"
  
 using namespace std;
  
 class MouseState
 {
  
 protected:
     int _x;
     int _y;
     int _screenX;
     int _screenY;
     int _buttons;
     bool _legal;
  
 public:
  
     MouseState()
     {
         this->_x = -1;
         this->_y = -1;
         this->_screenX = -1;
         this->_screenY = -1;
         this->_buttons = -1;
         this->_legal = false;
     }
  
  
     MouseState(const xeus::xjson &data)
     {
         this->_x = data["x"];
         this->_y = data["y"];
         this->_screenX = data["screenx"];
         this->_screenY = data["screeny"];
         this->_buttons = data["buttons"];
         this->_legal = data["legal"];
     }
     std::string m_content;
  
     inline int x() { return this->_x; }
  
     inline int y() { return this->_y; }
  
     inline int screenX() { return this->_screenX; }
  
     inline int screenY() { return this->_screenY; }
  
     inline int buttons() { return this->_buttons; }
  
     inline bool left() { return (this->_buttons == 0 ); }
  
     inline bool right() { return (this->_buttons == 2 ); }
  
     inline bool middle() { return (this->_buttons == 1 ); }
  
     inline bool isLegal() { return this->_legal; }
 };
  
  
 // ===============================================================================
  
  
 class AlgoViz
 {
  
  
 public:
     static std::chrono::time_point<std::chrono::steady_clock> lastMessageTime;
  
     static std::string version();
  
     static void init();
  
     static void clear();
  
     static void show();
  
     static void hide();
  
     static void sendText(const std::string &msg);
  
     static inline void sleep(int msec);
  
     static void sendMsg(const xeus::xjson &msg);
  
  
     static xeus::xjson sendBlockingMsg(const xeus::xjson &msg);
  
     static void html(const std::string &content);
  
     static void sendCode(const std::string code);
  
     static void slideshow(const std::string &content, const std::string &server = "https://abbozza.informatik.uos.de/aud/slideshows/html/viewer.html", const std::string &width = "100%", const std::string &height = "700px");
  
  
     static std::string getColor(int red, int green, int blue, float alpha = 1.0);
  
     static void _slideshow(const std::string &id, const std::string &title, const std::string &content, const double ratio);
  
     inline static std::string lastMessage();
  
     static void handleMessage(const nl::json &msg);
  
     static std::string getMouse();
  
 };
  
 // =====================================================================================
  
 class AlgoVizView
 {
  
 public:
     static map<int, AlgoVizView *> views;
     static int nextViewID;
  
 protected:
     int id;
     string type;
     int rowHeight = 80;
     int colWidth = 80;
  
 public:
  
     virtual ~AlgoVizView() {}
  
     void create(int width, int height, std::string title = "")
     {
         this->id = AlgoVizView::nextViewID;
         AlgoVizView::views[this->id] = this;
         AlgoVizView::nextViewID++;
  
         auto msg = xeus::xjson::object();
         msg["type"] = this->type;
         msg["cmd"] = "create";
         msg["width"] = width;
         msg["height"] = height;
         msg["id"] = this->id;
         msg["title"] = title;
         AlgoViz::sendMsg(msg);
     }
  
     void hide()
     {
         auto msg = xeus::xjson::object();
         msg["type"] = this->type;
         msg["cmd"] = "hide";
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
  
     void show()
     {
         auto msg = xeus::xjson::object();
         msg["type"] = this->type;
         msg["cmd"] = "show";
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
  
     virtual void clear()
     {
         auto msg = xeus::xjson::object();
         msg["type"] = this->type;
         msg["cmd"] = "clear";
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
  
  
     virtual void handleMessage(const nl::json &msg) {}
  
  
     static AlgoVizView *getView(int id)
     {
         if (AlgoVizView::views.find(id) != AlgoVizView::views.end())
         {
             return AlgoVizView::views[id];
         }
         return nullptr;
     }
  
     inline std::string toString()
     {
         return "View " + std::to_string(this->id);
     }
  
     std::string waitForKey()
     {
         return xeus::blocking_input_request("#ALGOVIZ#" + std::to_string(this->id) + "#GETKEY", false);
     }
  
     std::string lastKey()
     {
         return xeus::blocking_input_request("#ALGOVIZ#" + std::to_string(this->id) + "#LASTKEY", false);
     }
  
     MouseState getMouseState()
     {
         MouseState data;
         std::string datas = xeus::blocking_input_request("#ALGOVIZ#" + std::to_string(this->id) + "#MOUSE", false);
         try
         {
             xeus::xjson dataj = xeus::xjson::parse(datas);
             data = MouseState(dataj);
         }
         catch (...)
         {
             data = MouseState();
         }
         return data;
     }
  
     MouseState lastClick()
     {
         MouseState data = MouseState();
         std::string datas = xeus::blocking_input_request("#ALGOVIZ#" + std::to_string(this->id) + "#LASTCLICK", false);
         try
         {
             xeus::xjson dataj = xeus::xjson::parse(datas);
             data = MouseState(dataj);            
         }
         catch (...)
         {}
         return data;
     }
  
     MouseState waitForClick()
     {
         MouseState data = MouseState();
         std::string datas = xeus::blocking_input_request("#ALGOVIZ#" + std::to_string(this->id) + "#GETCLICK", false);
         try
         {
             xeus::xjson dataj = xeus::xjson::parse(datas);
             data = MouseState(dataj);
             clicked(dataj);
         }
         catch (...)
         {
         }
         return data;
     }
  
  
     inline int getId()
     {
         return this->id;
     }
  
     virtual void clicked(const xeus::xjson &data) {}
  
  
     void setStatusMsg(string status) 
     {
         auto msg = xeus::xjson::object();
         msg["type"] = this->type;
         msg["cmd"] = "status";
         msg["msg"] = status;
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
  
     }
  
  
     void clearStatusMsg() 
     {
         auto msg = xeus::xjson::object();
         msg["type"] = this->type;
         msg["cmd"] = "clearStatus";
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);        
     }
  
 }; // class AlgoVizView
  
  
 // =================================================================================
  
  
 map<int, AlgoVizView *> AlgoVizView::views = map<int, AlgoVizView *>();
  
 int AlgoVizView::nextViewID = 0;
  
  
 // =================================================================================
  
  
 namespace algoviz
 {
  
     class CommHandler;
  
     algoviz::CommHandler *comm = nullptr;
  
     int nextViewID = 0;
     int nextScriptID = 0;
  
     struct html
     {
         inline html(const std::string &content)
         {
             m_content = content;
         }
         std::string m_content;
     };
  
     xeus::xjson mime_bundle_repr(const html &a)
     {
         auto bundle = xeus::xjson::object();
         bundle["text/html"] = a.m_content;
         return bundle;
     };
  
     struct script_t
     {
         inline script_t(const std::string &content)
         {
             m_content = content;
         }
         std::string m_content;
     };
  
     xeus::xjson mime_bundle_repr(const script_t &m)
     {
         auto bundle = xeus::xjson::object();
         auto id = std::string("algoviz") + std::to_string(nextViewID);
         bundle["text/html"] = std::string("<script id=\"" + id + "\">") + "try{AlgoViz.processMsg(" + m.m_content + ",\"" + id + "\");}catch(ex){}" + "</script>";
         nextViewID++;
         usleep(1000);
         return bundle;
     };
  
     class CommHandler
     {
  
     private:
         nl::json _data;
         xeus::xcomm *_comm;
  
     public:
         CommHandler()
         {
             xeus::get_interpreter()
                 .comm_manager()
                 .register_comm_target("algoviz", std::bind(&CommHandler::opened, this, std::placeholders::_1, std::placeholders::_2));
             this->_comm = new xeus::xcomm(xeus::get_interpreter().comm_manager().target("algoviz"), xeus::new_xguid());
  
             this->_comm->on_message(std::bind(&CommHandler::handleMessage, this, std::placeholders::_1));
             this->_comm->on_close(std::bind(&CommHandler::closed, this, std::placeholders::_1));
  
             nl::json metadata;
             nl::json data;
             data["foo"] = 42;
             this->_comm->open(std::move(metadata), std::move(data), xeus::buffer_sequence());
         }
  
         void opened(xeus::xcomm &&comm, const xeus::xmessage &msg) {}
  
         void closed(const xeus::xmessage &msg)
         {
             if (algoviz::comm == this)
             {
                 algoviz::comm = nullptr;
             }
         }
  
         void handleMessage(const xeus::xmessage &msg)
         {
             const nl::json &content = msg.content();
             this->_data = content["data"];
  
             AlgoViz::handleMessage(this->_data);
         }
  
         inline xeus::xcomm *comm()
         {
             return this->_comm;
         }
  
         inline std::string lastReceived()
         {
             if (this->_data == nullptr)
                 return "<null>";
             return this->_data.dump();
         }
  
         inline void send(const nl::json &data)
         {
             nl::json metadata;
             this->_comm->send(std::move(metadata), std::move(data), xeus::buffer_sequence());
         }
     };
  
 }; // namespace algoviz
  
  
 // ====================================================================================
  
 std::chrono::time_point<std::chrono::steady_clock> AlgoViz::lastMessageTime;
  
 std::string AlgoViz::version()
 {
     return ALGOVIZ_VERSION;
 }
  
  
 void AlgoViz::init()
 {
     auto msg = xeus::xjson::object();
     msg["type"] = "init";
     AlgoViz::sendMsg(msg);
 }
  
 void AlgoViz::clear()
 {
     AlgoViz::show();
     auto msg = xeus::xjson::object();
     msg["type"] = "clear";
     AlgoViz::sendMsg(msg);
  
     for (std::map<int,AlgoVizView*>::iterator it=AlgoVizView::views.begin(); it!=AlgoVizView::views.end(); ++it) {
         it->second->clear();
     }
     AlgoVizView::views.clear();
     AlgoVizView::nextViewID = 0;
 }
  
 void AlgoViz::show()
 {
     auto msg = xeus::xjson::object();
     msg["type"] = "show";
     AlgoViz::sendMsg(msg);
     usleep(1000);
 }
  
 void AlgoViz::hide()
 {
     auto msg = xeus::xjson::object();
     msg["type"] = "hide";
     AlgoViz::sendMsg(msg);
 }
  
 void AlgoViz::sendText(const std::string &text)
 {
     auto msg = xeus::xjson::object();
     msg["type"] = "msg";
     msg["content"] = text;
     // auto text = std::string("{ type: \"html\", content:\"") + msg + "\"}";
     // auto msgObj = algoviz::script_t(text);
     // xcpp::display(msgObj);
     AlgoViz::sendMsg(msg);
 }
  
 inline void AlgoViz::sleep(int msec)
 {
     usleep(1000 * msec);
 }
  
 void AlgoViz::sendMsg(const xeus::xjson &msg)
 {
     if (algoviz::comm == nullptr)
     {
         algoviz::comm = new algoviz::CommHandler();
         AlgoViz::lastMessageTime = chrono::steady_clock::now();
     }
  
     if ( msg["type"] != "#IGNORE") {
        /*
         auto now = chrono::steady_clock::now();
         auto dur = chrono::duration_cast<chrono::microseconds>(now - AlgoViz::lastMessageTime).count();
         if ( dur < 1500.0 ) {
             usleep((1500.0-dur));
         }
         algoviz::comm->send(msg);
         AlgoViz::lastMessageTime = chrono::steady_clock::now();
         */
         algoviz::comm->send(msg);
     }
 }
  
  
 inline xeus::xjson AlgoViz::sendBlockingMsg(const xeus::xjson &msg) 
 {
     std::string answer = xeus::blocking_input_request("#JSON#" + msg.dump() , false);
     auto obj = xeus::xjson::parse(answer);
     return obj;
 }
  
  
 // @private
 void AlgoViz::sendCode(string code) {
         auto msg = xeus::xjson::object();
         msg["type"] = "code";
         msg["code"] = to_string(hash<string>{}(code));
         AlgoViz::sendMsg(msg);
 }
  
  
 void AlgoViz::html(const std::string &content)
 {
     auto obj = algoviz::html(content);
     xcpp::display(obj);
 }
  
  
 void AlgoViz::slideshow(const std::string &content, const std::string &server, const std::string &width, const std::string &height)
 {
     auto text = std::string("<div class='slideshow'>") + "<div  style=\"display:block\"><iframe src=\"" + server + "?" + content + "\" width='" + width + "' height='" + height + "'></iframe></div>" + "<div class='collapsebtn' style='position:absolute;top:0px;right:0px' onclick='" + "   console.log(\"CLICK\");" + "   console.log(this.previousSibling);" + "   console.log(this.previousSibling.style);" + "   if ( this.previousSibling.style.display==\"none\") {" + "      this.previousSibling.style.display=\"block\";" + "   } else {" + "      this.previousSibling.style.display=\"none\";" + "   }'><i class=\"fa fa-eye-slash fa-2x\"></i></div>" + "</div>";
     auto obj = algoviz::html(text);
     xcpp::display(obj);
 }
  
  
 std::string AlgoViz::getColor(int red, int green, int blue, float alpha)
 {
     return "rgba(" + std::to_string(red) + "," + std::to_string(green) + "," + std::to_string(blue) + "," + std::to_string(alpha) + ")";
 }
  
  
 void AlgoViz::_slideshow(const std::string &id, const std::string &title, const std::string &content, const double ratio)
 {
     auto text = std::string("<div class='slideshowContainer' id='" + id + "'></div><script>AlgoViz.injectSlideshow('" + id + "','" + title + "','" + content + "'," + std::to_string(ratio) + ")</script>");
     auto obj = algoviz::html(text);
     xcpp::display(obj);
 }
  
  
 void AlgoViz::handleMessage(const nl::json &msg)
 {
     // AlgoViz::sendMsg(msg);
  
     int id = msg["view"];
  
     if (msg["view"] != -1)
     {
         AlgoVizView *view = AlgoVizView::getView(msg["view"]);
         if (view != nullptr)
         {
             view->handleMessage(msg);
             return;
         }
     }
 }
  
  
 std::string AlgoViz::lastMessage()
 {
     return algoviz::comm->lastReceived();
 }
  
 #endif