/**
 ** Die Klasse Bruch
 **
 ** Diese Klasse repräsentiert einen gemischten Bruch.
 **/

#include <iostream>
#include <string>
using namespace std;

class Bruch {
    
    private:
        // Die privaten Attribute
        int ganzerAnteil;   // Der ganze Anteil
        int zaehler;        // Der Zähler
        int nenner;         // Der Nenner
    
    
    public:
         /***********************
          ** Die Konstruktoren **
          ***********************/
        
        /**
         ** Der Standardkonstruktor
         **/
        Bruch() {
            ganzerAnteil = 0;
            zaehler = 0;
            nenner = 1;
        }
    
    
        /**
         ** Dieser Konstruktor legt alle Attribute fest.
         **/
        Bruch(int ganzerAnteil, int zaehler, int nenner) {            
            this-> ganzerAnteil = ganzerAnteil;
            this->zaehler = zaehler;
            this->nenner = nenner;
        }
    
    
        /**
         ** Dieser Konstruktor setzt nur den ganzen Anteil.
         **/
        Bruch(int ganzerAnteil) {
            this->ganzerAnteil = ganzerAnteil;
            zaehler = 0;    // Es gibt keinen Parameter mit dem Namen!
            nenner = 1;
            repair();
        }
    
    
        /**
         ** Dieser Konstruktor setzt nur den Bruchteil.
         **/
        Bruch(int zaehler, int nenner) {
            ganzerAnteil = 0;
            this->zaehler = zaehler;
            this->nenner = nenner;
            repair();
        }
    
    
        /**
         ** Dieser Konstruktor erzeugt eine Kopie des übergebenen Bruchs.
         **/
        Bruch(Bruch &original) {
            ganzerAnteil = original.ganzerAnteil;
            zaehler = original.zaehler;
            nenner = original.nenner;
        }

    
        /** 
         ** Gib den Bruch als String zurück.
         **/
        string toString() {
            if ( zaehler == 0 ) {
                return to_string(ganzerAnteil);
            } else if ( ganzerAnteil == 0 ) {
                return "(" + to_string(zaehler) + "/" + to_string(nenner) + ")";
            } else {
                return to_string(ganzerAnteil) + " + (" + to_string(zaehler) + "/" + to_string(nenner) + ")";
            }
        }
    
    
        /**
         ** Gib den String auf cout aus.
         **/
        void print() {
            cout << toString();
        }
    
    
        /**
         ** Gib den Wert des Bruchs als double zurück
         **/
        double get() {
            if ( nenner == 0 ) {
                return NAN;
            } else {
                return ganzerAnteil + ( 1.0 * zaehler / nenner);
            }
        }


        /**
         ** Die Reparatur der Eigenschaften
         **/
        void repair() {
    
            if ( nenner == 0 ) {
                // Setzte alles auf 0!
                zaehler = 0;
                ganzerAnteil = 0;
            } else {
        
                // Als erstes prüfen wir die Vorzeichen
        
                int vorzeichen = 1;
                // Ist der Zähler negativ, merken wir uns das Vorzeichen
                if ( zaehler < 0 ) {
                    vorzeichen = -vorzeichen;
                    zaehler = -zaehler;
                }

                // Ist der Nenner negativ, merken wir und das Vorzeichen
                if ( nenner < 0 ) {
                    vorzeichen = -vorzeichen;
                    nenner = -nenner;
                }
        
                // Wenn der Zähler zu groß ist ...
                if ( zaehler >= nenner ) {
                    // .. addiere den Quotienten zum ganzzahligen Anteil
                    ganzerAnteil += vorzeichen * zaehler/nenner;
                    // .. und behalte den Divisionsrest als Zähler
                    zaehler = zaehler % nenner;
                }
            }
        } // Ende von repair()
    
    
    
        /**
         ** Prüfe ob der Bruch eine Zahl ist.
         **/
        bool isNumber() {
            // Gebe true zurück, falls der Nenner != 0 ist.
            return ( nenner != 0 );
        }
    
    
    
        /****************
         ** Die GETTER **
         ****************/
    
        /**
         ** Gib den ganzzahligen Anteil zurück.
         **/
        int getGanzerAnteil() {
            return ganzerAnteil;
        }

        /**
         ** Gib den Zähler zurück.
         **/
        int getZaehler() {
            return zaehler;
        }

        /**
         ** Gib den gesamten Anteil zurück.
         **/
        int getNenner() {
            return nenner;
        }

    
    
        /****************
         ** Die SETTER **
         ****************/
    
        /**
         ** Setze den ganzzahligen Anteil.
         **/
        void setGanzerAnteil(int ganzerAnteil) {
            this->ganzerAnteil = ganzerAnteil;
            repair();
        }

        /**
         ** Setze den Zähler.
         **/
        void setZaehler(int zaehler) {
            this->zaehler = zaehler;
            repair();
        }
    
        /**
         ** Setze den Nenner.
         **/
        void setNenner(int nenner) {
            this->nenner = nenner;
            repair();
        }
    
    
        /************************************
         ** Die arithmetischen Operationen **
         ************************************/
    
        void add(Bruch &summand) {
            if ( !isNumber() || !summand.isNumber() ) return;
            
            ganzerAnteil += summand.ganzerAnteil;
            zaehler = zaehler * summand.nenner + nenner * summand.zaehler;
            nenner = nenner * summand.nenner;
            
            repair();
        }
    
    
        void mult(Bruch &faktor) {
            if ( !isNumber() || !faktor.isNumber() ) return;

            zaehler = 
                nenner * ganzerAnteil * faktor.zaehler + 
                faktor.ganzerAnteil*zaehler*faktor.nenner + 
                zaehler * faktor.zaehler;
            nenner = nenner * faktor.nenner;
            ganzerAnteil = ganzerAnteil * faktor.ganzerAnteil;
            
            repair();
        }
    
    
        void div(Bruch &divisor) {
            if ( !isNumber() || !divisor.isNumber() ) return;
            
            if ( divisor.ganzerAnteil == 0 && divisor.zaehler == 0 ) {
                nenner = 0;
                zaehler = 0;
                ganzerAnteil = 0;
            } else {
                Bruch kehrwert = Bruch(divisor.nenner, divisor.ganzerAnteil*divisor.nenner+divisor.zaehler);
                mult(kehrwert);
            }
        }
        
    
}; // end of class Bruch