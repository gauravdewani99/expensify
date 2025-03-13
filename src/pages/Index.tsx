import { useState } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { ExpenseChat } from "@/components/ExpenseChat";
import { Button } from "@/components/ui/button";
import { Download, Euro, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { PrivacyProvider } from "@/contexts/PrivacyContext";

const Index = () => {
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
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
    setCurrentAction('add-expense');
    setShowPinDialog(true);
    sessionStorage.setItem('pending-expense', JSON.stringify(expense));
  };

  const handleDeleteExpense = (id: number) => {
    setCurrentAction('delete-expense');
    setExpenseToDelete(id);
    setShowPinDialog(true);
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
    setCurrentAction('download-csv');
    setShowPinDialog(true);
  };

  const handlePinSubmit = () => {
    const correctPin = "6930";
    
    if (pin === correctPin) {
      if (currentAction === 'preview-csv') {
        setShowCsvPreview(true);
      } else if (currentAction === 'download-csv') {
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
      } else if (currentAction === 'add-expense') {
        const pendingExpense = JSON.parse(sessionStorage.getItem('pending-expense') || '{}');
        addExpenseMutation.mutate(pendingExpense);
        sessionStorage.removeItem('pending-expense');
      } else if (currentAction === 'delete-expense' && expenseToDelete !== null) {
        deleteExpenseMutation.mutate(expenseToDelete);
        setExpenseToDelete(null);
      }
      
      setShowPinDialog(false);
      setPin("");
      setCurrentAction(null);
      
      toast({
        title: "Success",
        description: "PIN verified successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect PIN. Please try again.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  const handleShowCsvPreview = () => {
    setCurrentAction('preview-csv');
    setShowPinDialog(true);
  };

  return (
    <PrivacyProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="flex flex-col mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Expensify</h1>
                <Euro className="text-primary h-8 w-8" />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleShowCsvPreview}
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
            <p className="text-gray-600 text-lg">Gaurav's Expense Tracker</p>
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
              <div className="sticky top-8 space-y-6">
                <ExpenseSummary expenses={expenses} />
                <ExpenseChat />
              </div>
            </div>
          </div>
        </div>

        {/* CSV Preview Dialog */}
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

        {/* PIN Verification Dialog */}
        <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enter PIN</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please enter your 4-digit PIN to continue.
              </p>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-xl tracking-widest"
                maxLength={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePinSubmit();
                  }
                }}
              />
              <Button 
                onClick={handlePinSubmit} 
                className="w-full"
              >
                Verify
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PrivacyProvider>
  );
};

export default Index;
