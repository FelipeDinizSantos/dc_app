import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;
    console.log(token);

    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};