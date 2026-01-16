import { createContext, useContext, useState } from "react";

type NotificationContextType = {
    count: number;
    setCount: (n: number) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [count, setCount] = useState(0);

    return (
        <NotificationContext.Provider value={{ count, setCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
    return ctx;
};
