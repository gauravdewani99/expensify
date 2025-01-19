import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  return (
    <div className="space-y-4">
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
              <p className="font-semibold">€{expense.amount.toFixed(2)}</p>
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