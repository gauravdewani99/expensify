
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
  const [blurredItems, setBlurredItems] = useState<number[]>([]);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const shouldBlurDescription = (description?: string) => {
    if (!description) return false;
    const sensitiveTerms = ["coffee", "shop", "dessert"];
    return sensitiveTerms.some(term => 
      description.toLowerCase().includes(term.toLowerCase())
    );
  };

  const shouldBlurAmount = (amount: number) => {
    return amount > 50;
  };

  const isItemBlurred = (id: number) => {
    return blurredItems.includes(id);
  };

  const handleToggleBlur = (id: number) => {
    if (isItemBlurred(id)) {
      // If already blurred, ask for PIN to unblur
      setSelectedExpenseId(id);
      setPinDialogOpen(true);
    } else {
      // If not blurred, add to blurred items
      setBlurredItems(prev => [...prev, id]);
    }
  };

  const handleVerifyPin = () => {
    if (pin === "6930" && selectedExpenseId) {
      // Remove from blurred list to unblur
      setBlurredItems(prev => prev.filter(id => id !== selectedExpenseId));
      setPinDialogOpen(false);
      setPin("");
      toast({
        title: "Success",
        description: "Details are now visible",
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

  // Initialize blurred items based on conditions
  useState(() => {
    const initialBlurredItems = expenses
      .filter(expense => 
        shouldBlurDescription(expense.description) || 
        shouldBlurAmount(expense.amount)
      )
      .map(expense => expense.id);
    
    setBlurredItems(initialBlurredItems);
  }, [expenses]);

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const shouldBlur = isItemBlurred(expense.id);
        const isDescriptionSensitive = shouldBlurDescription(expense.description);
        const isAmountSensitive = shouldBlurAmount(expense.amount);
        
        return (
          <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{expense.category}</h3>
                {expense.description && (
                  <p className={`text-sm text-gray-500 ${shouldBlur && isDescriptionSensitive ? "blur-sm select-none" : ""}`}>
                    {expense.description}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${shouldBlur && isAmountSensitive ? "blur-sm select-none" : ""}`}>
                  €{expense.amount.toFixed(2)}
                </p>
                
                {(isDescriptionSensitive || isAmountSensitive) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleBlur(expense.id)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  >
                    {shouldBlur ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
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
        );
      })}

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter PIN to View Sensitive Details</DialogTitle>
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
