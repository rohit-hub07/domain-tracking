import { NextRequest,NextResponse } from "next/server";

// export function proxy(request: NextRequest) {
//   const path = request.nextUrl.pathname;
//   console.log("path inside of middleware: ", path);
//   const pathName = path === "/login" || path === "/signup" || path === "/home"

//   const token = request.cookies.get('token')?.value || ''
//   if (pathName && token) {
//     return NextResponse.redirect(new URL("/home", request.nextUrl))
//   }
//   if (!pathName && !token) {
//     return NextResponse.redirect(new URL("/login", request.nextUrl));
//   }
// }

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedPath = path.includes("/domain") || path.includes("/api/domain/add") || path.includes("/api/domain/delete") || path.includes("/api/domain/show");

  const token = request.cookies.get('token')?.value || ''

  if (protectedPath && !token) {
    
    // const loginIssue = new URL("/login", request.url);
    // loginIssue.searchParams.set("reason", "auth");

    // return NextResponse.redirect(loginIssue);    
    return NextResponse.json({
      message: "You are not authorize to perform this action!",
      success: false,
    },{status: 403})
  }

  return NextResponse.next();
}

interface MiddlewareConfig {
  matcher: string[];
}

export const config: MiddlewareConfig = {
  matcher: [
    "/domain",
    "/api/domain/add",
    "/api/domain/delete",
    "/api/domain/show",
    "/user/signup"
  ]
}