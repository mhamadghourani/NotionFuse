'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { notionService } from '@/services/NotionService';

const DatabaseContext = createContext();

export function DatabaseProvider({children}){
    const [databases, setDatabases] = useState([]);

useEffect(()=>{
    notionService.getDatabases().then(setDatabases).catch(console.error);
},[])
return (
    <DatabaseContext.Provider value={{databases, setDatabases}}>
        {children}
    </DatabaseContext.Provider>
)
}
export const useDatabases = () => useContext(DatabaseContext);