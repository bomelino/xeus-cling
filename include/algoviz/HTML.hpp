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
  
 #ifndef VIEW_HPP
 #define VIEW_HPP
  
 #include <string>
 #include "xeus/xjson.hpp"
 #include "nlohmann/json.hpp"
 #include "AlgoViz.hpp"
  
 using namespace std;
  
  
 // ===============================================================================
  
  
 class HTML : public AlgoVizView
 {
  
 public:
     HTML(int width, int height)
     {
         this->type = "view";
         this->create(width, height);
     }
  
     void set(const std::string &content)
     {
         auto msg = xeus::xjson::object();
         msg["type"] = "view";
         msg["cmd"] = "set";
         msg["content"] = content;
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
  
     void append(const std::string &content)
     {
         auto msg = xeus::xjson::object();
         msg["type"] = "view";
         msg["cmd"] = "add";
         msg["content"] = content;
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
  
     void setAttribute(const std::string &name, const std::string &value)
     {
         auto msg = xeus::xjson::object();
         msg["type"] = "view";
         msg["cmd"] = "style";
         msg["name"] = name;
         msg["value"] = value;
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
  
     void setAttribute(const std::string &name, int value)
     {
         auto msg = xeus::xjson::object();
         msg["type"] = "view";
         msg["cmd"] = "style";
         msg["name"] = name;
         msg["value"] = value;
         msg["id"] = this->id;
         AlgoViz::sendMsg(msg);
     }
 };
  
 #endif
