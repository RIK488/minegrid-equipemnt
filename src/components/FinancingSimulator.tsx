import React, { useState, useEffect, useRef } from 'react';
import { Calculator, CreditCard, TrendingUp, Info, Send, PiggyBank, Calendar, Euro, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { FinancingSimulation, FinancingPartner } from '../types';
import { useCurrencyStore } from '../stores/currencyStore';

interface FinancingSimulatorProps {
  machinePrice: number;
  className?: string;
}

interface Bank {
  id: string;
  name: string;
  logo: string;
  description: string;
  rates: {
    min: number;
    max: number;
  };
  durations: {
    min: number;
    max: number;
  };
}

const banks: Bank[] = [
  {
    id: 'bank-of-africa',
    name: 'Bank of Africa',
    logo: '/image/banks/bank-of-africa.png',
    description: 'Solutions de financement flexibles pour vos équipements',
    rates: {
      min: 4.5,
      max: 7.5
    },
    durations: {
      min: 12,
      max: 60
    }
  },
  {
    id: 'attijariwafa',
    name: 'Attijariwafa Bank',
    logo: '/image/banks/attijariwafa.png',
    description: 'Financement sur mesure pour les professionnels',
    rates: {
      min: 4.2,
      max: 7.2
    },
    durations: {
      min: 12,
      max: 72
    }
  },
  {
    id: 'saham',
    name: 'Saham Bank',
    logo: '/image/banks/saham.png',
    description: 'Solutions de leasing adaptées à vos besoins',
    rates: {
      min: 4.8,
      max: 7.8
    },
    durations: {
      min: 24,
      max: 84
    }
  }
];

export default function FinancingSimulator({ machinePrice, className = "" }: FinancingSimulatorProps) {
  const { currentCurrency, rates } = useCurrencyStore();
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [amount, setAmount] = useState<number>(machinePrice);
  const [downPayment, setDownPayment] = useState<number>(Math.round(machinePrice * 0.2));
  const [duration, setDuration] = useState<number>(36);
  const [simulation, setSimulation] = useState<FinancingSimulation | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Convertir les montants en fonction de la devise sélectionnée
  const convertAmount = (amount: number): number => {
    if (currentCurrency === 'EUR') return amount;
    return Math.round(amount * rates[currentCurrency]);
  };

  // Convertir les montants de la devise locale vers l'euro
  const convertToEUR = (amount: number): number => {
    if (currentCurrency === 'EUR') return amount;
    return Math.round(amount / rates[currentCurrency]);
  };

  // Fonction pour calculer la mensualité
  const calculateMonthlyPayment = (totalAmount: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    const payment = (totalAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment * 100) / 100;
  };

  // Formater les montants avec la devise appropriée
  const formatCurrency = (amount: number): React.ReactNode => {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currentCurrency,
      maximumFractionDigits: 0
    });

    const parts = formatter.formatToParts(amount);
    const currencyPart = parts.find(part => part.type === 'currency');
    const numberParts = parts.filter(part => 
      part.type === 'integer' || 
      part.type === 'decimal' || 
      part.type === 'fraction' ||
      (part.type === 'group' && part.value === ' ')
    );
    
    return (
      <span className="whitespace-nowrap">
        {numberParts.map(part => part.value).join('')}
        <span className="text-xs ml-1 font-normal">{currencyPart?.value}</span>
      </span>
    );
  };

  // Déterminer la taille de police en fonction du montant
  const getAmountClassName = (amount: number) => {
    if (amount >= 1000000) return 'text-base';
    if (amount >= 100000) return 'text-lg';
    return 'text-xl';
  };

  // Mettre à jour les montants quand la devise change
  useEffect(() => {
    const newAmount = convertAmount(machinePrice);
    setAmount(newAmount);
    setDownPayment(Math.round(newAmount * 0.2));
  }, [currentCurrency, rates, machinePrice]);

  // Auto-scroll du carrousel
  useEffect(() => {
    if (isAutoScrollPaused) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        
        if (carouselRef.current.scrollLeft >= maxScroll) {
          carouselRef.current.scrollLeft = 0;
        } else {
          carouselRef.current.scrollLeft += 1;
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isAutoScrollPaused]);

  // Calculer la simulation
  useEffect(() => {
    if (!selectedBank) return;

    // Convertir les montants en EUR pour le calcul
    const amountInEUR = convertToEUR(amount);
    const downPaymentInEUR = convertToEUR(downPayment);
    const loanAmount = amountInEUR - downPaymentInEUR;
    const monthlyRate = selectedBank?.rates.min || 0;
    const numberOfPayments = duration;
    
    if (loanAmount > 0 && numberOfPayments > 0) {
      const monthlyPaymentEUR = calculateMonthlyPayment(loanAmount, monthlyRate, numberOfPayments);
      const totalCostEUR = monthlyPaymentEUR * numberOfPayments + downPaymentInEUR;
      
      // Convertir les résultats dans la devise sélectionnée
      const monthlyPaymentLocal = convertAmount(monthlyPaymentEUR);
      const totalCostLocal = convertAmount(totalCostEUR);
      
      setSimulation({
        machinePrice: amount,
        downPayment,
        loanAmount: convertAmount(loanAmount),
        duration,
        interestRate: monthlyRate,
        monthlyPayment: Math.round(monthlyPaymentLocal),
        totalCost: Math.round(totalCostLocal),
        partner: selectedBank?.name || ''
      });
    }
  }, [amount, downPayment, duration, selectedBank, currentCurrency, rates]);

  // Gestionnaires d'événements pour le carrousel
  const handleBankClick = (bank: Bank) => {
    setSelectedBank(bank);
    setIsAutoScrollPaused(true);
    
    // Ajuster la durée en fonction des limites de la banque
    if (duration < bank.durations.min) {
      setDuration(bank.durations.min);
    } else if (duration > bank.durations.max) {
      setDuration(bank.durations.max);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleRequestFinancing = () => {
    setShowRequestForm(true);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold">Simulateur de Financement</h3>
        </div>
      </div>

      {/* Carrousel des banques */}
      <div className="relative mb-6">
        {/* Contrôles du carrousel */}
        <div className="absolute -top-8 right-0 flex items-center space-x-2">
          <button
            onClick={() => setIsAutoScrollPaused(!isAutoScrollPaused)}
            className="p-1 hover:bg-gray-100 rounded-full"
            title={isAutoScrollPaused ? "Reprendre le défilement" : "Mettre en pause"}
          >
            {isAutoScrollPaused ? (
              <Play className="h-4 w-4 text-gray-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Boutons de navigation */}
        <button
          onClick={() => scrollCarousel('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        
        <button
          onClick={() => scrollCarousel('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>

        <div 
          ref={carouselRef}
          className="flex overflow-x-hidden space-x-6 py-4 px-8"
          style={{ scrollBehavior: 'auto' }}
          onMouseEnter={() => setIsAutoScrollPaused(true)}
          onMouseLeave={() => setIsAutoScrollPaused(false)}
        >
          {banks.map((bank) => (
            <div
              key={bank.id}
              onClick={() => handleBankClick(bank)}
                              className={`flex-none w-64 p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                selectedBank?.id === bank.id 
                  ? 'bg-orange-50 border-2 border-orange-300 shadow-lg' 
                  : 'bg-white border border-gray-200 hover:border-orange-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-full h-32 flex items-center justify-center mb-4">
                  <img 
                    src={bank.logo} 
                    alt={bank.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{bank.name}</h4>
                  <div className="flex items-center justify-center space-x-3 text-sm">
                    <span className="font-medium text-orange-600">
                      Taux : {bank.rates.min}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBank && (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Colonne 1: Montant */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                Montant total ({currentCurrency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Colonne 2: Apport */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                Apport initial ({currentCurrency})
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Colonne 3: Durée */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                Durée (mois)
              </label>
              <input
                type="range"
                min={selectedBank.durations.min}
                max={selectedBank.durations.max}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-center">{duration} mois</div>
            </div>

            {/* Colonne 4: Résultats */}
            <div className="space-y-1">
              <div className="text-xs text-orange-600 mb-1">
                Taux : {selectedBank.rates.min}%
              </div>
              <div className="text-xs font-medium text-gray-600">
                Mensualité estimée
              </div>
              <div className={`font-bold text-orange-600 ${simulation ? getAmountClassName(simulation.monthlyPayment) : 'text-xl'}`}>
                {simulation ? formatCurrency(simulation.monthlyPayment) : formatCurrency(0)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Simulation indicative. Les conditions finales dépendent de votre profil.
            </div>
            <button
              onClick={handleRequestFinancing}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
            >
              Demander
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de demande */}
      {showRequestForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Demande de financement</h4>
          <form className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom complet"
              className="px-3 py-2 border rounded text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 border rounded text-sm"
            />
            <input
              type="tel"
              placeholder="Téléphone"
              className="px-3 py-2 border rounded text-sm"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
            >
              Envoyer la demande
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 