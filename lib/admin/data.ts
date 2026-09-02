import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface AdminData {
  transactions: Transaction[];
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), "data", "admin");
const DATA_FILE = path.join(DATA_DIR, "transactions.json");

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readData(): Promise<AdminData> {
  await ensureDataDir();
  if (!existsSync(DATA_FILE)) {
    const initial: AdminData = { transactions: [], lastUpdated: new Date().toISOString() };
    await writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeData(data: AdminData) {
  await ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await readData();
  return data.transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function addTransaction(
  tx: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  const data = await readData();
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.transactions.push(newTx);
  await writeData(data);
  return newTx;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const data = await readData();
  const idx = data.transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  data.transactions.splice(idx, 1);
  await writeData(data);
  return true;
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, "id" | "createdAt">>
): Promise<Transaction | null> {
  const data = await readData();
  const tx = data.transactions.find((t) => t.id === id);
  if (!tx) return null;
  Object.assign(tx, updates);
  await writeData(data);
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
