import { useState, useEffect } from 'react';
import { Product, Sale, Expense, BusinessProfile, ArchivedReport } from '../types';
import { getBaseName } from '../lib/productUtils';

export const useLocalStorage = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('silabaku_products');
    let data = [];
    if (saved) {
      try {
        data = JSON.parse(saved).map((p: any) => ({
          ...p,
          initialStock: p.initialStock ?? p.stock
        }));
      } catch (e) {
        data = [];
      }
    }

    // Monthly Cut-off Logic
    const lastMonth = localStorage.getItem('silabaku_last_month');
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    if (lastMonth && lastMonth !== currentMonth) {
      // Month has changed, perform cut-off
      
      // 1. Gather current month stats for archiving before reset
      const currentSalesSaved = localStorage.getItem('silabaku_sales');
      const currentExpensesSaved = localStorage.getItem('silabaku_expenses');
      
      const currentSales: Sale[] = currentSalesSaved ? JSON.parse(currentSalesSaved) : [];
      const currentExpenses: Expense[] = currentExpensesSaved ? JSON.parse(currentExpensesSaved) : [];
      
      const totalRevenue = currentSales.reduce((acc, s) => acc + s.totalAmount, 0);
      const totalCOGS = currentSales.reduce((acc, s) => acc + s.totalCost, 0);
      const totalExp = currentExpenses.reduce((acc, e) => acc + e.amount, 0);
      
      const newArchiveEntry: ArchivedReport = {
        month: lastMonth,
        totalRevenue,
        totalCOGS,
        totalExpenses: totalExp,
        netProfit: (totalRevenue - totalCOGS) - totalExp,
        salesCount: currentSales.length,
        expensesCount: currentExpenses.length
      };
      
      const existingArchiveSaved = localStorage.getItem('silabaku_archive');
      const existingArchive: ArchivedReport[] = existingArchiveSaved ? JSON.parse(existingArchiveSaved) : [];
      
      localStorage.setItem('silabaku_archive', JSON.stringify([newArchiveEntry, ...existingArchive]));

      // 2. Perform resets
      data = data.map((p: any) => ({
        ...p,
        initialStock: p.stock // Carry over remaining stock as initial for new month
      }));
      localStorage.setItem('silabaku_products', JSON.stringify(data));
      localStorage.setItem('silabaku_sales', '[]');
      localStorage.setItem('silabaku_expenses', '[]');
      localStorage.setItem('silabaku_last_month', currentMonth);
    } else if (!lastMonth) {
      localStorage.setItem('silabaku_last_month', currentMonth);
    }

    return data;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const lastMonth = localStorage.getItem('silabaku_last_month');
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (lastMonth && lastMonth !== currentMonth) return [];
    
    const saved = localStorage.getItem('silabaku_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const lastMonth = localStorage.getItem('silabaku_last_month');
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (lastMonth && lastMonth !== currentMonth) return [];

    const saved = localStorage.getItem('silabaku_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('silabaku_profile');
    return saved ? JSON.parse(saved) : {
      ownerName: '',
      businessName: '',
      address: '',
      logoUrl: ''
    };
  });

  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>(() => {
    const saved = localStorage.getItem('silabaku_archive');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('silabaku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('silabaku_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('silabaku_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('silabaku_profile', JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem('silabaku_archive', JSON.stringify(archivedReports));
  }, [archivedReports]);

  const reGradeAllProducts = (allProducts: Product[]) => {
    // Group products by baseName and sku
    const groups: Record<string, Product[]> = {};
    allProducts.forEach(p => {
      const key = `${getBaseName(p.name).toLowerCase()}|${p.sku.toLowerCase()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    const result: Product[] = [];
    Object.values(groups).forEach(group => {
      if (group.length > 1) {
        // Sort group by selling price descending
        const sorted = [...group].sort((a, b) => b.sellingPrice - a.sellingPrice);
        sorted.forEach((p, index) => {
          const grade = String.fromCharCode(65 + (index % 26));
          result.push({ ...p, name: `${getBaseName(p.name)} - Grade ${grade}` });
        });
      } else {
        // Single item group - remove grade suffix if exists
        result.push({ ...group[0], name: getBaseName(group[0].name) });
      }
    });

    return result;
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const cleanInputName = getBaseName(product.name).toLowerCase();
    const cleanInputSku = product.sku.toLowerCase();

    // Check for exact match in prices first to increment stock
    const exactMatch = products.find(p => 
      getBaseName(p.name).toLowerCase() === cleanInputName && 
      p.sku.toLowerCase() === cleanInputSku &&
      p.costPrice === product.costPrice && 
      p.sellingPrice === product.sellingPrice
    );

    if (exactMatch) {
      setProducts(products.map(p => 
        p.id === exactMatch.id 
          ? { 
              ...p, 
              stock: p.stock + product.stock, 
              initialStock: (p.initialStock ?? p.stock) + product.stock 
            } 
          : p
      ));
      return;
    }

    const newProduct = { 
      ...product, 
      id: crypto.randomUUID(),
      initialStock: product.stock 
    } as Product;
    setProducts(reGradeAllProducts([...products, newProduct]));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedList = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(reGradeAllProducts(updatedList));
  };

  const deleteProduct = (id: string) => {
    const filtered = products.filter(p => p.id !== id);
    setProducts(reGradeAllProducts(filtered));
  };

  const addSale = (
    items: { productId: string; quantity: number }[], 
    discountPercent: number = 0, 
    paymentMethod: 'tunai' | 'kredit' = 'tunai',
    customerName?: string,
    customerAddress?: string
  ) => {
    let currentProducts = [...products];
    let subtotal = 0;
    let totalCost = 0;
    
    try {
      const saleItems = items.map(item => {
        const pIndex = currentProducts.findIndex(p => p.id === item.productId);
        if (pIndex === -1) throw new Error('Produk tidak ditemukan');
        
        const product = currentProducts[pIndex];
        if (product.stock < item.quantity) {
          throw new Error(`Stok ${product.name} tidak mencukupi`);
        }
 
        subtotal += product.sellingPrice * item.quantity;
        totalCost += product.costPrice * item.quantity;
 
        // Update the product in our local array
        currentProducts[pIndex] = {
          ...product,
          stock: product.stock - item.quantity
        };
 
        return {
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          priceAtSale: product.sellingPrice,
          costAtSale: product.costPrice
        };
      });
 
      const discountAmount = (subtotal * discountPercent) / 100;
      const finalAmount = subtotal - discountAmount;
 
      const newSale: Sale = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        items: saleItems,
        totalAmount: finalAmount,
        totalCost,
        paymentMethod,
        discount: discountAmount,
        customerName,
        customerAddress
      };

      setProducts(currentProducts);
      setSales(prev => [...prev, newSale]);
    } catch (error) {
      throw error;
    }
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  return {
    products,
    sales,
    expenses,
    businessProfile,
    archivedReports,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    addExpense,
    deleteExpense,
    updateExpense,
    updateBusinessProfile: setBusinessProfile,
    resetAllData: () => {
      setProducts([]);
      setSales([]);
      setExpenses([]);
      setArchivedReports([]);
      setBusinessProfile({
        ownerName: '',
        businessName: '',
        address: '',
        logoUrl: ''
      });
      localStorage.removeItem('silabaku_products');
      localStorage.removeItem('silabaku_sales');
      localStorage.removeItem('silabaku_expenses');
      localStorage.removeItem('silabaku_profile');
      localStorage.removeItem('silabaku_archive');
      localStorage.removeItem('silabaku_last_month');
    }
  };
};
