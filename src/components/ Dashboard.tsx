import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  type: string;
  date: string;
}

interface Projection {
  id: number;
  amount: number;
  category: string;
  description: string;
  type: string;
  date: string;
  is_recurring: boolean;
  end_month?: string; // Nullability resolvida
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [projections, setProjections] = useState<
    Projection[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    new Date()
  );
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        'http://192.168.0.9:8080/transactions',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar as transações');
      }

      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchProjections = async () => {
    try {
      const response = await fetch(
        'http://192.168.0.9:8080/projections',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar as projeções');
      }

      const data: Projection[] = await response.json();

      // Normalizar os dados aqui
      const normalizedData = data.map(p => ({
        ...p,
        end_month: p.end_month ?? undefined,
      }));

      setProjections(normalizedData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filterByMonth = <T extends { date: string }>(
    items: T[]
  ) => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() ===
          selectedMonth.getFullYear() &&
        itemDate.getMonth() === selectedMonth.getMonth()
      );
    });
  };

  const changeMonth = (direction: 'previous' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'previous') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTransactions(),
      fetchProjections(),
    ]).finally(() => setLoading(false));
  }, []);

  const filteredTransactions = filterByMonth(
    transactions.map(t => ({ ...t, is_recurring: false }))
  );
  const filteredProjections = filterByMonth(projections);

  const calculateTotals = <
    T extends { type: string; amount: number }
  >(
    data: T[],
    type: string
  ) =>
    data
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = calculateTotals(
    filteredTransactions,
    'expense'
  );
  const totalIncomes = calculateTotals(
    filteredTransactions,
    'income'
  );
  const totalInvestments = calculateTotals(
    filteredTransactions,
    'investment'
  );

  const totalProjectedExpenses = calculateTotals(
    filteredProjections,
    'expense'
  );
  const totalProjectedIncomes = calculateTotals(
    filteredProjections,
    'income'
  );
  const totalProjectedInvestments = calculateTotals(
    filteredProjections,
    'investment'
  );

  const balance =
    totalIncomes - totalExpenses - totalInvestments;

  console.log('Selected Month:', selectedMonth);
  console.log('Original Projections:', projections);
  console.log('Filtered Projections:', filteredProjections);

  return (
    <div className="min-h-screen bg-foreground text-foreground flex flex-col items-center">
      <header className="w-full py-4 bg-primary text-primary-foreground shadow-lg flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">
          Dashboard Financeiro
        </h1>
        <button
          className="bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary-foreground hover:text-secondary transition-colors"
          onClick={() => navigate('/')}
        >
          Voltar para Home
        </button>
      </header>
      <main className="w-full max-w-6xl p-6 flex flex-col items-center">
        {loading && <p>Carregando dados financeiros...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <button
                className="bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary-foreground hover:text-secondary transition-colors"
                onClick={() => changeMonth('previous')}
              >
                Mês Anterior
              </button>
              <h2 className="text-secondary text-xl font-bold mx-4">
                {selectedMonth.toLocaleString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <button
                className="bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary-foreground hover:text-secondary transition-colors"
                onClick={() => changeMonth('next')}
              >
                Próximo Mês
              </button>
            </div>

            <div className="bg-card shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold">Resumo</h3>
              <ul>
                <li className="flex justify-between py-1">
                  <span>Despesas:</span>
                  <span className="text-red-500">
                    {totalExpenses.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Rendas:</span>
                  <span className="text-green-500">
                    {totalIncomes.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Investimentos:</span>
                  <span className="text-blue-500">
                    {totalInvestments.toLocaleString(
                      'pt-BR',
                      {
                        style: 'currency',
                        currency: 'BRL',
                      }
                    )}
                  </span>
                </li>
                <li className="flex justify-between py-1 font-bold">
                  <span>Saldo:</span>
                  <span
                    className={
                      balance >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {balance.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Projeções de Despesas:</span>
                  <span className="text-red-500">
                    {totalProjectedExpenses.toLocaleString(
                      'pt-BR',
                      {
                        style: 'currency',
                        currency: 'BRL',
                      }
                    )}
                  </span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Projeções de Rendas:</span>
                  <span className="text-green-500">
                    {totalProjectedIncomes.toLocaleString(
                      'pt-BR',
                      {
                        style: 'currency',
                        currency: 'BRL',
                      }
                    )}
                  </span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Projeções de Investimentos:</span>
                  <span className="text-blue-500">
                    {totalProjectedInvestments.toLocaleString(
                      'pt-BR',
                      {
                        style: 'currency',
                        currency: 'BRL',
                      }
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
