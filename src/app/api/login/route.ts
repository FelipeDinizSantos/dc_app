import { NextResponse } from 'next/server';

// Criado separado do proxy original para poder salvar o token de autenticacao nos cookies!
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Erro ao autenticar' }, { status: res.status });
        }

        const response = NextResponse.json({ success: true, token: data.token });

        // Token com 1 dias de validade
        response.cookies.set('auth_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, 
            sameSite: 'strict',
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}