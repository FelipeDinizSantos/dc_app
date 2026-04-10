"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/interfaces/Usuario.interface";

type AuthContextType = {
    user: User | null;
    login: ({ email, senha }: { email: string; senha: string }) => Promise<User | null>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);

    const login = async ({ email, senha }: { email: string; senha: string }): Promise<User | null> => {
        const response = await fetch("/api/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) {
            throw new Error("Credenciais inválidas!");
        }

        await response.json();

        return await fetchUser();

    };

    const logout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
        } catch (e) {
            console.error("Erro ao limpar sessão local:", e);
        }

        setUser(null);
        router.push("/");
    };

    const fetchUser = async (): Promise<User | null> => {
        try {
            const res = await fetch(`/api/me`);

            if (res.status === 401) {
                setUser(null);
                return null;
            }

            const data = await res.json();
            setUser(data.usuario);
            return data.usuario;
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            setUser(null);
            router.push("/");
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);