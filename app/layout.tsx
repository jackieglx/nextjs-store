import type {Metadata} from "next";
import "./globals.css";
import Navbar from '@/components/navbar/Navbar';
import Container from '@/components/global/Container';
import Providers from "@/app/providers";
import {ClerkProvider} from '@clerk/nextjs';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: "Next.js Store",
    description: "A store built with Next.js",
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang='en' suppressHydrationWarning>
            <body className={inter.className}>
            <Providers>
                <Navbar/>
                <Container className='py-20'>
                    {children}
                </Container>
            </Providers>
            </body>
            </html>
        </ClerkProvider>
    );
}
