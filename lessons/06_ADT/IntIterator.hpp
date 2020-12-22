/**
 ** Die Klasse IntList
 **
 ** Autor mbrinkmeier@uni-osnabrueck.de
 **
 ** Die Klasse Liste implementiert eine doppelt-verlinkte Liste.
 **
 **/

#ifndef INTITERATOR_HPP
#define INTITERATOR_HPP


#include "IntItem.hpp"

class IntList;

/*
 * Die zusätzliche Klasse für den Iterator.
 */
class IntIterator {
    
    friend class IntList;
    friend class IntItem;
    
    private:
        IntList *list;
    
        /**
         * current ist das aktuelle Item. Der Zeiger ist nullptr
         * wenn das Item vor dem ersten oder hinter dem letzten
         * Element ist.
         */
        IntItem *current;
    
    protected:
        /**
         * Erzeuge einen Iterator, der auf das erste Element
         * der Liste zeigt.
         */
        IntIterator(IntList *list, IntItem *item) {
            this->list = list;
            current = item;
        }
    
    
    public:            
        /**
         * Prüft, ob das aktuelle Element einen Nachfolger hat.
         */
        bool hasNext() {
            if ( current == nullptr ) return false;
            
            return ( current->getNext() != nullptr );            
        }

    
        /**
         * Prüft, ob das aktuelle Element einen Vorgaenger hat.
         */
        bool hasPrev() {
            if ( current == nullptr ) return false;

            return ( current->getPrev() != nullptr );            
        }
    
    
        /**
         * Geht zum Nachfolger,
         */
        void toNext() {
            if ( current != nullptr ) {
                current = current->getNext();
            }
        }
    
    
        /**
         * Geht zum Vorgaenger.
         */
        void toPrev() {
            if ( current != nullptr ) {
                current = current->getPrev();
            }
        }
    
    
        /**
         * Gibt den aktuellen Wert zurück.
         */
        int getData() {
            if ( current != nullptr ) {
                return current->getData();
            }            
            return 0;
        }
    
    
        /**
         * Prüft ob das aktuelle Element am Ende ist.
         */
        bool end() {
            return ( current == nullptr );
        }  


        IntItem *getCurrent() {
            return current;
        }
};

#endif