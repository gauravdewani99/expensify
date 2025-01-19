import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";

const Index = () => {
  const [expenses, setExpenses] = useState<any[]>(() => {
    // Load initial expenses from localStorage
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (expense: any) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Expense Tracker</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ExpenseForm onAddExpense={handleAddExpense} />
            <ExpenseList expenses={expenses} />
          </div>
          <div>
            <div className="sticky top-8">
              <ExpenseSummary expenses={expenses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;