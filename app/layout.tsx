import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <header>
            <Show when={"signed-in"}>
              <UserButton />
            </Show>

            <Show when={"signed-out"}>
              <SignInButton>Sign in</SignInButton>
              <SignUpButton>Sign up</SignUpButton>
            </Show>
          </header>

          <Show when="signed-out">Page</Show>

          <Show when={"signed-in"}>{children}</Show>
        </ClerkProvider>
      </body>
    </html>
  );
}
