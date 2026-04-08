"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/interfaces/Usuario.interface";
import { fetchComAuth, setToken } from "@/lib/fetchComAuth";

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
        try {
            const response = await fetch("/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            });

            const data: { success: boolean; token: string; message?: any } = await response.json();

            if (!response.ok) {
                throw new Error("Credenciais inválidas!");
            }

            setToken(data.token);
            return await fetchUser();
        } catch (e: any) {
            throw new Error(e);
        }
    };

    const logout = async () => {
        try {
            await fetchComAuth("/api/laravel/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Erro ao fazer logout", e);
        } finally {
            try {
                await fetch("/api/logout", { method: "POST" });
            } catch (e) {
                console.error("Erro ao fazer logout", e);
            } finally {
                setUser(null);
                router.push("/");
            }
        }
    };

    const fetchUser = async (): Promise<User | null> => {
        try {
            const res = await fetchComAuth(`/api/laravel/auth/me`);

            if (res.status === 401) {
                setUser(null);
                return null;
            }

            const data = await res.json();
            setUser(data.usuario);
            return data.usuario;
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            logout();
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