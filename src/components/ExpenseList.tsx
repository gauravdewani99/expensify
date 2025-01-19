import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Expense {
  id: number;
  amount: number;
  category: string;
  description?: string;
  date: Date;
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
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
                {formatDistanceToNow(expense.date, { addSuffix: true })}
              </p>
            </div>
            <p className="font-semibold">${expense.amount.toFixed(2)}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}