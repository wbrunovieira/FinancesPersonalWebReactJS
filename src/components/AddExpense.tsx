import { useEffect, useState, ChangeEvent } from 'react';

interface Category {
  id: number;
  name: string;
}

export function AddExpense(): JSX.Element {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);


  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/categories?type=expense`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) {
          throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    fetchCategories();
  }, []);


  useEffect(() => {
    setDate(getCurrentDateTime());
  }, []);
  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        resetForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);


  const handleSubmit = async () => {
    if (!amount || !description || !categoryId || !date) {
      alert('Preencha todos os campos antes de enviar.');
      return;
    }

    const formattedDate = date.split('/').reverse().join('-') + ':00';
    const payload = {
      user_id: 1,
      amount: parseFloat(amount),
      description,
      category_id: parseInt(categoryId, 10),
      type: 'expense',
      date: new Date(formattedDate).toISOString(),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Erro na resposta do servidor: ${response.status} - ${errorMsg}`);
      }
      alert('Despesa adicionada com sucesso!');
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
    }
  };


  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setDate(getCurrentDateTime());
    setIsModalOpen(false);
  };


  return (
    <div className="py-4 flex items-center justify-center">

      <button
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        Adicionar Despesa
      </button>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h4 className="text-lg font-bold mb-4">Adicione uma nova despesa</h4>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Valor"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="DD/MM/AAAA HH:mm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-gray-300 text-black p-2 rounded-md hover:bg-gray-400 transition duration-300"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button
                className="bg-neutral-800 text-neutral-100 p-2 rounded-md hover:bg-neutral-700 transition duration-300"                onClick={handleSubmit}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}