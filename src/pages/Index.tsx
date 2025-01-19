import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [expenses, setExpenses] = useState<any[]>(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (expense: any) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    toast({
      title: "Success",
      description: "Expense deleted successfully",
    });
  };

  const handleDownload = () => {
    const headers = ["Date", "Category", "Amount (€)", "Description"];
    const csvContent = [
      headers.join(","),
      ...expenses.map((expense) => [
        new Date(expense.date).toLocaleDateString(),
        expense.category,
        expense.amount,
        expense.description || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gaurav's Expense Tracker</h1>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ExpenseForm onAddExpense={handleAddExpense} />
            <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
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