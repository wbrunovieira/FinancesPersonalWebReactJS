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
        'http://192.168.0.9:8080/transactions'
      );
      if (!response.ok)
        throw new Error('Erro ao buscar as transações');
      const data: Transaction[] = await response.json();
      setTransactions(data || []); // Garante que sempre será um array
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchProjections = async () => {
    try {
      const response = await fetch(
        'http://192.168.0.9:8080/projections'
      );
      if (!response.ok)
        throw new Error('Erro ao buscar as projeções');
      const data: Projection[] = await response.json();
      setProjections(
        (data || []).map(p => ({
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
  ): T[] => {
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
  ): number => {
    return data
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateCategoryTotals = (
    data: Projection[] | Transaction[],
    type: string
  ): Record<string, number> => {
    return data
      .filter(item => item.type === type)
      .reduce((acc, item) => {
        acc[item.category] =
          (acc[item.category] || 0) + item.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTransactions(),
      fetchProjections(),
    ]).finally(() => setLoading(false));
  }, []);

  const filteredTransactions = filterByMonth(
    transactions || []
  );
  const filteredProjections = filterByMonth(
    projections || []
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

  const groupedTransactions = (
    filteredTransactions || []
  ).reduce<Record<string, Transaction[]>>(
    (acc, transaction) => {
      acc[transaction.category] =
        acc[transaction.category] || [];
      acc[transaction.category].push(transaction);
      return acc;
    },
    {}
  );

  const groupedProjections = (
    filteredProjections || []
  ).reduce<Record<string, Projection[]>>(
    (acc, projection) => {
      acc[projection.category] =
        acc[projection.category] || [];
      acc[projection.category].push(projection);
      return acc;
    },
    {}
  );

  const balance =
    totalIncomes - totalExpenses - totalInvestments;
  const actualBalanceProjected =
    totalProjectedIncomes -
    totalProjectedExpenses -
    totalProjectedInvestments;

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
        {!loading && error && (
          <p className="text-red-500">{error}</p>
        )}
        {!loading && !error && (
          <>
            {transactions.length === 0 && (
              <p className="text-gray-500">
                Nenhuma transação encontrada para este mês.
              </p>
            )}
            {projections.length === 0 && (
              <p className="text-gray-500">
                Nenhuma projeção encontrada para este mês.
              </p>
            )}
            {/* Renderizar resumos e agrupamentos */}
            {Object.entries(groupedProjections || {}).map(
              ([category, items]) => (
                <div key={category}>
                  <h3>{category}</h3>
                  <ul>
                    {items.map(projection => (
                      <li key={projection.id}>
                        {projection.description} -{' '}
                        {projection.amount}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
