#ifndef QUEUE_HPP
#define QUEUE_HPP

#include <list>
using namespace std;
template <typename T> class Queue {

    private:
        list<T> liste;

    public:
        Queue() {}

        bool isEmpty() {
            return liste.empty();
        };


        T peek() {
            return liste.front();
        }

        void enqueue(T data) {
            liste.push_back(data);
        }

        T dequeue() {
            T val = liste.front();
            liste.pop_front();
            return val;
        }
};

#endif