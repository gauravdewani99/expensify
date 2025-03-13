
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Expense {
  id: number;
  amount: number;
  category: string;
  description?: string;
  date: Date;
}

export function ExpenseList({ 
  expenses,
  onDeleteExpense
}: { 
  expenses: Expense[];
  onDeleteExpense?: (id: number) => void;
}) {
  const [amountsBlurred, setAmountsBlurred] = useState(true);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handleVerifyPin = () => {
    if (pin === "6930") {
      setAmountsBlurred(false);
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

  const toggleAmountsVisibility = () => {
    if (amountsBlurred) {
      setPinDialogOpen(true);
    } else {
      setAmountsBlurred(true);
      toast({
        description: "Amounts are now hidden",
      });
    }
  };

  const shouldBlurAmount = (amount: number) => {
    return amountsBlurred && amount > 50;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Button
          onClick={toggleAmountsVisibility}
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
      
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{expense.category}</h3>
              {expense.description && (
                <p className="text-sm text-gray-500">{expense.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${shouldBlurAmount(expense.amount) ? "blur-sm select-none" : ""}`}>
                €{expense.amount.toFixed(2)}
              </p>
              {onDeleteExpense && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

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
    </div>
  );
}
