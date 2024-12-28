import { useEffect, useState, ChangeEvent } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from './ui/animated-modal';
import { formatDateTime, isValidDateTime } from '../utils/dateUtils';


interface Category {
  id: number;
  name: string;
}

export function AddExpense(): JSX.Element {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState<string>('');

  const getCurrentDateTime = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    setDate(getCurrentDateTime());
  }, []);

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/categories`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar categorias: ${response.statusText}`
          );
        }

        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert('Erro ao carregar as categorias: ' + error.message);
        } else {
          alert('Erro desconhecido ao carregar categorias.');
        }
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!amount || !description || !categoryId || !date) {
      alert('Preencha todos os campos antes de enviar.');
      return;
    }

    if (!isValidDateTime(date)) {
      alert('A data/hora fornecida não é válida.');
      return;
    }

    const payload = {
      user_id: 1,
      amount: parseFloat(amount),
      description,
      category_id: parseInt(categoryId, 10),
      date: new Date(date.split('/').reverse().join('-').replace(' ', 'T')).toISOString(),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(
          `Erro na resposta do servidor: ${response.status} - ${errorMsg}`
        );
      }

      alert('Despesa adicionada com sucesso!');
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(getCurrentDateTime());
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert('Erro ao adicionar despesa: ' + error.message);
      } else {
        alert('Erro desconhecido ao adicionar despesa.');
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDescription(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setCategoryId(e.target.value);
  };

  return (
    <div className="py-4 flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Adicionar Despesa
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            💸
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Adicione uma nova despesa
            </h4>
            <div className="py-10 flex flex-col gap-6 items-start justify-start max-w-sm mx-auto">
              <input
                type="number"
                placeholder="Valor"
                value={amount}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Descrição"
                value={description}
                onChange={handleDescriptionChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <select
                value={categoryId}
                onChange={handleCategoryChange}
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
                value={date}
                onChange={(e) => setDate(formatDateTime(e.target.value))}
                onBlur={() => {
                  if (!isValidDateTime(date)) {
                    alert('Data/hora inválida. Por favor, siga o formato DD/MM/AAAA HH:mm.');
                  }
                }}
                placeholder="DD/MM/AAAA HH:mm"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <ModalFooter>
              <button onClick={() => setDate(getCurrentDateTime())}>
                Cancelar
              </button>
              <button onClick={handleSubmit}>Confirmar</button>
            </ModalFooter>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}