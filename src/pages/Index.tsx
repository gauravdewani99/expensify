import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const [expenses, setExpenses] = useState<any[]>(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [showCsvPreview, setShowCsvPreview] = useState(false);
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

  const handleDeleteLastExpense = () => {
    if (expenses.length > 0) {
      setExpenses((prev) => prev.slice(1));
      toast({
        title: "Success",
        description: "Last expense deleted successfully",
      });
    }
  };

  const getLastThreeExpenses = () => {
    return expenses.slice(0, 3);
  };

  const generateCsvContent = () => {
    const headers = ["Date", "Category", "Amount (€)", "Description", "Day of Week"];
    const rows = expenses.map((expense) => {
      const date = new Date(expense.date);
      return [
        date.toLocaleDateString(),
        expense.category,
        expense.amount,
        expense.description || "",
        date.toLocaleDateString('en-US', { weekday: 'long' })
      ].join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  };

  const handleDownload = () => {
    const csvContent = generateCsvContent();
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
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCsvPreview(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview CSV
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ExpenseForm onAddExpense={handleAddExpense} />
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Last 3 Expenses</h2>
                <Button
                  onClick={handleDeleteLastExpense}
                  variant="destructive"
                  size="sm"
                >
                  Delete Last Expense
                </Button>
              </div>
              <ExpenseList
                expenses={getLastThreeExpenses()}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">All Expenses</h2>
              <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
            </div>
          </div>
          <div>
            <div className="sticky top-8">
              <ExpenseSummary expenses={expenses} />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showCsvPreview} onOpenChange={setShowCsvPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>CSV Preview</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
              {generateCsvContent()}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;