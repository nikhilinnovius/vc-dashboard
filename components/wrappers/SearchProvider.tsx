// SearchProvider.tsx

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";


const DataContext = createContext<{ companies: any[], vcs: any[] }>({ companies: [], vcs: [] });

export const DataProvider = ({ children }: { children: React.ReactNode }) => {

  const [companies, setCompanies] = useState<any[]>([]);
  const [vcs, setVcs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // fetch vcs data using api/fetch-all-vcs
      const { vcs } = await fetch("/api/fetch-all-vcs").then(res => res.json());
      if (vcs) {
        setVcs(vcs.vcs);
      }

      // fetch companies data using api/fetch-all-companies
      const { companies } = await fetch("/api/fetch-all-companies").then(res => res.json());
      if (companies) {
        setCompanies(companies.companies);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ companies, vcs }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the search context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Create a search store for the data
