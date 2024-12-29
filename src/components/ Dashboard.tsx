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

const Dashboard = () => {
  const [transactions, setTransactions] = useState<
    Transaction[]
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
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByMonth = (
    transactions: Transaction[]
  ) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getFullYear() ===
          selectedMonth.getFullYear() &&
        transactionDate.getMonth() ===
          selectedMonth.getMonth()
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
    fetchTransactions();
  }, []);

  const filteredTransactions =
    filterTransactionsByMonth(transactions);

  const calculateTotals = (
    data: Transaction[],
    type: string
  ) =>
    data
      .filter(transaction => transaction.type === type)
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

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
  const balance =
    totalIncomes - totalExpenses - totalInvestments;

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
              </ul>
            </div>

            <div className="grid grid-cols-1  gap-4">
              <div className="bg-card shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">
                  Despesas
                </h3>
                {filteredTransactions
                  .filter(t => t.type === 'expense')
                  .map(t => (
                    <p key={t.id} className="py-1 border-b">
                      <span className="font-bold">
                        {new Date(
                          t.date
                        ).toLocaleDateString('pt-BR')}
                        :
                      </span>{' '}
                      <span>{t.category}</span> -{' '}
                      <span className="italic">
                        {t.description}
                      </span>
                      :{' '}
                      <span>
                        {t.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </p>
                  ))}
              </div>
              <div className="bg-card shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">
                  Rendas
                </h3>
                {filteredTransactions
                  .filter(t => t.type === 'income')
                  .map(t => (
                    <p key={t.id} className="py-1 border-b">
                      <span className="font-bold">
                        {new Date(
                          t.date
                        ).toLocaleDateString('pt-BR')}
                        :
                      </span>{' '}
                      <span>{t.category}</span> -{' '}
                      <span className="italic">
                        {t.description}
                      </span>
                      :{' '}
                      <span>
                        {t.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </p>
                  ))}
              </div>
              <div className="bg-card shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">
                  Investimentos
                </h3>
                {filteredTransactions
                  .filter(t => t.type === 'investment')
                  .map(t => (
                    <p key={t.id} className="py-1 border-b">
                      <span className="font-bold">
                        {new Date(
                          t.date
                        ).toLocaleDateString('pt-BR')}
                        :
                      </span>{' '}
                      <span>{t.category}</span> -{' '}
                      <span className="italic">
                        {t.description}
                      </span>
                      :{' '}
                      <span>
                        {t.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="w-full py-4 bg-secondary text-secondary-foreground text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} WB Digital
          Solutions. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
