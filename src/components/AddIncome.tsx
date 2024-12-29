import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from './ui/animated-modal';
import { ChangeEvent, useEffect, useState } from 'react';
import { formatDateTime, isValidDateTime } from '../utils/dateUtils';


interface Category {
  id: number;
  name: string;
}
export function AddIncome() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [date, setDate] = useState('');

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
            `${import.meta.env.VITE_API_BASE_URL}/categories?type=income`,
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
    
  
      const [day, month, yearAndTime] = date.split('/');
      const [year, time] = yearAndTime.split(' ');
      const formattedDate = `${year}-${month}-${day}T${time}`;
    
      const payload = {
        user_id: 1,
        amount: parseFloat(amount),
        description,
        category_id: parseInt(categoryId, 10),
        type: 'income', 
        date: new Date(formattedDate).toISOString(),
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
    
        alert('income adicionada com sucesso!');
        setAmount('');
        setDescription('');
        setCategoryId('');
        setDate(getCurrentDateTime());
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert('Erro ao adicionar income: ' + error.message);
        } else {
          alert('Erro desconhecido ao adicionar income.');
        }
      }
    };


    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setCategoryId(e.target.value);
      };

      

      const resetForm = () => {
        setAmount('');
        setDescription('');
        setCategoryId('');
        setDate(getCurrentDateTime());
        setIsModalOpen(false);
      };
    
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
  return (
    <div className="py-4 flex items-center justify-center">
      {/* Botão para abrir o modal */}
      <button
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        Adicionar Rendimento
      </button>

      {/* Render Condicional do Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h4 className="text-lg font-bold mb-4">Adicione um novo rendimento</h4>
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
                className="bg-neutral-800 text-neutral-100 p-2 rounded-md hover:bg-neutral-700 transition duration-300"  
                onClick={handleSubmit}
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