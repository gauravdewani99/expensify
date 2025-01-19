import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Expense {
  amount: number;
  category: string;
  date: Date;
}

export function ExpenseSummary({ expenses }: { expenses: Expense[] }) {
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

  const renderExpenseList = (data: Record<string, number>) => {
    return Object.entries(data).map(([key, amount]) => (
      <div key={key} className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{key}</span>
        <span className="text-sm">€{amount.toFixed(2)}</span>
      </div>
    ));
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Expenses</span>
          <span className="font-bold text-primary">€{totalExpenses.toFixed(2)}</span>
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
    </Card>
  );
}