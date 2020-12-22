/**
 ** Die Klasse IntItem
 **
 ** Autor mbrinkmeier@uni-osnabrueck.de
 **
 ** Die Klasse IntItem implementiert die Elemente einer
 ** einer doppelt-verketteten Liste von int-Werten.
 **/

#ifndef INTITEM_HPP
#define INTITEM_HPP

class IntList;
class IntIterator;

class IntItem {

    /* 
     * Objekte der Klassen IntList und IntIterator
     * duerfen auf die "protected" Methoden von Int
     * zugreifen.
     */
    friend class IntList;
    friend class IntIterator;
   

    // Die Attribute darf nur IntItem selbst verändern
    private:
        int data;
        IntItem *prev;
        IntItem *next;
    
    
    // Freunde der Klasse Item duerfen über die
    // Methoden die Attribute verändern.
    protected:

        /**
         * Der Standardkonstruktor.
         */
        IntItem() {
            data = 0;
            next = nullptr;
            prev = nullptr;
        }
    
        /*
         * Dieser Konstruktor legt den gespeicherten Wert fest.
         */
        IntItem(int data) {
            this->data = data;
            next = nullptr;
            prev = nullptr;
        }
    
        /*
         * Setze den Nachfolger
         */
        void setNext(IntItem *next) {
            this->next = next;
        }
    
        /*
         * Hole den Nachfolger
         */
        IntItem *getNext() {
            return next;
        }
    
        /*
         * Setze den Vorgaenger
         */
        void setPrev(IntItem *prev) {
            this->prev = prev;
        }
    
        /*
         * Hole den Vorgänger
         */
        IntItem *getPrev() {
            return prev;
        }
    
        /*
         * Setze den gespeicherten Wert.
         */
        void setData(int data) {
            this->data = data;
        }
    
        /*
         * Hole den gespeicherten Wert.
         */
        int getData() {
            return data;
        }
};

#endif