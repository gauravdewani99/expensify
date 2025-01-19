import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Other",
];

export function ExpenseForm({ onAddExpense }: { onAddExpense: (expense: any) => void }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(),
    };

    onAddExpense(expense);
    setAmount("");
    setCategory("");
    setDescription("");

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
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <Button type="submit" className="w-full">
        Add Expense
      </Button>
    </form>
  );
}