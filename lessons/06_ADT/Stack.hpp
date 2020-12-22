#ifndef STACK_HPP
#define STACK_HPP

#include <list>
using namespace std;

template <typename T> class Stack {

    private:
        list<T> liste;

    public:
        Stack() {}

        bool isEmpty() {
            return liste.empty();
        };


        T top() {
            return liste.front();
        }

        void push(T data) {
            liste.push_front(data);
        }

        T pop() {
            T val = liste.front();
            liste.pop_front();
            return val;
        }
};

#endif