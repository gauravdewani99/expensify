
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePrivacy } from "@/contexts/PrivacyContext";

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
  const { amountsBlurred } = usePrivacy();
  
  const shouldBlurAmount = (amount: number) => {
    return amountsBlurred && amount > 50;
  };

  const shouldBlurDescription = (description?: string) => {
    if (!description || !amountsBlurred) return false;
    
    const lowerDesc = description.toLowerCase();
    return lowerDesc.includes("coffee") || 
           lowerDesc.includes("shop") || 
           lowerDesc.includes("dessert");
  };

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{expense.category}</h3>
              {expense.description && (
                <p className={`text-sm text-gray-500 ${shouldBlurDescription(expense.description) ? "blur-sm select-none" : ""}`}>
                  {expense.description}
                </p>
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
    </div>
  );
}
