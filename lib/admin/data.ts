import { put, get } from "@vercel/blob";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

const BLOB_FILE = "admin/transactions.json";

async function readData(): Promise<Transaction[]> {
  try {
    const blob = await get(BLOB_FILE);
    const res = await fetch(blob.url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function writeData(transactions: Transaction[]) {
  await put(BLOB_FILE, JSON.stringify(transactions), {
    contentType: "application/json",
  });
}

export async function getTransactions(): Promise<Transaction[]> {
  const transactions = await readData();
  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function addTransaction(
  tx: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  const existing = await readData();
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  existing.push(newTx);
  await writeData(existing);
  return newTx;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const existing = await readData();
  const idx = existing.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  existing.splice(idx, 1);
  await writeData(existing);
  return true;
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, "id" | "createdAt">>
): Promise<Transaction | null> {
  const existing = await readData();
  const tx = existing.find((t) => t.id === id);
  if (!tx) return null;
  Object.assign(tx, updates);
  await writeData(existing);
  return tx;
}

export async function getStats() {
  const transactions = await getTransactions();
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyIncome = thisMonth
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = thisMonth
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome: income,
    totalExpense: expense,
    balance,
    monthlyIncome,
    monthlyExpense,
    transactionCount: transactions.length,
  };
}
