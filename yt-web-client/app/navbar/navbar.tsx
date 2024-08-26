'use client';
import Image from "next/image";
import Link from "next/link";

import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import Upload from "./upload";


export default function Navbar() {
    // JS closure: state inside a function is maintained after a function finishes running
    // init user state
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });

        // cleanup subscription on unmount
        return () => unsubscribe();
    });

    return (
        <nav className={styles.nav}>
            <Link href="/">
                <Image width={90} height={20} 
                    src="/youtube-logo.svg" alt ="Youtube Logo"/>
            </Link>
            {
                user && <Upload /> // if first part is true (user logged in), 2nd part will execute
            }

            <SignIn user={user} />
        </nav>
    );
}