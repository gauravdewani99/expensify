import { Card } from "@/components/ui/card";

interface Expense {
  amount: number;
  category: string;
}

export function ExpenseSummary({ expenses }: { expenses: Expense[] }) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Expenses</span>
          <span className="font-bold text-primary">€{totalExpenses.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gray-200 my-4" />
        {Object.entries(categoryTotals).map(([category, amount]) => (
          <div key={category} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{category}</span>
            <span className="text-sm">€{amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}