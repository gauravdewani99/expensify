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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(expense => ({
        ...expense,
        date: new Date(expense.date),
      }));
    },
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date.toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
      console.error('Error adding expense:', error);
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
      console.error('Error deleting expense:', error);
    },
  });

  const handleAddExpense = (expense: any) => {
    addExpenseMutation.mutate(expense);
  };

  const handleDeleteExpense = (id: number) => {
    deleteExpenseMutation.mutate(id);
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
              </div>
              <ExpenseList
                expenses={expenses.slice(0, 3)}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">All Expenses</h2>
              <ExpenseList 
                expenses={expenses} 
                onDeleteExpense={handleDeleteExpense} 
              />
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