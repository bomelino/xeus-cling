/**
 ** Die Klasse IntList
 **
 ** Autor mbrinkmeier@uni-osnabrueck.de
 **
 ** Die Klasse Liste implementiert eine doppelt-verlinkte Liste.
 **
 **/

#ifndef INTLIST_HPP
#define INTLIST_HPP

#include "IntIterator.hpp"


/**
 ** Die Klasse IntList
 **
 ** Diese KLasse verwaltet eine verkettete Sequenz von Items.
 **/
class IntList {
    
    friend class Iterator;
    
    private:
        // Der Anfang und das Ende
        IntItem *head;
        IntItem *tail;
    
    public:
        /*
         * Der Destruktor räumt alle Items ab
         */
        ~IntList() {
            IntItem *item = head;
            IntItem *next = nullptr;
            
            // Lösche alle Items
            while ( item != nullptr ) {                
                // MErke die das nächste Item
                next = item->getNext();      
                
                // Lösche das aktuelle
                delete item;
                
                // Gehe zum nächsten
                item = next;
            }
        } 
    

        /*
         * Der Konstruktor legt eine leere Liste an
         */
        IntList() {
            head = nullptr;
            tail = nullptr;
        }
    
        /*
         * Die Liste ist leer, wenn sie keinen Kopf hat.
         */
        bool empty() {
            return ( head == nullptr );
        }
    
    
        /*
         * Gebe den ersten Wert zurück.
         */
        int front() {
            if ( head == nullptr ) {
                return 0;
            }
            return head->getData();
        }
        
        /*
         * Füge vorne einen neuen Wert ein.
         */
        void push_front(int data) {
            // Erzeuge ein neues Item
            IntItem *neu = new IntItem(data);
            
            // Stelle das Item vor das erste
            neu->setNext(this->head);
            
            // Falls ein erstes Item existirt, stelle das neu voran
            if ( head != nullptr ) {
                head->setPrev(neu);
            }
            
            // MAch das neue Item zum head
            head = neu;
            
            // Falls die Liste leer war, ist das neue ELement auch der tail
            if ( tail == nullptr ) {
                tail = neu;
            }            
        }
            

        /*
         * Entferne den ersten Wert.
         */
        int pop_front() {
            // Merke dir den alten head
            IntItem *e = this->head;
            
            // Falls es keinen gab, höre einfach auf.
            if ( e == nullptr ) {
                return 0;
            }
            
            // Der neue head ist der Nachfolger des alten.
            head = e->getNext();
            
            // Koppel den alten ab
            e->setNext(nullptr);
            
            // Setze den Vorgaenger des neuen head auf nullptr
            if ( head != nullptr ) {
                head->setPrev(nullptr);
            }
            
            // Falls das entfernte Item tail war, ist die Liste leer
            if ( tail == e ) {
                tail = nullptr;
            }            
            
            // Merke dir den Wert und lösche das Item
            int data = e->getData();
            delete e;
            
            // Gib den Wert zurück
            return data;
        }

    
        /*
         * Hole den letzten Wert.
         */
        int back() {
            if ( tail == nullptr ) {
                return 0;
            }
            return tail->getData();
        }
        
    
        /*
         * Füge hinten einen neuen Wert ein.
         */
        void push_back(int data) {
            // Erzeuge ein neues Item
            IntItem *neu = new IntItem(data);

            // Stelle das Item hinter das letzte
            neu->setPrev(tail);            
            
            // Falls ein letztes Item existiert, stelle das neu dahnter
            if ( tail != nullptr ) {
                tail->setNext(neu);
            }
            
            
            // Mach das neue Item zum tail
            tail = neu;
            
            // Falls die Liste leer war, ist das neue Element auch der head
            if ( head == nullptr ) {
                head = neu;
            }            
        }
            

        /*
         * Entferne den letzten Wert
         */
        void pop_back() {
            // Merke dir den alten tail
            IntItem *e = tail;
            
            // Falls es keinen gab, höre einfach auf.
            if ( e == nullptr ) {
                return 0;
            }
            
            // Der neue tail ist der Vorgaenger des alten.
            tail = e->getPrev();
            
            // Hange den alten tail ab
            e->setPrev(nullptr);
            
            // Falls es einen neuen tail gibt (die Liste ist nicht leer), setze seinen Nachfolger auf nullptr
            if ( tail != nullptr ) {
                tail->setNext(nullptr);
            }
            
            // Falls der alte tail auch der head war, ist die Liste jetzt leer
            if ( head == e ) {
                head = nullptr;
            }            
            
            // Merke dir den gelöschten Wert
            int data = e->getData();
            delete e;
            
            // Gebe den gelöschten Wert zurück
            return data;
        }
    
    
        
        /**
         * Neue Methoden, um Iteratoren zu erhalten.
         */
    
        /**
         * Erzeuge einen Iterator, der auf das erste Element zeigt.
         */
        IntIterator begin() {
            IntIterator it = IntIterator(this,head);
            return it;
        }    
    
        /**
         * Erzeuge einen Iterator, der auf das letzte Element zeigt.
         */
        IntIterator end() {
            IntIterator it = IntIterator(this,tail);
            return it;
        }
    
        /**
         * Lösche das Element auf das der ITerator zeigt.
         * Anschließend zeigt der Iterator auf das nächste Element.
         */
        IntIterator erase(IntIterator &it) {
            IntItem *current = it.getCurrent();

            if ( current == nullptr ) return IntIterator(this,nullptr);

            IntItem *e1 = current->getPrev();
            IntItem *e2 = current->getNext();

            if ( e1 != nullptr) e1->setNext(e2);
            if ( e2 != nullptr) e2->setPrev(e1);

            delete current;

            return IntIterator(this,e2);
        };    
    
        /**
         * Füge eine Element vor dem aktuellen ein.
         * Der Iterator zeigt anschließend auf das neu eingefügte Element.
         */
        IntIterator insert(IntIterator &it, int data) {
            IntItem *current = it.getCurrent();

            if ( current == nullptr ) return IntIterator(this,nullptr);

            IntItem *neu = new IntItem(data);
            IntItem *prev = current->getPrev();

            neu->setNext(current);
            neu->setPrev(prev);

            if ( prev != nullptr ) prev->setNext(neu);

            current->setPrev(neu);

            return IntIterator(this,neu);
        };
};    
#endif