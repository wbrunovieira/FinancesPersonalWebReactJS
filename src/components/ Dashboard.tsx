import { useEffect, useState } from 'react';
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
  end_month?: string;
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
        `${import.meta.env.VITE_API_BASE_URL}/transactions`
      );
      if (!response.ok)
        throw new Error('Erro ao buscar as transações');
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchProjections = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/projections`
      );
      if (!response.ok)
        throw new Error('Erro ao buscar as projeções');
      const data: Projection[] = await response.json();
      setProjections(
        data.map(p => ({
          ...p,
          end_month: p.end_month ?? undefined,
        }))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filterByMonth = <T extends { date: string }>(
    items: T[]
  ): T[] =>
    items.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() ===
          selectedMonth.getFullYear() &&
        itemDate.getMonth() === selectedMonth.getMonth()
      );
    });

  const changeMonth = (direction: 'previous' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(
        newDate.getMonth() + (direction === 'next' ? 1 : -1)
      );
      return newDate;
    });
  };

  const calculateTotals = <
    T extends { type: string; amount: number }
  >(
    data: T[],
    type: string
  ): number =>
    data
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + item.amount, 0);

  const calculateCategoryTotals = (
    data: Projection[] | Transaction[],
    type: string
  ): Record<string, number> =>
    data
      .filter(item => item.type === type)
      .reduce((acc, item) => {
        acc[item.category] =
          (acc[item.category] || 0) + item.amount;
        return acc;
      }, {} as Record<string, number>);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTransactions(),
      fetchProjections(),
    ]).finally(() => setLoading(false));
  }, []);

  const filteredTransactions = filterByMonth(transactions);
  const filteredProjections = filterByMonth(projections);

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

  const groupedTransactions = filteredTransactions.reduce<
    Record<string, Transaction[]>
  >((acc, transaction) => {
    acc[transaction.category] =
      acc[transaction.category] || [];
    acc[transaction.category].push(transaction);
    return acc;
  }, {});

  // Group transactions by day for the daily view
  const transactionsByDay = (() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of filteredTransactions) {
      const dateKey = new Date(tx.date)
        .toISOString()
        .split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    }
    // Sort days ascending for balance calculation
    const sortedDays = Object.entries(groups).sort(
      ([a], [b]) => a.localeCompare(b)
    );

    // Calculate running balance per day
    let runningBalance = 0;
    const daysWithBalance = sortedDays.map(
      ([dateKey, txs]) => {
        const dayTotal = txs.reduce((sum, tx) => {
          if (tx.type === 'income') return sum + tx.amount;
          return sum - tx.amount;
        }, 0);
        runningBalance += dayTotal;
        return { dateKey, txs, dayTotal, runningBalance };
      }
    );

    // Return newest first
    return daysWithBalance.reverse();
  })();

  const groupedProjections = filteredProjections.reduce<
    Record<string, Projection[]>
  >((acc, projection) => {
    acc[projection.category] =
      acc[projection.category] || [];
    acc[projection.category].push(projection);
    return acc;
  }, {});

  const balance =
    totalIncomes - totalExpenses - totalInvestments;

  return (
    <div className="min-h-screen bg-foreground text-foreground flex flex-col items-center">
      <header className="w-full tracking-wider py-4 bg-primary text-primary-foreground shadow-lg flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          Dashboard Financeiro
        </h1>
      </header>
      <button
        className="mt-2 bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary-foreground hover:text-secondary transition-colors"
        onClick={() => navigate('/')}
      >
        Voltar para Home
      </button>

      <main className="w-full max-w-6xl p-6 flex flex-col items-center">
        {loading && <p>Carregando dados financeiros...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="w-full">
            {/* Controle de meses */}
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

            {/* Resumo */}
            <div className="bg-card shadow-md rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">
                Resumo do efetuado
              </h3>
              <ul>
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
                  <span>Despesas:</span>
                  <span className="text-red-500">
                    {totalExpenses.toLocaleString('pt-BR', {
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

            {/* Projeções e Resumo */}
            <div className="grid grid-cols-2 gap-6">
              {/* Projeções */}
              <div className="bg-card shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">
                  Previsto para esse mês
                </h3>
                {Object.entries(groupedProjections).map(
                  ([category, projections]) => {
                    // Soma total por categoria
                    const totalCategoryAmount =
                      projections.reduce(
                        (sum, projection) =>
                          sum + projection.amount,
                        0
                      );

                    return (
                      <div key={category} className="mb-6">
                        <h5 className="text-sm font-bold text-gray-700 mb-4">
                          {category} - Total:{' '}
                          {totalCategoryAmount.toLocaleString(
                            'pt-BR',
                            {
                              style: 'currency',
                              currency: 'BRL',
                            }
                          )}
                        </h5>
                        <ul>
                          {projections.map(projection => (
                            <li
                              key={projection.id}
                              className="flex justify-between text-sm py-1"
                            >
                              <span className="w-1/3 text-left">
                                {new Date(
                                  projection.date
                                ).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </span>
                              <span className="w-1/3 text-left">
                                {projection.description}
                              </span>
                              <span className="w-1/3 text-right">
                                {projection.amount.toLocaleString(
                                  'pt-BR',
                                  {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                )}

                {/* Saldo total de projeções */}
                <div className="mt-6">
                  <h4 className="text-md font-bold">
                    Saldo Total
                  </h4>
                  <p className="text-lg">
                    {Object.values(groupedProjections)
                      .reduce((total, projections) => {
                        return (
                          total +
                          projections.reduce(
                            (sum, projection) =>
                              sum + projection.amount,
                            0
                          )
                        );
                      }, 0)
                      .toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                  </p>
                </div>
              </div>

              {/* Movimentações por dia */}
              <div className="bg-card shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">
                  Movimentações
                </h3>
                {transactionsByDay.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhuma transação neste mês.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[32rem] overflow-y-auto">
                    {transactionsByDay.map(
                      ({
                        dateKey,
                        txs,
                        dayTotal,
                        runningBalance,
                      }) => (
                        <div key={dateKey}>
                          <div className="flex items-center justify-between px-3 py-1.5 bg-secondary rounded-t-lg border-b border-gray-600">
                            <span className="text-secondary-foreground text-xs font-semibold">
                              {new Date(
                                dateKey + 'T12:00:00'
                              ).toLocaleDateString(
                                'pt-BR',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                }
                              )}
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-semibold ${
                                  dayTotal >= 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {dayTotal >= 0 ? '+' : ''}
                                {dayTotal.toLocaleString(
                                  'pt-BR',
                                  {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }
                                )}
                              </span>
                              <span className="text-xs text-gray-400">
                                Saldo:{' '}
                                {runningBalance.toLocaleString(
                                  'pt-BR',
                                  {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 mt-1">
                            {txs.map(tx => {
                              const isIncome =
                                tx.type === 'income';
                              return (
                                <div
                                  key={tx.id}
                                  className="flex items-center justify-between py-2 px-3 bg-card rounded-lg border border-gray-700"
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {tx.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {tx.category}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-sm font-semibold ${
                                      isIncome
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                    }`}
                                  >
                                    {isIncome ? '+' : '-'}
                                    {tx.amount.toLocaleString(
                                      'pt-BR',
                                      {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
