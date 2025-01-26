import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const categories = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Groceries",
  "Other",
];

export function ExpenseForm({ onAddExpense }: { onAddExpense: (expense: any) => void }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [dateInput, setDateInput] = useState("");
  const { toast } = useToast();

  const validateDate = (dateStr: string): Date | null => {
    // Check format
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return null;
    }

    const [day, month, year] = dateStr.split('-').map(Number);

    // Validate ranges
    if (
      day < 1 || day > 31 ||
      month < 1 || month > 12 ||
      year < 2000 || year > 2100
    ) {
      return null;
    }

    // Create date object (month - 1 because JS months are 0-based)
    const date = new Date(year, month - 1, day);

    // Check if it's a valid date (e.g., not 31st of February)
    if (
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !dateInput) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const validatedDate = validateDate(dateInput);
    if (!validatedDate) {
      toast({
        title: "Error",
        description: "Please enter a valid date in DD-MM-YYYY format",
        variant: "destructive",
      });
      return;
    }

    const expense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      description,
      date: validatedDate,
    };

    onAddExpense(expense);
    setAmount("");
    setCategory("");
    setDescription("");
    setDateInput("");

    toast({
      title: "Success",
      description: "Expense added successfully",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <Input
          type="number"
          placeholder="Amount (€)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            type="button"
            variant={category === cat ? "default" : "outline"}
            onClick={() => setCategory(cat)}
            className="whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Date (DD-MM-YYYY)"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full">
        Add Expense
      </Button>
    </form>
  );
}