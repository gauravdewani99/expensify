
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface Expense {
  amount: number;
  category: string;
  date: Date;
}

export function ExpenseSummary({ expenses }: { expenses: Expense[] }) {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const { toast } = useToast();
  const { amountsBlurred, toggleAmountsVisibility, verifyPin, isAuthenticated } = usePrivacy();
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getMonthlyExpenses = () => {
    return expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const getDailyExpenses = () => {
    return expenses.reduce((acc, expense) => {
      const day = new Date(expense.date).toLocaleString('default', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const getCategoryExpenses = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const getMonthCategoryExpenses = () => {
    return expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      const key = `${month} - ${expense.category}`;
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const handleToggleVisibility = () => {
    if (amountsBlurred) {
      setPinDialogOpen(true);
    } else {
      toggleAmountsVisibility();
      toast({
        description: "Amounts are now hidden",
      });
    }
  };

  const handleVerifyPin = () => {
    const isValid = verifyPin(pin);
    if (isValid) {
      setPinDialogOpen(false);
      setPin("");
      toast({
        title: "Success",
        description: "Amounts are now visible",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect PIN",
        variant: "destructive",
      });
      setPin("");
    }
  };

  const renderExpenseList = (data: Record<string, number>) => {
    return Object.entries(data).map(([key, amount]) => (
      <div key={key} className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{key}</span>
        <span className={`text-sm ${amountsBlurred ? "blur-sm select-none" : ""}`}>
          €{amount.toFixed(2)}
        </span>
      </div>
    ));
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Summary</h2>
        <Button
          onClick={handleToggleVisibility}
          variant="outline"
          size="icon"
          className="flex items-center justify-center"
          aria-label={amountsBlurred ? "Show amounts" : "Hide amounts"}
        >
          {amountsBlurred ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Expenses</span>
          <span className={`font-bold text-primary ${amountsBlurred ? "blur-sm select-none" : ""}`}>
            €{totalExpenses.toFixed(2)}
          </span>
        </div>
        <div className="h-px bg-gray-200 my-4" />
        
        <Tabs defaultValue="category" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="combined">Combined</TabsTrigger>
          </TabsList>
          
          <TabsContent value="category" className="space-y-2">
            {renderExpenseList(getCategoryExpenses())}
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-2">
            {renderExpenseList(getMonthlyExpenses())}
          </TabsContent>
          
          <TabsContent value="daily" className="space-y-2">
            {renderExpenseList(getDailyExpenses())}
          </TabsContent>
          
          <TabsContent value="combined" className="space-y-2">
            {renderExpenseList(getMonthCategoryExpenses())}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter PIN to View Amounts</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="text-center text-xl tracking-widest"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerifyPin();
                }
              }}
            />
            <Button onClick={handleVerifyPin}>Verify</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
